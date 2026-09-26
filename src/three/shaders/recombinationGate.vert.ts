export const recombinationGateVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uGateAperture;
  uniform float uGateActivation;
  uniform float uBreathPhase;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vRadius;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;
    float r = length(pos.xy);
    vRadius = r;

    // Harmonic golden-ratio toroidal ripple
    float phiWave = sin(r * 16.1803 - uTime * 2.0 + uBreathPhase * 6.28318);
    float displacement = phiWave * 0.035 * (0.4 + uGateActivation * 0.6);
    pos.z += displacement;

    // Aperture dilation at the gate core
    float apertureExpansion = smoothstep(0.0, 1.0, uGateAperture);
    if (r < 1.2) {
      pos.xy *= (1.0 + apertureExpansion * 0.35);
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
