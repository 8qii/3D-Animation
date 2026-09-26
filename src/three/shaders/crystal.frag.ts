export const crystalFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uMaterialLock;   // 0 (hologram) to 1 (solid physical obsidian)
  uniform float uTransmission;   // Base transmission factor
  uniform float uRoughness;      // Microfacet surface roughness
  uniform float uDispersion;     // Chromatic dispersion dlambda/dn
  uniform float uRefractiveIndex;// IOR ~ 1.52
  uniform float uIntensity;

  uniform vec3 uColorA;          // Deep obsidian dark (#030712)
  uniform vec3 uColorB;          // Ionized facet rim (#1e293b)
  uniform vec3 uGlowColor;       // Internal amber glow (#f59e0b)
  uniform vec3 uAbsorptionColor; // Beer-Lambert absorption tone (#02040a)
  uniform vec3 uKeyLightDir;     // Architectural key light direction
  uniform vec3 uRimLightDir;     // Grazing rim light direction

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying float vFresnel;

  // GGX / Trowbridge-Reitz Microfacet Specular Distribution
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return a2 / (3.14159265 * denom * denom);
  }

  // Procedural micro-scratch / imperfection noise
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // 1. Subtle Surface Micro-Imperfections (Fine Crystalline Scratches)
    float scratchNoise = hash21(floor(vUv * 600.0)) * 0.08;
    float microRoughness = clamp(uRoughness + scratchNoise * 0.05, 0.02, 1.0);

    // 2. Controlled Transmission & Density Reduction during Material Lock
    // In hologram: transmission is high (0.85), surface density is low
    // In solid obsidian: transmission drops to 0.28, surface density locks to 1.0
    float effectiveTransmission = mix(0.85, 0.28, uMaterialLock);
    float surfaceDensity = mix(0.15, 1.0, uMaterialLock);

    // 3. Chromatic Dispersion (Refractive Ray Tracing through Facets)
    float etaR = 1.0 / uRefractiveIndex;
    float etaG = 1.0 / (uRefractiveIndex + uDispersion * 0.04);
    float etaB = 1.0 / (uRefractiveIndex + uDispersion * 0.08);

    vec3 refR = refract(-viewDir, normal, etaR);
    vec3 refG = refract(-viewDir, normal, etaG);
    vec3 refB = refract(-viewDir, normal, etaB);

    vec3 dispersionCol = vec3(
      dot(refR, vec3(1.0, 0.0, 0.0)) * 0.5 + 0.5,
      dot(refG, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5,
      dot(refB, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5
    );

    // 4. Moving Internal Caustic Lattice
    vec3 causticCoord = vPosition * 5.0 + vec3(0.0, 0.0, uTime * 0.6);
    float c1 = abs(sin(causticCoord.x * 3.0 + sin(causticCoord.y * 2.5)));
    float c2 = abs(cos(causticCoord.y * 3.0 + cos(causticCoord.z * 2.5)));
    float internalCaustics = pow(1.0 - (c1 * c2), 3.5) * effectiveTransmission;

    // 5. Beer-Lambert Internal Volumetric Absorption
    float opticalDepth = length(vPosition) * 1.8;
    vec3 absorption = exp(-uAbsorptionColor * opticalDepth);

    // 6. Base Obsidian Material Color Gradient
    float facetShade = max(dot(normal, vec3(0.0, 1.0, 0.5)), 0.0);
    vec3 obsidianBase = mix(uColorA, uColorB, facetShade * 0.4);
    obsidianBase = mix(obsidianBase, dispersionCol, uDispersion * (1.0 - uMaterialLock * 0.5));
    obsidianBase *= absorption;

    // 7. Architectural Lighting Interaction:
    // Key Light GGX Specular
    vec3 keyDir = normalize(uKeyLightDir);
    vec3 halfKey = normalize(keyDir + viewDir);
    float specKey = distributionGGX(normal, halfKey, microRoughness);
    vec3 keyLighting = vec3(1.0, 0.96, 0.90) * specKey * 0.85 * max(dot(normal, keyDir), 0.0);

    // Grazing Rim Light Backscatter (sharp edge reflections on bevels)
    vec3 rimDir = normalize(uRimLightDir);
    vec3 halfRim = normalize(rimDir + viewDir);
    float specRim = distributionGGX(normal, halfRim, microRoughness * 0.8);
    vec3 rimLighting = vec3(0.35, 0.80, 1.00) * specRim * 1.4 * pow(vFresnel, 1.8);

    // 8. Internal Quantum Spark Self-Emission (Pulsing Heart trapped within)
    float distToCore = length(vPosition);
    float internalCoreGlow = exp(-distToCore * distToCore * 6.0) * (sin(uTime * 3.0) * 0.2 + 0.9);
    vec3 coreEmission = uGlowColor * internalCoreGlow * 2.8 * effectiveTransmission;

    // 9. Composite Color & Alpha
    vec3 finalColor = obsidianBase * surfaceDensity;
    finalColor += keyLighting * uMaterialLock;
    finalColor += rimLighting * (0.6 + uMaterialLock * 0.4);
    finalColor += coreEmission;
    finalColor += vec3(0.25, 0.85, 1.0) * internalCaustics * 1.5;

    // Fresnel specular rim glow
    finalColor += uGlowColor * pow(vFresnel, 4.0) * uIntensity * 0.5;

    // Alpha transitions from translucent hologram (0.45) to solid obsidian glass (0.96)
    float finalAlpha = mix(0.45, 0.96, uMaterialLock);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
