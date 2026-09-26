export const recombinantCrystalFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uGenesisProgress;
  uniform float uBreathPhase;
  uniform vec3 uArchetypeColor;
  uniform float uPersonalFreq;
  uniform float uAttentionStrength;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFacetDispersion;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // 1. Dual Refraction & Internal Caustic Simulation
    vec3 refractedRay = refract(-viewDir, normal, 1.0 / 1.54);
    float caustic1 = sin(refractedRay.x * 24.0 + uTime * 2.2) * cos(refractedRay.y * 24.0 - uTime * 1.8);
    float caustic2 = sin(refractedRay.y * 36.0 - uTime * 1.4) * cos(refractedRay.z * 36.0 + uTime * 2.0);
    float caustics = pow(max(0.0, caustic1 * caustic2), 3.0) * (0.5 + uGenesisProgress * 1.2);

    // 2. High-Order Fresnel Rim & Dispersion Fire
    float NdotV = max(dot(viewDir, normal), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.2);

    // 3. Chromatic Dispersion Splitting
    vec3 dispRed   = vec3(1.0, 0.25, 0.2) * pow(1.0 - max(dot(viewDir, normalize(normal + vec3(0.02, 0.0, 0.0))), 0.0), 3.5);
    vec3 dispGreen = vec3(0.2, 1.0, 0.4) * pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
    vec3 dispBlue  = vec3(0.2, 0.5, 1.0) * pow(1.0 - max(dot(viewDir, normalize(normal - vec3(0.02, 0.0, 0.0))), 0.0), 3.5);
    vec3 chromaticFire = (dispRed + dispGreen + dispBlue) * 1.4;

    // 4. Subtle Embedded DNA Codon Lattice
    float codonGrid = sin(vPosition.x * 32.0) * sin(vPosition.y * 32.0) * sin(vPosition.z * 32.0);
    float dnaLattice = pow(abs(codonGrid), 6.0) * 0.45;

    // 5. Archetype Personalized Radiance
    vec3 baseGlass = mix(vec3(0.04, 0.08, 0.14), uArchetypeColor * 0.25, 0.6);
    vec3 rimGlow = mix(vec3(0.85, 0.95, 1.0), uArchetypeColor, 0.5);

    vec3 finalColor = baseGlass;
    finalColor += caustics * uArchetypeColor * 2.0;
    finalColor += chromaticFire * 0.75;
    finalColor += dnaLattice * vec3(1.0, 0.92, 0.6) * 1.8;
    finalColor += rimGlow * fresnel * 2.4;

    // Attention presence amplification
    finalColor += uArchetypeColor * uAttentionStrength * 0.5;

    // Genesis emergence opacity
    float alpha = clamp((0.35 + fresnel * 0.65 + caustics * 0.3) * uGenesisProgress, 0.0, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
