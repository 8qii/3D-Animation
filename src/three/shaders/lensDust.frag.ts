export const lensDustFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying float vPhase;
  varying float vBokehSize;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0; // [0, 1]

    if (dist > 1.0) {
      discard;
    }

    // Soft out-of-focus bokeh disc with subtle catadioptric / lens rim density
    float softEdge = smoothstep(1.0, 0.4, dist);
    float rimEmphasis = smoothstep(0.5, 0.95, dist) * 0.35;
    float disc = (softEdge + rimEmphasis);

    // Subtle lens tint (starlight cyan to warm optical striae)
    vec3 color = mix(vec3(0.55, 0.85, 1.0), vec3(0.85, 0.92, 1.0), vPhase);

    // Very subtle, ethereal opacity
    float alpha = disc * (0.05 + vPhase * 0.12);

    gl_FragColor = vec4(color, alpha);
  }
`;
