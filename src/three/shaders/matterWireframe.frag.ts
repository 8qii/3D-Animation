export const matterWireframeFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEdgeProgress;
  uniform float uExcitation;

  varying float vEdgeCoord;
  varying float vEdgeIndex;

  void main() {
    // Staggered edge growth based on edge index and global progress
    float staggerOffset = fract(vEdgeIndex * 0.137);
    float localProgress = clamp((uEdgeProgress - staggerOffset * 0.3) / 0.7, 0.0, 1.0);

    if (vEdgeCoord > localProgress || localProgress <= 0.001) {
      discard;
    }

    // Traveling quantum impulse pulse along the wireframe
    float speed = 1.8 + uExcitation * 2.0;
    float wave = exp(-pow(fract(vEdgeCoord * 3.0 - uTime * speed + vEdgeIndex * 0.2) - 0.5, 2.0) * 32.0);

    // Color gradient along the edge: Amber at origin / joints, Cyan in transit
    vec3 colAmber = vec3(0.96, 0.62, 0.15); // #f59e0b
    vec3 colCyan  = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colWhite = vec3(1.0);

    vec3 baseColor = mix(colCyan, colAmber, sin(vEdgeCoord * 3.14159));
    baseColor += colWhite * wave * 1.5;

    float alpha = (0.75 + wave * 0.5) * smoothstep(0.0, 0.08, localProgress);
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(baseColor, alpha);
  }
`;
