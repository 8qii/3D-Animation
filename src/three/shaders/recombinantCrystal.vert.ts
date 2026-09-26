export const recombinantCrystalVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uGenesisProgress;
  uniform float uBreathPhase;
  uniform vec3 uAttentionDirection;
  uniform float uAttentionStrength;
  uniform float uPersonalFreq;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFacetDispersion;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Sacred Golden-ratio stellation harmonics
    float phi = 1.6180339887;
    float harmonicWarp = sin(position.x * phi * 4.0 + uTime * 1.2) *
                         cos(position.y * phi * 4.0 + uTime * 1.2) *
                         sin(position.z * phi * 4.0 + uTime * 1.2);

    // Resonant breathing scale
    float breathDilation = 1.0 + sin(uBreathPhase * 6.2831853) * 0.035;

    // Attention magnetic displacement
    vec3 attentionPull = uAttentionDirection * uAttentionStrength * 0.06;

    // Emergence growth modulation
    vec3 expandedPos = position * (0.15 + 0.85 * uGenesisProgress) * breathDilation;
    expandedPos += normal * (harmonicWarp * 0.03 * uGenesisProgress) + attentionPull;

    vFacetDispersion = harmonicWarp;

    vec4 worldPos = modelMatrix * vec4(expandedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
