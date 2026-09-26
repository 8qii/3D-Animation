export const matterSurfaceVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uVertexProgress;
  uniform float uSurfaceProgress; // [0..1]

  attribute vec3 aNormal;
  attribute vec3 aBarycentric;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vBarycentric;
  varying float vFresnel;

  void main() {
    vBarycentric = aBarycentric;
    vNormal = normalize(normalMatrix * aNormal);

    // Expand facet vertices from origin to target
    vec3 currentPos = position * uVertexProgress;

    vec4 worldPos = modelMatrix * vec4(currentPos, 1.0);
    vWorldPosition = worldPos.xyz;

    // Fresnel rim factor calculation
    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vFresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
