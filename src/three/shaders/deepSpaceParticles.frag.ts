export const deepSpaceFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vPhase;
  varying float vDepth;

  void main() {
    vec2 coord = vUv - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0) {
      discard;
    }

    float spot = exp(-dist * dist * 8.0);

    // Micro-twinkling of distant stars
    float twinkle = sin(uTime * (0.3 + vPhase * 0.8) + vPhase * 20.0) * 0.3 + 0.7;

    // Distant cool starlight hues
    vec3 starColor = mix(vec3(0.4, 0.6, 0.95), vec3(0.8, 0.7, 1.0), vPhase);

    // Distance fade in the cosmic background
    float depthFade = smoothstep(22.0, 6.0, vDepth);

    float alpha = spot * twinkle * depthFade * (0.15 + vPhase * 0.35);

    gl_FragColor = vec4(starColor, alpha);
  }
`;
