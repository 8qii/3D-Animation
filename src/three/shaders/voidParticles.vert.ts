export const voidParticlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;

  void main() {
    vUv = uv;
    vPhase = aPhase;

    // Slow, multi-octave Brownian-like micro-drift on GPU
    vec3 brownianOffset;
    brownianOffset.x = sin(uTime * 0.06 * aSpeed + aPhase * 6.28318) * 0.35
                     + cos(uTime * 0.03 + aPhase * 3.14) * 0.15;
    brownianOffset.y = cos(uTime * 0.05 * aSpeed + aPhase * 4.71238) * 0.30
                     + sin(uTime * 0.025 + aPhase * 2.71) * 0.12;
    brownianOffset.z = sin(uTime * 0.04 * aSpeed + aPhase * 5.12345) * 0.25;

    vec3 worldCenter = aOffset + brownianOffset;

    // Camera view transform of instance center
    vec4 mvCenter = modelViewMatrix * vec4(worldCenter, 1.0);
    vDepth = -mvCenter.z;

    // Camera-facing billboarding: scale quad in camera view plane
    // Soft bokeh size calculation based on distance from focal plane (focal plane ~ 7.0)
    float focalDistance = 7.0;
    float defocus = abs(vDepth - focalDistance) * 0.08;
    float bokehSize = aScale * (0.045 + defocus * 0.06);

    vec3 billboardingVertex = mvCenter.xyz + vec3(position.xy * bokehSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingVertex, 1.0);
  }
`;
