export const voidParticlesFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0; // [0, 1]

    if (dist > 1.0) {
      discard;
    }

    // Soft Gaussian bokeh disc falloff
    float bokehDisc = exp(-dist * dist * 6.5);

    // Depth attenuation (fade in near/far clipping extremes)
    float depthFade = smoothstep(16.0, 4.0, vDepth) * smoothstep(1.5, 3.5, vDepth);

    // Micro-luminance scintillation (slow twinkling)
    float twinkle = sin(uTime * 0.4 + vPhase * 10.0) * 0.2 + 0.8;

    // Palette: cool starlight cyan, soft violet, starlight white
    vec3 cyanColor   = vec3(0.35, 0.75, 0.98);
    vec3 violetColor = vec3(0.65, 0.50, 0.98);
    vec3 whiteColor  = vec3(0.95, 0.98, 1.0);

    vec3 tint = mix(cyanColor, violetColor, vPhase);
    tint = mix(tint, whiteColor, bokehDisc * 0.5);

    float alpha = bokehDisc * depthFade * twinkle * (0.2 + vPhase * 0.45);

    gl_FragColor = vec4(tint, alpha);
  }
`;
