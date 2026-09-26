export const photonLeakageFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from point center [0.0 to 0.5]
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // High energy photon point core with soft falloff
    float core = smoothstep(0.12, 0.0, dist);
    float halo = exp(-dist * dist * 18.0);
    float intensity = core * 1.5 + halo * 0.85;

    vec3 finalColor = vColor * intensity;
    float finalAlpha = vAlpha * clamp(intensity, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
