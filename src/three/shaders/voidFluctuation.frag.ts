export const voidFluctuationFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathPhase;
  uniform float uExcitation;
  uniform float uAttention;
  uniform float uTransition; // Cross-scene transition progress [0..1]
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

    // 2. Kinetic Scroll Excitation Surge
    float excitationHalo = uExcitation * 0.45;
    float excitationCore = uExcitation * 1.50;

    // 3. Cross-Scene Singularity Contraction
    // Core radius contracts from diffuse vacuum glow into an ultra-dense singularity point
    float contractionFactor = 1.0 + uTransition * 2.2;
    float contractedDist = dist * contractionFactor;

    // 4. Color Metamorphosis across scenes:
    // Act I: Cyan Aura -> Act II: Dense Solar Amber Singularity
    vec3 solarAmber = vec3(1.0, 0.65, 0.12);
    vec3 solarCore  = vec3(1.0, 0.92, 0.60);
    vec3 activeAura = mix(uColorAura, solarAmber, uTransition * 0.90 + uAttention * 0.25);
    vec3 activeCore = mix(uColorCore, solarCore, uTransition * 0.95);

    // Micro quantum noise shimmer
    float noise = hash(vUv * 10.0 + fract(uTime * 0.02)) * 0.035;

    // Multi-tier radial Gaussian luminescence with contraction
    float coreSharp = exp(-contractedDist * contractedDist * 32.0 * (1.8 - uBreathPhase * 0.4));
    float auraSoft  = exp(-dist * dist * (4.2 - excitationHalo * 2.0 + uTransition * 3.0));
    float haloWide  = exp(-dist * (2.8 - excitationHalo + uTransition * 1.5));

    // Color gradient composition
    vec3 color = mix(activeAura, activeCore, coreSharp);

    // Super-radiant white center boosted by kinetic scroll energy and transition ignition
    float ignitionBoost = pow(sin(uTransition * 3.14159), 2.0) * 2.5;
    color += vec3(1.0) * pow(coreSharp, 2.0) * (1.5 + excitationCore + ignitionBoost);

    // Composite alpha with synchronized breath and transition
    float alpha = (coreSharp * (1.4 + uTransition * 0.8) + auraSoft * 0.65 + haloWide * 0.30 + noise) * breathMod;
    alpha += uExcitation * 0.25;
    alpha = clamp(alpha, 0.0, 1.0);

    // Smooth boundary falloff to absolute void
    alpha *= smoothstep(1.0, 0.35, dist);

    gl_FragColor = vec4(color, alpha);
  }
`;
