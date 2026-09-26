export const voidAtmosphereFragmentShader = /* glsl */ `
  varying vec2 vUv;

  // Dither function to eliminate 8-bit color banding in deep gradients
  float dither(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453) * 0.0035;
  }

  void main() {
    // Distance from screen center [0..1]
    vec2 centerOffset = vUv - vec2(0.5);
    float dist = length(centerOffset);

    // Deepest obsidian void #02040a at edge, subtle indigo #080c1c at center
    vec3 voidBlack  = vec3(0.012, 0.016, 0.028); // 98% absolute black
    vec3 deepIndigo = vec3(0.035, 0.048, 0.098); // Extremely subtle sacred cathedral indigo

    float gradient = smoothstep(0.85, 0.0, dist);
    vec3 finalColor = mix(voidBlack, deepIndigo, gradient);

    // Add imperceptible dither noise
    finalColor += vec3(dither(gl_FragCoord.xy));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
