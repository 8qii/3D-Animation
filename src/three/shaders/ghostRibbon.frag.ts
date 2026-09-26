export const ghostRibbonFragmentShader = /* glsl */ `
  precision highp float;

  varying float vProgress;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    if (vAlpha <= 0.005) discard;

    // Smooth gradient along trajectory edge with subtle pulse
    vec3 finalColor = vColor * (1.1 + sin(vProgress * 20.0) * 0.15);
    gl_FragColor = vec4(finalColor, vAlpha * 0.85);
  }
`;
