export const shatterVertexShader = /* glsl */ `
  attribute vec3 aBarycentric;

  uniform float uTime;
  uniform float uFractureProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying vec3 vBarycentric;
  varying float vFresnel;

  void main() {
    vUv = uv;
    vBarycentric = aBarycentric;
    vPosition = position;

    // Normal in world space
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vNormal = worldNormal;

    // Microscopic edge jitter from high quantum tension during early detachment
    float edgeJitter = sin(uTime * 48.0 + dot(position, vec3(12.0, 18.0, 15.0))) * 0.003 * uFractureProgress;
    vec3 localPos = position + normal * edgeJitter;

    vec4 worldPos = modelMatrix * vec4(localPos, 1.0);
    vWorldPosition = worldPos.xyz;

    // View direction & Fresnel
    vec3 viewDirection = normalize(cameraPosition - worldPos.xyz);
    vFresnel = pow(1.0 - max(dot(viewDirection, worldNormal), 0.0), 3.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
