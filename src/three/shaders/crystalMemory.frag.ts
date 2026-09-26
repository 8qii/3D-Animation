export const crystalMemoryFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vLayer;

  void main() {
    // Soft circular Gaussian point particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Layer-specific edge profile
    float sharpness = vLayer > 1.5 ? 24.0 : 16.0;
    float core = exp(-dist * dist * sharpness);
    float halo = exp(-dist * dist * 6.0) * 0.35;
    float intensity = core + halo;

    // Discovery principle: memory should be discovered, not announced
    gl_FragColor = vec4(vColor * (1.0 + core * 0.8), vAlpha * intensity);
  }
`;
