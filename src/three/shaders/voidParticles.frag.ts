export const voidParticlesFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathPhase;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;
  varying float vExcitation;
  varying float vInfluence;
  varying float vTransition;
  varying float vMorphStage; // [0..3]

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0) {
      discard;
    }

    // Soft Gaussian bokeh disc falloff
    float bokehDisc = exp(-dist * dist * 6.5);

    // Subtle optical ring diffraction when excited
    float diffractionRing = sin(dist * 3.14159) * (0.2 + vExcitation * 0.4);
    bokehDisc += diffractionRing;

    // Depth attenuation
    float depthFade = smoothstep(16.0, 4.0, vDepth) * smoothstep(1.5, 3.5, vDepth);

    // Dynamic scintillation: stabilizes into harmonic rhythm as structure awakens
    float twinkleSpeed = mix(
      0.4 + vInfluence * 2.2 + vExcitation * 3.0 + vTransition * 2.5,
      1.5,
      clamp(vMorphStage / 3.0, 0.0, 1.0)
    );
    float twinkle = sin(uTime * twinkleSpeed + vPhase * (10.0 - clamp(vMorphStage * 2.5, 0.0, 8.0))) * 0.25 + 0.85;

    // Palette Definitions across the 4 Genesis Stages
    vec3 colChaosCyan     = vec3(0.35, 0.75, 0.98); // Stage 0: Chaos
    vec3 colOrbitalGold   = vec3(0.98, 0.75, 0.15); // Stage 1: Keplerian Orbit
    vec3 colVertexAmber   = vec3(0.96, 0.55, 0.08); // Stage 2: Golden Ratio Vertices
    vec3 colSurfacePrism  = vec3(0.85, 0.92, 1.00); // Stage 3: Facet Surface Crystals
    vec3 colCoreWhite     = vec3(0.98, 0.99, 1.00);

    // Progressive color interpolation across stages
    vec3 baseColor = colChaosCyan;
    if (vMorphStage <= 1.0) {
      baseColor = mix(colChaosCyan, colOrbitalGold, vMorphStage);
    } else if (vMorphStage <= 2.0) {
      baseColor = mix(colOrbitalGold, colVertexAmber, vMorphStage - 1.0);
    } else {
      baseColor = mix(colVertexAmber, colSurfacePrism, vMorphStage - 2.0);
    }

    // Observer attention boost
    baseColor = mix(baseColor, vec3(0.2, 0.95, 1.0), vInfluence * 0.5);

    // Super-radiant center highlight
    float highlight = 0.4 + vInfluence * 0.3 + vExcitation * 0.4 + clamp(vMorphStage * 0.2, 0.0, 0.6);
    baseColor = mix(baseColor, colCoreWhite, pow(bokehDisc, 2.5) * highlight);

    // Dynamic Alpha Modulation
    float baseAlpha = 0.25 + vPhase * 0.35;
    float structuredAlpha = mix(baseAlpha, 0.85, clamp(vMorphStage / 3.0, 0.0, 1.0));

    // Breathing universe synchronization
    float breathMod = 0.85 + uBreathPhase * 0.25;

    float alpha = bokehDisc * depthFade * twinkle * structuredAlpha * breathMod;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(baseColor, alpha);
  }
`;
