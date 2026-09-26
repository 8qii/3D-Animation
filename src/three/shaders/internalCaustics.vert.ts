export const internalCausticsVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress; // [0..1]
  uniform float uExcitation;

  attribute float aChordIndex;

  varying vec3 vWorldPosition;
  varying float vChordIndex;
  varying float vProgress;

  void main() {
    vChordIndex = aChordIndex;
    vProgress = uProgress;

    vec3 pos = position * uProgress;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
