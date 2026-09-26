export const exposedCoreVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFresnel;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Organic harmonic breathing of the unveiled quantum core
    // Under collapse: density increases, pulse frequency surges from 2.2 -> 14.0, while amplitude sharpens
    float pulseSpeed = 2.2 + uCollapseProgress * 12.0;
    float pulse = sin(uTime * pulseSpeed - length(position) * 4.0) * (0.04 + uCollapseProgress * 0.05);
    pulse += sin(uTime * (5.5 + uCollapseProgress * 15.0) + position.x * 6.0) * 0.015 * (1.0 + uFacetMemoryProgress);

    // High density compression: radius compresses slightly under immense inward gravitational collapse
    float compressionScale = mix(1.0, 0.82, uCollapseProgress);
    vec3 displacedPos = position * compressionScale + normal * pulse;

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 2.5);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
