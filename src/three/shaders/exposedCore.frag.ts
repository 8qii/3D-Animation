export const exposedCoreFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;

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

    // Dynamic blending between Genesis memory layers:
    // Core breathes with memory waves, accelerating as collapse reaches critical mass
    float waveSpeed = 1.8 + uCollapseProgress * 8.0;
    float memoryWave = sin(uTime * waveSpeed + coreDist * 8.0) * 0.5 + 0.5;

    // Normal multi-epoch blending
    vec3 memoryCol = mix(voidCyan, singularityAmber, memoryWave);
    memoryCol = mix(memoryCol, monolithGold, pow(1.0 - clamp(coreDist * 1.5, 0.0, 1.0), 2.0));

    // Phase 9.16 Memory Colors Compress:
    // cyan -> amber -> gold -> white
    // Under collapse, lower stages are squeezed out toward pure white at center and corona
    if (uCollapseProgress > 0.0001) {
      // Step 1: Amber dominates cyan
      vec3 amberGold = mix(singularityAmber, monolithGold, clamp(uCollapseProgress * 1.5, 0.0, 1.0));
      memoryCol = mix(memoryCol, amberGold, clamp(uCollapseProgress * 1.2, 0.0, 1.0));
      // Step 2: Gold dominates amber
      memoryCol = mix(memoryCol, monolithGold, clamp((uCollapseProgress - 0.35) * 2.0, 0.0, 1.0));
      // Step 3: Pure blinding white dominates gold
      memoryCol = mix(memoryCol, pureWhite, clamp((uCollapseProgress - 0.70) * 3.33, 0.0, 1.0));
    }

    // Internal radiant heart
    float innerRadiance = exp(-coreDist * (3.2 + uCollapseProgress * 4.0));
    float outerCorona = pow(vFresnel, mix(1.8, 1.1, uCollapseProgress));

    // Core luminosity rises smoothly as facets detach, surging to critical brightness during collapse
    float totalLuminosity = (1.6 + uFractureProgress * 1.8 + uFacetMemoryProgress * 2.2 + uCollapseProgress * 5.0);

    vec3 finalColor = memoryCol * (innerRadiance * 3.5 + outerCorona * 2.0) * totalLuminosity;
    float finalAlpha = clamp(innerRadiance * 0.95 + outerCorona * 0.75, 0.0, 1.0) * (0.3 + uFractureProgress * 0.7);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
