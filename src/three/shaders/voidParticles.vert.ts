export const voidParticlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uMouseWorld;
  uniform float uAttention;
  uniform float uExcitation;
  uniform float uBreathPhase;
  uniform float uTransition; // Cross-scene transition progress [0..1]

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;
  varying float vExcitation;
  varying float vInfluence;
  varying float vTransition;

  void main() {
    vUv = uv;
    vPhase = aPhase;
    vExcitation = uExcitation;
    vTransition = uTransition;

    // 1. Thermodynamic kinetic acceleration based on scroll energy & transition
    float effectiveSpeed = aSpeed * (1.0 + uExcitation * 2.2 + uTransition * 1.8);

    // 2. Slow Brownian-like micro-drift on GPU
    vec3 brownianOffset;
    brownianOffset.x = sin(uTime * 0.06 * effectiveSpeed + aPhase * 6.28318) * 0.35
                     + cos(uTime * 0.03 + aPhase * 3.14) * 0.15;
    brownianOffset.y = cos(uTime * 0.05 * effectiveSpeed + aPhase * 4.71238) * 0.30
                     + sin(uTime * 0.025 + aPhase * 2.71) * 0.12;
    brownianOffset.z = sin(uTime * 0.04 * effectiveSpeed + aPhase * 5.12345) * 0.25;

    // Subtle synchronized breathing pulse
    brownianOffset *= (0.85 + uBreathPhase * 0.30);

    // Singularity Gravitational Inflow: particles gently contract inward during transition
    vec3 basePos = aOffset * (1.0 - uTransition * 0.35) + brownianOffset;

    // 3. Observer Gravitational Influence Field & Swirl
    vec3 toMouse = uMouseWorld - basePos;
    float distToMouse = length(toMouse.xy);

    float influence = exp(-distToMouse * distToMouse / 5.5) * (0.35 + uAttention * 0.95);
    vInfluence = clamp(influence, 0.0, 1.0);

    vec3 radialForce = normalize(vec3(toMouse.xy, 0.0)) * influence * 0.85;

    vec3 swirlForce = vec3(-toMouse.y, toMouse.x, 0.0);
    float swirlLen = length(swirlForce);
    if (swirlLen > 0.001) {
      swirlForce = (swirlForce / swirlLen) * influence * 0.55;
    }

    vec3 worldCenter = basePos + radialForce + swirlForce;

    vec4 mvCenter = modelViewMatrix * vec4(worldCenter, 1.0);
    vDepth = -mvCenter.z;

    // Dynamic bokeh sizing
    float focalDistance = 7.0 - uTransition * 1.5;
    float defocus = abs(vDepth - focalDistance) * 0.08;
    float expansion = 1.0 + vInfluence * 0.65 + uExcitation * 0.85 + uTransition * 0.45;
    float bokehSize = aScale * (0.042 + defocus * 0.065) * expansion;

    vec3 billboardingVertex = mvCenter.xyz + vec3(position.xy * bokehSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingVertex, 1.0);
  }
`;
