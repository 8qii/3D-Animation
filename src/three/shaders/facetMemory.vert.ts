export const facetMemoryVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;

  attribute float aLineCoord; // 0.0 at start facet, 1.0 at end facet
  attribute float aSeed;

  varying float vLineCoord;
  varying float vAlpha;
  varying vec3 vWorldPosition;

  void main() {
    vLineCoord = aLineCoord;

    // Phase 9.16 Memory Network Collapse:
    // Threads contract inward toward origin (0,0,0) by interpolating endpoints: 100% -> 10%
    vec3 contractedPos = position;
    if (uCollapseProgress > 0.0001) {
      // Scale coordinates inward toward center (0,0,0)
      float lengthScale = mix(1.0, 0.10, uCollapseProgress);
      contractedPos = position * lengthScale;
    }

    // Subtle quantum vibration along memory thread, speeding up during collapse
    float vibSpeed = 4.0 + uCollapseProgress * 12.0;
    float threadWave = sin(uTime * vibSpeed + aLineCoord * 12.0 + aSeed * 6.28) * (0.012 * (1.0 - uCollapseProgress * 0.7)) * uFacetMemoryProgress;
    contractedPos += normal * threadWave;

    vec4 worldPos = modelMatrix * vec4(contractedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    // Wave intensity traveling from facet to facet (or collapsing inward toward core)
    float flowDir = mix(1.0, -2.5, uCollapseProgress);
    float wavePhase = fract(uTime * (0.85 + uCollapseProgress * 2.0) * flowDir - aLineCoord + aSeed * 0.5);
    float wavePulse = smoothstep(0.0, 0.15, wavePhase) * smoothstep(0.4, 0.15, wavePhase);
    vAlpha = (0.25 + wavePulse * 0.75) * uFacetMemoryProgress;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
