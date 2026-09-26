export const voidAtmosphereFragmentShader = /* glsl */ `
  uniform float uBreathPhase;
  uniform float uExcitation;

  varying vec2 vUv;

  // Dither function to eliminate 8-bit color banding in deep gradients
  float dither(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453) * 0.0035;
  }

  void main() {
    // Distance from screen center [0..1]
    vec2 centerOffset = vUv - vec2(0.5);
    float dist = length(centerOffset);

    // Deepest obsidian void #02040a at edge
    vec3 voidBlack  = vec3(0.012, 0.016, 0.026); // 98% absolute black

    // Cathedral indigo breathed in sync with master clock and scroll energy
    vec3 deepIndigoBase = vec3(0.035, 0.048, 0.098);
    vec3 deepIndigoPeak = vec3(0.045, 0.065, 0.135);

    vec3 activeIndigo = mix(deepIndigoBase, deepIndigoPeak, uBreathPhase * 0.65 + uExcitation * 0.35);

    // Radial gradient breathing
    float radius = 0.85 + uBreathPhase * 0.15 + uExcitation * 0.20;
    float gradient = smoothstep(radius, 0.0, dist);

    vec3 finalColor = mix(voidBlack, activeIndigo, gradient);

    // Add imperceptible dither noise
    finalColor += vec3(dither(gl_FragCoord.xy));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
