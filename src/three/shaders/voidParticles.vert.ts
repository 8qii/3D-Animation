export const voidParticlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uMouseWorld;
  uniform float uAttention;
  uniform float uExcitation;
  uniform float uBreathPhase;

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;
  varying float vExcitation;
  varying float vInfluence;

  void main() {
    vUv = uv;
    vPhase = aPhase;
    vExcitation = uExcitation;

    // 1. Thermodynamic kinetic acceleration based on scroll energy
    float effectiveSpeed = aSpeed * (1.0 + uExcitation * 2.2);

    // 2. Slow Brownian-like micro-drift on GPU
    vec3 brownianOffset;
    brownianOffset.x = sin(uTime * 0.06 * effectiveSpeed + aPhase * 6.28318) * 0.35
                     + cos(uTime * 0.03 + aPhase * 3.14) * 0.15;
    brownianOffset.y = cos(uTime * 0.05 * effectiveSpeed + aPhase * 4.71238) * 0.30
                     + sin(uTime * 0.025 + aPhase * 2.71) * 0.12;
    brownianOffset.z = sin(uTime * 0.04 * effectiveSpeed + aPhase * 5.12345) * 0.25;

    // Subtle synchronized breathing pulse
    brownianOffset *= (0.85 + uBreathPhase * 0.30);

    vec3 initialPos = aOffset + brownianOffset;

    // 3. Observer Gravitational Influence Field & Swirl
    vec3 toMouse = uMouseWorld - initialPos;
    float distToMouse = length(toMouse.xy); // Radial distance on front projection

    // Influence envelope (radius ~ 4.2 units with smooth Gaussian decay)
    float influence = exp(-distToMouse * distToMouse / 5.5) * (0.35 + uAttention * 0.95);
    vInfluence = clamp(influence, 0.0, 1.0);

    // Attractive radial force vector
    vec3 radialForce = normalize(vec3(toMouse.xy, 0.0)) * influence * 0.85;

    // Tangential orbital swirl force (perpendicular vector)
    vec3 swirlForce = vec3(-toMouse.y, toMouse.x, 0.0);
    float swirlLen = length(swirlForce);
    if (swirlLen > 0.001) {
      swirlForce = (swirlForce / swirlLen) * influence * 0.55;
    }

    // Displaced world coordinate under observer gravity
    vec3 worldCenter = initialPos + radialForce + swirlForce;

    // Camera view transform of instance center
    vec4 mvCenter = modelViewMatrix * vec4(worldCenter, 1.0);
    vDepth = -mvCenter.z;

    // Dynamic bokeh sizing: expands when observed (attention) or awakened (excitation)
    float focalDistance = 7.0;
    float defocus = abs(vDepth - focalDistance) * 0.08;
    float expansion = 1.0 + vInfluence * 0.65 + uExcitation * 0.85;
    float bokehSize = aScale * (0.042 + defocus * 0.065) * expansion;

    vec3 billboardingVertex = mvCenter.xyz + vec3(position.xy * bokehSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingVertex, 1.0);
  }
`;
