export const particlesFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from center of point sprite [0..1]
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // Soft Gaussian-like circular glow falloff
    float intensity = exp(-dist * dist * 12.0);
    float alpha = intensity * vAlpha;

    // Glowing core
    vec3 finalColor = vColor + vec3(1.0) * pow(intensity, 3.0) * 0.5;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
