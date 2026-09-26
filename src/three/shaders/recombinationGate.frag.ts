export const recombinationGateFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uGateAperture;
  uniform float uGateActivation;
  uniform float uPersonalFreq;
  uniform float uSyncFlash;
  uniform vec3 uArchetypeColor;
  uniform float uUniverseSynchronized;
  uniform float uPortalExpansion;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vRadius;

  void main() {
    vec2 centeredUv = (vUv - 0.5) * 2.0;
    float r = length(centeredUv);
    float angle = atan(centeredUv.y, centeredUv.x);

    // Hyperspace vortex twist during ACT V portal expansion
    if (uPortalExpansion > 0.001) {
      float twist = (1.0 / (r + 0.15)) * uPortalExpansion * 3.5;
      angle += twist - uTime * 2.0 * uPortalExpansion;
    }

    // 1. Event Horizon Aperture Edge
    float baseAperture = mix(0.12, 0.78, uGateAperture);
    float apertureRadius = mix(baseAperture, 0.96, uPortalExpansion);
    float edgeThickness = mix(0.08, 0.14, uPortalExpansion);
    float irisCore = 1.0 - smoothstep(apertureRadius - 0.04, apertureRadius, r);
    float irisRing = smoothstep(apertureRadius - edgeThickness, apertureRadius, r) *
                     (1.0 - smoothstep(apertureRadius, apertureRadius + edgeThickness, r));

    // 2. Rotating Double-Helical DNA Strands on Outer Gate Ring
    float helix1 = sin(angle * 6.0 + r * 18.0 - uTime * 3.5);
    float helix2 = sin(angle * 6.0 - r * 18.0 + uTime * 3.5 + 3.14159);
    float dnaFilament = (pow(abs(helix1), 8.0) + pow(abs(helix2), 8.0)) * smoothstep(0.4, 0.95, r);

    // Hyperspace lattice beams when portal expands
    float hyperspaceRays = pow(abs(sin(angle * 12.0 + uTime * 4.0)), 12.0) * uPortalExpansion * (1.0 - smoothstep(0.1, 0.9, r));

    // 3. Solfeggio Chromatic Dispersion Rings
    float freqScalar = uPersonalFreq * 0.01;
    float ringPattern = sin(r * 28.0 - uTime * (freqScalar * 0.5)) * 0.5 + 0.5;
    float harmonicRings = pow(ringPattern, 5.0) * (0.3 + uGateActivation * 0.7 + uPortalExpansion * 0.6);

    // 4. Color Compositing
    // Base Event Horizon Rim: Electric Cyan / Plasma
    vec3 rimCol = mix(vec3(0.2, 0.8, 1.0), vec3(1.0, 0.95, 0.8), irisRing);
    // Archetype Personalization Blend
    vec3 archGlow = mix(rimCol, uArchetypeColor, 0.55);

    // Inner Void / Event Horizon Center: Deep cosmic absorption with luminous core spark
    vec3 voidCol = mix(vec3(0.005, 0.01, 0.025), vec3(0.0, 0.0, 0.0), irisCore);
    float coreSpark = exp(-r * r * mix(35.0, 15.0, uPortalExpansion)) * (0.6 + uGateActivation * 2.5 + uPortalExpansion * 4.0);
    vec3 sparkCol = vec3(1.0, 0.98, 0.92) * coreSpark;

    // Helical DNA Golden Ribbons
    vec3 dnaCol = vec3(1.0, 0.88, 0.45) * dnaFilament * 1.8;

    // Assembly of Final Radiance
    vec3 finalColor = mix(voidCol, archGlow, irisRing * 2.2);
    finalColor += harmonicRings * archGlow * 1.4;
    finalColor += dnaCol;
    finalColor += sparkCol;
    finalColor += vec3(0.8, 0.95, 1.0) * hyperspaceRays * 3.0;

    // Portal transcendence saturation
    if (uPortalExpansion > 0.001) {
      vec3 radiantWhite = vec3(1.0, 0.98, 0.92);
      finalColor = mix(finalColor, radiantWhite * (length(finalColor) * 0.8 + 0.5), uPortalExpansion * 0.65);
    }

    // Synchronization optical flash
    finalColor += vec3(0.9, 0.96, 1.0) * uSyncFlash * 2.5;

    // Transparency falloff at outer rim
    float alpha = smoothstep(1.05, 0.85, r) * (0.2 + uGateAperture * 0.55 + uGateActivation * 0.25 + uPortalExpansion * 0.2);
    if (r < apertureRadius) {
      alpha = mix(alpha, mix(0.88, 0.98, uPortalExpansion), irisCore);
    }

    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 0.98));
  }
`;

