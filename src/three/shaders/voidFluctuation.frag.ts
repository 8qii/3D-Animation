export const voidFluctuationFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathPhase;
  uniform float uExcitation;
  uniform float uAttention;
  uniform vec3 uColorCore;
  uniform vec3 uColorAura;

  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    if (dist > 1.0) {
      discard;
    }

    // 1. Synchronized Universal Breathing Modulation [0..1]
    float breathMod = mix(0.80, 1.25, uBreathPhase);

    // 2. Kinetic Scroll Excitation Surge (widens halo and flares luminance)
    float excitationHalo = uExcitation * 0.45;
    float excitationCore = uExcitation * 1.50;

    // 3. Observer Attention Resonance: subtle warm solar tint when focused
    vec3 solarAccent = vec3(1.0, 0.78, 0.35);
    vec3 activeAuraColor = mix(uColorAura, solarAccent, uAttention * 0.35);

    // Micro quantum noise shimmer
    float noise = hash(vUv * 10.0 + fract(uTime * 0.02)) * 0.035;

    // Multi-tier radial Gaussian luminescence
    float coreSharp = exp(-dist * dist * 32.0 * (1.8 - uBreathPhase * 0.4));
    float auraSoft  = exp(-dist * dist * (4.2 - excitationHalo * 2.0));
    float haloWide  = exp(-dist * (2.8 - excitationHalo));

    // Color gradient composition
    vec3 color = mix(activeAuraColor, uColorCore, coreSharp);

    // Super-radiant white center boosted by kinetic scroll energy
    color += vec3(1.0) * pow(coreSharp, 2.0) * (1.5 + excitationCore);

    // Composite alpha with synchronized breath and excitation
    float alpha = (coreSharp * 1.3 + auraSoft * 0.65 + haloWide * 0.30 + noise) * breathMod;
    alpha += uExcitation * 0.25;
    alpha = clamp(alpha, 0.0, 1.0);

    // Smooth boundary falloff to absolute void
    alpha *= smoothstep(1.0, 0.4, dist);

    gl_FragColor = vec4(color, alpha);
  }
`;
