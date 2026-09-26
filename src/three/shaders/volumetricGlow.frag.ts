export const volumetricGlowFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathPhase;
  uniform float uExcitation;

  varying vec2 vUv;

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    if (dist > 1.0) {
      discard;
    }

    // Volumetric photon scattering falloff
    float scatter = exp(-dist * dist * 3.8);

    // Subtle breathing expansion
    float breathScale = 0.8 + uBreathPhase * 0.4 + uExcitation * 0.5;

    // Atmospheric noise striations (simulating subtle dust shaft rays)
    float angle = atan(centered.y, centered.x);
    float rays = sin(angle * 12.0 + uTime * 0.05) * 0.08
               + cos(angle * 24.0 - uTime * 0.03) * 0.04;

    vec3 indigoHaze = vec3(0.04, 0.09, 0.22);
    vec3 cyanGlow   = vec3(0.20, 0.55, 0.85);

    vec3 color = mix(indigoHaze, cyanGlow, scatter * 0.7);

    // Ultra-soft ethereal opacity (never overwhelming the void)
    float alpha = scatter * (0.045 + rays) * breathScale * (1.0 - dist);
    alpha = clamp(alpha, 0.0, 0.22);

    gl_FragColor = vec4(color, alpha);
  }
`;
