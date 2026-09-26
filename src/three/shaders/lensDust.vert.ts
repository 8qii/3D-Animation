export const lensDustVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vPhase;
  varying float vBokehSize;

  void main() {
    vUv = uv;
    vPhase = aPhase;

    // Extremely slow, lazy organic drift across the lens glass
    vec3 drift;
    drift.x = sin(uTime * 0.025 * aSpeed + aPhase * 6.28318) * 0.45;
    drift.y = cos(uTime * 0.020 * aSpeed + aPhase * 3.14159) * 0.35;
    drift.z = sin(uTime * 0.015 + aPhase * 4.5) * 0.15;

    vec3 worldPos = aOffset + drift;

    // Camera view transform
    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);

    // Large, soft, hyper-defocused foreground bokeh discs
    float bokehSize = aScale * 0.18 * (1.0 + sin(uTime * 0.1 + aPhase * 2.0) * 0.1);
    vBokehSize = bokehSize;

    // Camera-facing billboarding
    vec3 billboardingPos = mvPos.xyz + vec3(position.xy * bokehSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingPos, 1.0);
  }
`;
