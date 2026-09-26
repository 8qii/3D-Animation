export const voidFluctuationVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    // Subtle micro-organic breathing pulsation
    float pulse = sin(uTime * 0.314159) * 0.05 + cos(uTime * 0.15) * 0.03;
    vec3 transformed = position * (1.0 + pulse);

    // Billboarding: face camera plane while retaining position
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
