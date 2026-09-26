export const realitySeedFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uCompression;
  uniform float uPersonalFreq;
  uniform vec3 uArchetypeColor;
  uniform float uGenesisPulse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // 1. Extreme Fresnel Rim Lensing
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);

    // 2. Solfeggio Standing Wave Rings across the Seed Sphere
    float freqScalar = uPersonalFreq * 0.015;
    float rings = sin(vPosition.y * 45.0 - uTime * freqScalar) * 0.5 + 0.5;
    rings = pow(rings, 6.0) * (0.4 + uCompression * 0.8);

    // 3. Micro Event Horizon Core & Plasma Spectrum
    // Plasma core: blue-white -> solar gold -> transcendental white
    vec3 plasmaCore = mix(vec3(0.15, 0.65, 1.0), vec3(1.0, 0.95, 0.85), uCompression);
    vec3 solarAmber = mix(vec3(1.0, 0.72, 0.25), uArchetypeColor, 0.65);
    vec3 radiantWhite = vec3(1.0, 0.98, 0.94);

    // 4. Color Assembly
    vec3 finalColor = mix(plasmaCore, solarAmber, rings);
    finalColor += radiantWhite * fresnel * 2.8;
    finalColor += uArchetypeColor * (fresnel * 1.5 + rings * 0.8);

    // Dynamic Genesis Shockwave Flash
    finalColor += radiantWhite * uGenesisPulse * 3.5;

    // Density falloff
    float alpha = clamp(0.55 + uCompression * 0.42 + fresnel * 0.45, 0.0, 0.98);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
