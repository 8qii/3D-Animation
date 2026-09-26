export const matterVerticesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uVertexProgress; // [0..1]
  uniform float uExcitation;
  uniform float uPixelRatio;

  attribute vec3 aTarget;

  varying vec2 vUv;
  varying float vProgress;
  varying float vDepth;

  void main() {
    vUv = uv;
    vProgress = uVertexProgress;

    // Points expand outward from singularity origin to golden ratio targets
    vec3 currentPos = aTarget * uVertexProgress;

    // Subtle quantum orbital micro-vibration
    currentPos += sin(uTime * 3.0 + aTarget * 5.0) * 0.015 * uVertexProgress;

    vec4 mvCenter = modelViewMatrix * vec4(currentPos, 1.0);
    vDepth = -mvCenter.z;

    float nodeSize = (0.12 + uExcitation * 0.08) * uVertexProgress;
    vec3 billboardingPos = mvCenter.xyz + vec3(position.xy * nodeSize, 0.0);

    gl_Position = projectionMatrix * vec4(billboardingPos, 1.0);
  }
`;
