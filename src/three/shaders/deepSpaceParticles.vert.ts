export const deepSpaceVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vPhase;
  varying float vDepth;

  void main() {
    vUv = uv;
    vPhase = aPhase;

    // Slow majestic celestial drift across parsecs
    vec3 drift;
    drift.x = sin(uTime * 0.012 * aSpeed + aPhase * 6.28318) * 0.25;
    drift.y = cos(uTime * 0.009 * aSpeed + aPhase * 3.14159) * 0.20;
    drift.z = sin(uTime * 0.007 + aPhase * 5.0) * 0.15;

    vec3 worldPos = aOffset + drift;

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    vDepth = -mvPos.z;

    // Small distant point size with perspective attenuation
    float pointSize = aScale * (0.018 + 0.035 / (vDepth * 0.15));

    vec3 billboardingPos = mvPos.xyz + vec3(position.xy * pointSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingPos, 1.0);
  }
`;
