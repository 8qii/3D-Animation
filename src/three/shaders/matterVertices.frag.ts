export const matterVerticesFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAttention;

  varying vec2 vUv;
  varying float vAwakeProgress;
  varying float vShockwave;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0 || vAwakeProgress <= 0.005) {
      discard;
    }

    // High intensity Gaussian core
    float core = exp(-dist * dist * 14.0);
    float halo = exp(-dist * 4.5);

    // Dynamic pulse
    float pulse = sin(uTime * 4.0) * 0.15 + 0.85;

    // Expanding shockwave ripple ring on awakening
    float shockRing = exp(-pow(dist - vAwakeProgress * 0.75, 2.0) * 28.0) * vShockwave;

    // Palette: Gold/Amber core with diamond white flash on shockwave
    vec3 colGold      = vec3(0.98, 0.75, 0.15); // #fbbf24
    vec3 colAmber     = vec3(0.96, 0.55, 0.08); // #f59e0b
    vec3 colCyan      = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colPureWhite = vec3(1.0);

    vec3 color = mix(colCyan, colAmber, core);
    color = mix(color, colGold, vAwakeProgress);

    // Shockwave ignition flash
    color += colPureWhite * (pow(core, 2.0) * (2.0 + vShockwave * 3.5));
    color += colCyan * shockRing * 2.0;

    float alpha = (core * 1.5 + halo * 0.6 + shockRing * 0.9) * pulse * vAwakeProgress;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;
