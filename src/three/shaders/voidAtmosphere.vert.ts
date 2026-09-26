export const voidAtmosphereVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Render behind all other elements at maximum depth
    vec4 pos = vec4(position.xy, 0.9999, 1.0);
    gl_Position = pos;
  }
`;
