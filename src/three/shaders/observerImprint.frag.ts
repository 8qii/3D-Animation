export const observerImprintFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Glowing core with celestial halo
    float core = exp(-dist * dist * 32.0);
    float halo = exp(-dist * dist * 8.0) * 0.45;
    float intensity = core + halo;

    gl_FragColor = vec4(vColor * (1.2 + core * 0.8), vAlpha * intensity);
  }
`;
