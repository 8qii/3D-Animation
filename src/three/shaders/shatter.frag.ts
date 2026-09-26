export const shatterFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFractureProgress;
  uniform vec3 uObserverPos;
  uniform float uObserverAttention;
  uniform vec3 uKeyLightDir;
  uniform vec3 uRimLightDir;
  uniform float uFacetAwakened;
  uniform float uPersonalFreq;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying vec3 vBarycentric;
  varying float vFresnel;

  // GGX Microfacet Specular
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return a2 / (3.14159265 * denom * denom);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // 1. Cleavage Perimeter Detection via Barycentric Coordinates
    float edgeDist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
    float cleavageHalo = 1.0 - smoothstep(0.002, 0.065, edgeDist);
    float cleavageCore = 1.0 - smoothstep(0.0005, 0.018, edgeDist);

    // Cleavage light color: incandescent white-hot core with ionized electric cyan fringes
    vec3 cleavageCol = mix(vec3(0.30, 0.82, 1.00), vec3(1.0, 0.97, 0.88), cleavageCore);
    vec3 cleavageEmission = cleavageCol * (cleavageCore * 4.8 + cleavageHalo * 2.2) * (0.4 + uFractureProgress * 0.8);

    // 2. Optical Transmission & Chromatic Dispersion through Facet
    float ior = 1.54;
    float dispersion = 0.14;
    vec3 refR = refract(-viewDir, normal, 1.0 / ior);
    vec3 refG = refract(-viewDir, normal, 1.0 / (ior + dispersion * 0.04));
    vec3 refB = refract(-viewDir, normal, 1.0 / (ior + dispersion * 0.08));

    vec3 dispersionCol = vec3(
      dot(refR, vec3(1.0, 0.0, 0.0)) * 0.5 + 0.5,
      dot(refG, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5,
      dot(refB, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5
    );

    // 3. Obsidian Glass Base Color & Absorption
    vec3 colorA = vec3(0.012, 0.027, 0.07); // Deep obsidian dark
    vec3 colorB = vec3(0.12, 0.16, 0.24);  // Ionized facet rim
    float facetShade = max(dot(normal, vec3(0.0, 1.0, 0.5)), 0.0);
    vec3 obsidianBase = mix(colorA, colorB, facetShade * 0.5);
    obsidianBase = mix(obsidianBase, dispersionCol, dispersion * 0.5);

    // 4. Architectural Lighting: GGX Specular
    vec3 keyDir = normalize(uKeyLightDir);
    vec3 halfKey = normalize(keyDir + viewDir);
    float specKey = distributionGGX(normal, halfKey, 0.06);
    vec3 keyLighting = vec3(1.0, 0.96, 0.90) * specKey * 0.95 * max(dot(normal, keyDir), 0.0);

    vec3 rimDir = normalize(uRimLightDir);
    vec3 halfRim = normalize(rimDir + viewDir);
    float specRim = distributionGGX(normal, halfRim, 0.05);
    vec3 rimLighting = vec3(0.35, 0.80, 1.00) * specRim * 1.5 * pow(vFresnel, 1.6);

    // 5. Caustic Flashes between separated facets
    float causticWave = sin(uTime * 4.5 + dot(vWorldPosition, vec3(8.0, 12.0, 9.0))) * 0.5 + 0.5;
    float causticFlash = pow(causticWave, 6.0) * smoothstep(0.2, 0.8, uFractureProgress);
    vec3 causticEmission = vec3(0.35, 0.88, 1.0) * causticFlash * 1.6;

    // 6. Backlight from the liberated Internal Quantum Core
    float distToOrigin = length(vWorldPosition);
    float coreLeakage = exp(-distToOrigin * 0.75) * (0.8 + uFractureProgress * 2.2);
    vec3 coreEmission = vec3(1.0, 0.72, 0.28) * coreLeakage * (0.2 + cleavageHalo * 0.8);

    // Composite Final Facet Color
    vec3 finalColor = obsidianBase;
    finalColor += keyLighting;
    finalColor += rimLighting;
    finalColor += cleavageEmission;
    finalColor += causticEmission;
    finalColor += coreEmission;
    // Observer Proximity Radiance on Facets
    float distToObs = length(vWorldPosition - uObserverPos);
    float obsFacetAura = exp(-distToObs * distToObs * 3.0) * uObserverAttention;
    vec3 obsGlow = mix(vec3(0.3, 0.85, 1.0), vec3(1.0, 0.9, 0.5), uObserverAttention) * obsFacetAura * 1.8;

    // 7. Phase 9.21 Facet Memory Awakening & Personal Frequency Vibration
    float freqPulse = sin(uTime * (uPersonalFreq * 0.05) + dot(vPosition, vec3(9.0, 14.0, 11.0))) * 0.5 + 0.5;
    float harmonicLattice = pow(freqPulse, 3.0) * uFacetAwakened;
    vec3 awakeningAura = mix(vec3(0.35, 0.75, 1.0), vec3(1.0, 0.88, 0.45), harmonicLattice) * uFacetAwakened * 2.4;
    float innerGaze = 1.0 - smoothstep(0.01, 0.09, edgeDist);
    vec3 memoryVein = vec3(1.0, 0.92, 0.65) * innerGaze * uFacetAwakened * (1.5 + 0.5 * sin(uTime * 3.0));

    finalColor += obsGlow;
    finalColor += awakeningAura;
    finalColor += memoryVein;

    gl_FragColor = vec4(finalColor, 0.94);
  }
`;
