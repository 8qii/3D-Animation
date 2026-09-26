export const exposedCoreFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;
  uniform float uThresholdProgress;
  uniform float uHiddenEnding;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFresnel;

  void main() {
    float coreDist = length(vPosition);

    // Three-layer Genesis memory spectrum:
    // 1. Act I Void: cold deep cyan quantum fluctuation traces
    vec3 voidCyan = vec3(0.18, 0.78, 1.00);

    // 2. Act II Singularity: intense amber kinetic flame
    vec3 singularityAmber = vec3(1.00, 0.58, 0.12);

    // 3. Act III Monolith: sacred pure incandescent gold
    vec3 monolithGold = vec3(1.00, 0.88, 0.35);

    // 4. Act IV Collapse: Blinding, pure radiant incandescent white
    vec3 pureWhite = vec3(1.00, 1.00, 1.00);

    // 5. Phase 9.17 Singularity Threshold: Searing Blue-White Plasma
    vec3 blueWhitePlasma = vec3(0.68, 0.88, 1.00);

    // Dynamic blending between Genesis memory layers:
    // Core breathes with memory waves, accelerating as collapse reaches critical mass
    float waveSpeed = 1.8 + uCollapseProgress * 8.0 + uThresholdProgress * 12.0;
    float memoryWave = sin(uTime * waveSpeed + coreDist * 8.0) * 0.5 + 0.5;

    // Normal multi-epoch blending
    vec3 memoryCol = mix(voidCyan, singularityAmber, memoryWave);
    memoryCol = mix(memoryCol, monolithGold, pow(1.0 - clamp(coreDist * 1.5, 0.0, 1.0), 2.0));

    // Phase 9.16 Memory Colors Compress: cyan -> amber -> gold -> white
    if (uCollapseProgress > 0.0001) {
      vec3 amberGold = mix(singularityAmber, monolithGold, clamp(uCollapseProgress * 1.5, 0.0, 1.0));
      memoryCol = mix(memoryCol, amberGold, clamp(uCollapseProgress * 1.2, 0.0, 1.0));
      memoryCol = mix(memoryCol, monolithGold, clamp((uCollapseProgress - 0.35) * 2.0, 0.0, 1.0));
      memoryCol = mix(memoryCol, pureWhite, clamp((uCollapseProgress - 0.70) * 3.33, 0.0, 1.0));
    }

    // Phase 9.17 Singularity Threshold: White -> Blue-White Plasma
    if (uThresholdProgress > 0.0001) {
      memoryCol = mix(memoryCol, blueWhitePlasma, clamp(uThresholdProgress * 1.4, 0.0, 1.0));
      // Corona shifts to electric cyan-violet plasma rim
      vec3 plasmaRim = vec3(0.55, 0.80, 1.00);
      memoryCol += plasmaRim * pow(vFresnel, 1.5) * uThresholdProgress * 0.85;
    }

    // Phase 9.19 Observer Evolution Hidden Endings
    if (uHiddenEnding > 0.5 && uHiddenEnding < 1.5) {
      // TRANSCENDENCE (The Witness): Serene pearlescent white/indigo halo
      vec3 transcendenceHalo = vec3(0.88, 0.94, 1.0);
      memoryCol = mix(memoryCol, transcendenceHalo, 0.65);
    } else if (uHiddenEnding > 1.5 && uHiddenEnding < 2.5) {
      // SUPERNOVA (The Catalyst): Violent cosmic incandescent plasma bloom
      vec3 supernovaBloom = mix(vec3(1.0, 0.2, 0.4), vec3(0.2, 0.9, 1.0), sin(uTime * 8.0) * 0.5 + 0.5);
      memoryCol = mix(memoryCol, supernovaBloom, 0.75);
    } else if (uHiddenEnding > 2.5) {
      // ASCENSION (The Architect): Sacred geometric golden stellation
      vec3 ascensionGold = vec3(1.0, 0.84, 0.25);
      memoryCol = mix(memoryCol, ascensionGold, 0.70);
    }

    // Internal radiant heart
    float innerRadiance = exp(-coreDist * (3.2 + uCollapseProgress * 4.0 + uThresholdProgress * 6.0));
    float outerCorona = pow(vFresnel, mix(mix(1.8, 1.1, uCollapseProgress), 0.85, uThresholdProgress));

    // Density emission: 5x -> 12x density emission
    float emissionDensity = mix(5.0, 12.0, uThresholdProgress);
    float totalLuminosity = (1.6 + uFractureProgress * 1.8 + uFacetMemoryProgress * 2.2 + uCollapseProgress * emissionDensity);

    vec3 finalColor = memoryCol * (innerRadiance * 4.5 + outerCorona * 3.0) * totalLuminosity;
    float finalAlpha = clamp(innerRadiance * 0.95 + outerCorona * 0.85, 0.0, 1.0) * (0.3 + uFractureProgress * 0.7);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
