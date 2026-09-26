export const matterWireframeVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEdgeProgress;
  uniform float uVertexProgress;

  attribute vec3 aTarget;
  attribute float aEdgeProgress; // 0 at vertex A, 1 at vertex B
  attribute float aEdgeIndex;
  attribute float aActivationThreshold; // Emerges once both endpoint vertices awaken

  varying float vEdgeCoord;
  varying float vLocalProgress;
  varying float vEdgeIndex;

  void main() {
    vEdgeCoord = aEdgeProgress;
    vEdgeIndex = aEdgeIndex;

    // Edge activates only when mathematical necessity threshold is satisfied
    float localProgress = clamp((uEdgeProgress - aActivationThreshold) / 0.24, 0.0, 1.0);
    vLocalProgress = localProgress;

    vec3 pos = aTarget * uVertexProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
