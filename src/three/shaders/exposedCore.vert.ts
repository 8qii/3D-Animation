export const exposedCoreVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;
  uniform float uThresholdProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFresnel;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Organic harmonic breathing of the unveiled quantum core
    // Under collapse & threshold: density increases, pulse frequency surges from 2.2 -> 14.0 -> 24.0
    float pulseSpeed = 2.2 + uCollapseProgress * 12.0 + uThresholdProgress * 10.0;
    float pulse = sin(uTime * pulseSpeed - length(position) * 4.0) * (0.04 + uCollapseProgress * 0.05 + uThresholdProgress * 0.04);
    pulse += sin(uTime * (5.5 + uCollapseProgress * 15.0 + uThresholdProgress * 15.0) + position.x * 6.0) * 0.015 * (1.0 + uFacetMemoryProgress);

    // Phase 9.17 Singularity Threshold Compression:
    // Compress radius further from 0.85 -> 0.65
    float collapseScale = mix(1.0, 0.85, uCollapseProgress);
    float thresholdScale = mix(collapseScale, 0.65, uThresholdProgress);
    vec3 displacedPos = position * thresholdScale + normal * pulse;

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 2.5);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
