export const matterVerticesFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAttention;

  varying vec2 vUv;
  varying float vProgress;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0 || vProgress <= 0.001) {
      discard;
    }

    // High intensity Gaussian core
    float core = exp(-dist * dist * 12.0);
    float halo = exp(-dist * 4.0);

    // Dynamic pulse
    float pulse = sin(uTime * 4.0) * 0.15 + 0.85;

    // Palette: Gold/Amber core with electric cyan corona
    vec3 colGold = vec3(0.98, 0.75, 0.15);  // #fbbf24
    vec3 colCyan = vec3(0.22, 0.74, 0.97);  // #38bdf8
    vec3 colWhite = vec3(1.0);

    vec3 color = mix(colCyan, colGold, core);
    color += colWhite * pow(core, 2.5) * 2.0;

    float alpha = (core * 1.5 + halo * 0.6) * pulse * vProgress;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;
