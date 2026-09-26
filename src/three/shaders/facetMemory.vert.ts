export const facetMemoryVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;
  uniform float uThresholdProgress;

  attribute float aLineCoord; // 0.0 at start facet, 1.0 at end facet
  attribute float aSeed;

  varying float vLineCoord;
  varying float vAlpha;
  varying vec3 vWorldPosition;

  void main() {
    vLineCoord = aLineCoord;

    // Phase 9.16 & Phase 9.17:
    // Threads contract inward toward origin (0,0,0): 100% -> 10% -> 0%
    vec3 contractedPos = position;
    if (uCollapseProgress > 0.0001) {
      float lengthScale = mix(1.0, 0.10, uCollapseProgress);
      // Final convergence: 10% -> 0%
      lengthScale = mix(lengthScale, 0.00, uThresholdProgress);
      contractedPos = position * lengthScale;
    }

    // Subtle quantum vibration along memory thread
    float vibSpeed = 4.0 + uCollapseProgress * 12.0 + uThresholdProgress * 18.0;
    float threadWave = sin(uTime * vibSpeed + aLineCoord * 12.0 + aSeed * 6.28) * (0.012 * (1.0 - uCollapseProgress * 0.7)) * uFacetMemoryProgress;
    contractedPos += normal * threadWave;

    vec4 worldPos = modelMatrix * vec4(contractedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    // Wave intensity traveling inward toward core
    float flowDir = mix(1.0, -2.5, uCollapseProgress);
    float wavePhase = fract(uTime * (0.85 + uCollapseProgress * 2.0) * flowDir - aLineCoord + aSeed * 0.5);
    float wavePulse = smoothstep(0.0, 0.15, wavePhase) * smoothstep(0.4, 0.15, wavePhase);
    
    // As threads collapse to 0 length in threshold, threads dissolve into core
    float threadVisibility = (1.0 - uThresholdProgress);
    vAlpha = (0.25 + wavePulse * 0.75) * uFacetMemoryProgress * threadVisibility;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
