export const matterWireframeVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEdgeProgress; // Wireframe emergence [0..1]
  uniform float uVertexProgress;

  attribute vec3 aTarget;
  attribute float aEdgeProgress; // 0 at vertex A, 1 at vertex B
  attribute float aEdgeIndex;

  varying float vEdgeCoord;
  varying float vEdgeProgress;
  varying float vEdgeIndex;

  void main() {
    vEdgeCoord = aEdgeProgress;
    vEdgeProgress = uEdgeProgress;
    vEdgeIndex = aEdgeIndex;

    // Both vertices of the edge are positioned at their target scaled by vertex emergence
    vec3 pos = aTarget * uVertexProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
