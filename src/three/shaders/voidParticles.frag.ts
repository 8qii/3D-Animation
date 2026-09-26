export const voidParticlesFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathPhase;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;
  varying float vExcitation;
  varying float vInfluence;
  varying float vTransition;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0) {
      discard;
    }

    // Soft Gaussian bokeh disc falloff
    float bokehDisc = exp(-dist * dist * 6.5);

    // Subtle optical ring diffraction when excited or transitioning
    float excitationTotal = clamp(vExcitation + vTransition * 0.6, 0.0, 1.0);
    float diffractionRing = sin(dist * 3.14159) * excitationTotal * 0.35;
    bokehDisc += diffractionRing;

    // Depth attenuation
    float depthFade = smoothstep(16.0, 4.0, vDepth) * smoothstep(1.5, 3.5, vDepth);

    // Dynamic scintillation: accelerates when observed or transitioning
    float twinkleSpeed = 0.4 + vInfluence * 2.2 + vExcitation * 3.0 + vTransition * 2.5;
    float twinkle = sin(uTime * twinkleSpeed + vPhase * 10.0) * 0.25 + 0.85;

    // Palette Definitions
    vec3 colIdleCyan    = vec3(0.35, 0.75, 0.98); // IDLE
    vec3 colIdleViolet  = vec3(0.65, 0.50, 0.98); // IDLE
    vec3 colObserved    = vec3(0.20, 0.95, 1.00); // OBSERVED (Electric Cyan)
    vec3 colAwakened    = vec3(1.00, 0.68, 0.15); // AWAKENED (Solar Amber)
    vec3 colCoreWhite   = vec3(0.98, 0.99, 1.00);

    // 1. Base IDLE palette blend
    vec3 baseColor = mix(colIdleCyan, colIdleViolet, vPhase);

    // 2. Transition to OBSERVED state
    baseColor = mix(baseColor, colObserved, vInfluence * 0.85);

    // 3. Transition to AWAKENED / Singularity state
    baseColor = mix(baseColor, colAwakened, clamp(vExcitation * 0.75 + vTransition * 0.65, 0.0, 1.0));

    // Super-radiant center highlight
    baseColor = mix(baseColor, colCoreWhite, pow(bokehDisc, 2.5) * (0.4 + vInfluence * 0.4 + vExcitation * 0.5 + vTransition * 0.4));

    // Dynamic Alpha Modulation across states
    float baseAlpha = 0.22 + vPhase * 0.35;
    float observedAlpha = baseAlpha + vInfluence * 0.50;
    float awakenedAlpha = observedAlpha + vExcitation * 0.35 + vTransition * 0.25;

    // Breathing universe synchronization
    float breathMod = 0.85 + uBreathPhase * 0.25;

    float alpha = bokehDisc * depthFade * twinkle * awakenedAlpha * breathMod;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(baseColor, alpha);
  }
`;
