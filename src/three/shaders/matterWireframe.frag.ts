export const matterWireframeFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uExcitation;

  varying float vEdgeCoord;
  varying float vLocalProgress;
  varying float vEdgeIndex;

  void main() {
    if (vEdgeCoord > vLocalProgress || vLocalProgress <= 0.005) {
      discard;
    }

    // 1. Dual Traveling Energy Wave Propagation
    // Coherent light pulses race along the connecting wireframe from both vertices
    float speed = 2.4 + uExcitation * 2.0;
    float waveForward  = exp(-pow(fract(vEdgeCoord * 2.0 - uTime * speed + vEdgeIndex * 0.15) - 0.5, 2.0) * 48.0);
    float waveBackward = exp(-pow(fract((1.0 - vEdgeCoord) * 2.0 - uTime * speed + vEdgeIndex * 0.15) - 0.5, 2.0) * 48.0);
    float combinedWaves = waveForward + waveBackward;

    // 2. Constructive Interference Flash upon connection lock
    float lockFlash = smoothstep(0.85, 1.0, vLocalProgress) * exp(-pow(vEdgeCoord - 0.5, 2.0) * 20.0) * 1.8;

    // 3. Color Gradients along the Edge
    vec3 colAmberJoint = vec3(0.96, 0.62, 0.15); // #f59e0b
    vec3 colCyanTransit= vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colPureWhite  = vec3(1.0);

    vec3 baseColor = mix(colAmberJoint, colCyanTransit, sin(vEdgeCoord * 3.14159));
    baseColor += colPureWhite * (combinedWaves * 1.4 + lockFlash * 2.2);

    float alpha = (0.78 + combinedWaves * 0.5 + lockFlash * 0.6) * smoothstep(0.0, 0.08, vLocalProgress);
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(baseColor, alpha);
  }
`;
