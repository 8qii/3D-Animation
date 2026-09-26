export const exposedCoreVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFresnel;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Organic harmonic breathing of the unveiled quantum core
    float pulse = sin(uTime * 2.2 - length(position) * 4.0) * 0.04;
    pulse += sin(uTime * 5.5 + position.x * 6.0) * 0.015 * (1.0 + uFacetMemoryProgress);
    vec3 displacedPos = position + normal * pulse;

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vWorldPosition = worldPos.xyz;

    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 2.5);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
