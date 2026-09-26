export const facetMemoryVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFacetMemoryProgress;

  attribute float aLineCoord; // 0.0 at start facet, 1.0 at end facet
  attribute float aSeed;

  varying float vLineCoord;
  varying float vAlpha;
  varying vec3 vWorldPosition;

  void main() {
    vLineCoord = aLineCoord;

    // Subtle quantum vibration along memory thread
    vec3 displacedPos = position;
    float threadWave = sin(uTime * 4.0 + aLineCoord * 12.0 + aSeed * 6.28) * 0.012 * uFacetMemoryProgress;
    displacedPos += normal * threadWave;

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    // Wave intensity traveling from facet to facet
    float wavePhase = fract(uTime * 0.85 - aLineCoord + aSeed * 0.5);
    float wavePulse = smoothstep(0.0, 0.15, wavePhase) * smoothstep(0.4, 0.15, wavePhase);
    vAlpha = (0.25 + wavePulse * 0.75) * uFacetMemoryProgress;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
