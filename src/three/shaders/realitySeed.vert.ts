export const realitySeedVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uCompression;
  uniform float uPersonalFreq;
  uniform float uBreathPhase;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // High-frequency quantum jitter under intense gravitational compression
    float freqScalar = uPersonalFreq * 0.02;
    float jitter = sin(uTime * 35.0 + position.x * 20.0) * cos(uTime * 42.0 + position.y * 20.0) * 0.015 * uCompression;

    // Cosmic breath micro-pulsation
    float breathDilation = 1.0 + sin(uBreathPhase * 6.2831853) * 0.04;

    vec3 displacedPosition = position * breathDilation + normal * jitter;
    vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
