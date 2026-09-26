export const voidFluctuationFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorCore;
  uniform vec3 uColorAura;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Simple pseudo noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    // Coordinate normalized to [-1, 1] from center
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    if (dist > 1.0) {
      discard;
    }

    // 0.05 Hz slow organic breathing cycle (20-second fundamental period)
    float breath = sin(uTime * 0.314159) * 0.5 + 0.5; // [0, 1]
    float breathMod = mix(0.75, 1.25, breath);

    // Micro quantum noise shimmer
    float noise = hash(vUv * 10.0 + fract(uTime * 0.02)) * 0.04;

    // Multi-tier radial Gaussian luminescence
    float coreSharp = exp(-dist * dist * 32.0 * (2.0 - breath * 0.5));
    float auraSoft  = exp(-dist * dist * 4.5);
    float haloWide  = exp(-dist * 3.0);

    // Color gradient composition
    vec3 color = mix(uColorAura, uColorCore, coreSharp);
    color += vec3(1.0) * pow(coreSharp, 2.0) * 1.5; // Super-radiant white center

    // Composite alpha with breathing intensity
    float alpha = (coreSharp * 1.2 + auraSoft * 0.6 + haloWide * 0.25 + noise) * breathMod;
    alpha = clamp(alpha, 0.0, 1.0);

    // Smooth boundary falloff to absolute zero
    alpha *= smoothstep(1.0, 0.5, dist);

    gl_FragColor = vec4(color, alpha);
  }
`;
