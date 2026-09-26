export const matterVerticesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uVertexProgress; // Global vertex timeline [0..1]
  uniform float uExcitation;
  uniform float uPixelRatio;

  attribute vec3 aTarget;
  attribute float aVertexIndex; // [0..11]

  varying vec2 vUv;
  varying float vAwakeProgress; // [0..1]
  varying float vShockwave;     // Energy pulse flare [0..4]
  varying float vDepth;

  void main() {
    vUv = uv;

    // 1. Sequential Awakening Timeline
    // Vertex 0 awakens first, Vertex 11 awakens last
    float awakenThreshold = (aVertexIndex / 12.0) * 0.72;
    float localProgress = clamp((uVertexProgress - awakenThreshold) / 0.16, 0.0, 1.0);
    vAwakeProgress = localProgress;

    // 2. Awakening Energy Pulse & Shockwave Flare
    // Spikes instantly upon crossing threshold, then decays into stable quantum spark
    float pulsePeak = exp(-pow(localProgress * 3.5 - 1.0, 2.0) * 9.0) * 3.8;
    vShockwave = pulsePeak;

    // Expand outward from singularity origin to golden ratio target
    vec3 currentPos = aTarget * localProgress;

    // Subtle quantum orbital vibration
    currentPos += sin(uTime * 3.0 + aTarget * 5.0) * 0.015 * localProgress;

    vec4 mvCenter = modelViewMatrix * vec4(currentPos, 1.0);
    vDepth = -mvCenter.z;

    // Dynamic node size (flares up on shockwave)
    float baseSize = 0.10 + uExcitation * 0.06;
    float nodeSize = (baseSize * localProgress + pulsePeak * 0.12);
    vec3 billboardingPos = mvCenter.xyz + vec3(position.xy * nodeSize, 0.0);

    gl_Position = projectionMatrix * vec4(billboardingPos, 1.0);
  }
`;
