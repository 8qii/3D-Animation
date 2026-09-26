export const crystalFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uMaterialLock;   // 0 (hologram) to 1 (solid physical obsidian)
  uniform float uTension;        // 0 (quiescent) to 1 (critical internal stress)
  uniform float uStressPreview;  // Phase 8.75 fracture prediction visualization (0 to 1)
  uniform float uTransmission;   // Base transmission factor
  uniform float uRoughness;      // Microfacet surface roughness
  uniform float uDispersion;     // Chromatic dispersion dlambda/dn
  uniform float uRefractiveIndex;// IOR ~ 1.52
  uniform float uIntensity;
  uniform float uFractureProgress; // Phase 9.0 Act IV fracture initiation (0.0 to 1.0)
  uniform vec3 uColorA;          // Deep obsidian dark (#030712)
  uniform vec3 uColorB;          // Ionized facet rim (#1e293b)
  uniform vec3 uGlowColor;       // Internal amber glow (#f59e0b)
  uniform vec3 uAbsorptionColor; // Beer-Lambert absorption tone (#02040a)
  uniform vec3 uKeyLightDir;     // Architectural key light direction
  uniform vec3 uRimLightDir;     // Grazing rim light direction
  uniform vec3 uObserverPos;
  uniform float uObserverAttention;
  uniform float uObserverProximity;
  uniform vec4 uTouchRipple; // xyz pos, w intensity
  uniform vec3 uAttentionDirection;
  uniform float uAttentionStrength;
  uniform float uHiddenDiscovery;
  uniform float uArchetypeMode;
  uniform vec3 uArchetypeColor;
  uniform float uGravitationalForce;
  uniform float uRecognitionResonance;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying float vFresnel;
  varying float vStress;

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

    // 2. Optical Refinement: Transmission Breathing & Micro-Variations
    float transBreathing = sin(uTime * 0.22) * 0.025;
    float baseTransmission = mix(0.85, 0.28, uMaterialLock);
    float effectiveTransmission = clamp(baseTransmission + transBreathing, 0.18, 0.88);
    float surfaceDensity = mix(0.15, 1.0, uMaterialLock);

    // Micro Refractive Index & Dispersion Instability
    float dynamicIOR = uRefractiveIndex + sin(uTime * 0.18 + vPosition.x * 2.5) * 0.008;
    float dynamicDispersion = uDispersion + sin(uTime * 0.32 + vPosition.y * 3.0) * 0.015;

    // 3. Chromatic Dispersion (Refractive Ray Tracing through Facets)
    float etaR = 1.0 / dynamicIOR;
    float etaG = 1.0 / (dynamicIOR + dynamicDispersion * 0.04);
    float etaB = 1.0 / (dynamicIOR + dynamicDispersion * 0.08);

    vec3 refR = refract(-viewDir, normal, etaR);
    vec3 refG = refract(-viewDir, normal, etaG);
    vec3 refB = refract(-viewDir, normal, etaB);

    vec3 dispersionCol = vec3(
      dot(refR, vec3(1.0, 0.0, 0.0)) * 0.5 + 0.5,
      dot(refG, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5,
      dot(refB, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5
    );

    // 4. Moving Internal Caustic Lattice with Sub-Surface Light Flicker & Observer Caustic Excitation
    float distToObs = length(vPosition - uObserverPos);
    float observerCausticBoost = exp(-distToObs * distToObs * 4.0) * uObserverProximity * (1.5 + uObserverAttention * 2.5);
    float internalFlicker = 0.96 + hash21(floor(vPosition.xy * 28.0 + uTime * 1.8)) * 0.07;
    // Caustic flow drifts toward observer attention vector
    vec3 attentionShift = uAttentionDirection * (uAttentionStrength * 2.2);
    vec3 causticCoord = vPosition * 5.0 + vec3(0.0, 0.0, uTime * 0.6) + attentionShift;
    float c1 = abs(sin(causticCoord.x * 3.0 + sin(causticCoord.y * 2.5)));
    float c2 = abs(cos(causticCoord.y * 3.0 + cos(causticCoord.z * 2.5)));
    float internalCaustics = pow(1.0 - (c1 * c2), 3.5) * effectiveTransmission * internalFlicker * (1.0 + observerCausticBoost);

    // 5. Beer-Lambert Internal Volumetric Absorption
    float opticalDepth = length(vPosition) * 1.8;
    vec3 absorption = exp(-uAbsorptionColor * opticalDepth);

    // 6. Base Obsidian Material Color Gradient
    float facetShade = max(dot(normal, vec3(0.0, 1.0, 0.5)), 0.0);
    vec3 obsidianBase = mix(uColorA, uColorB, facetShade * 0.4);
    obsidianBase = mix(obsidianBase, dispersionCol, dynamicDispersion * (1.0 - uMaterialLock * 0.5));
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

    // 8. Phase 8.5 & 8.75 Fracture Prediction: Golden-Ratio Fault Planes
    const float PHI = 1.6180339887;
    vec3 n1 = normalize(vec3(1.0, PHI, 0.0));
    vec3 n2 = normalize(vec3(1.0, -PHI, 0.0));
    vec3 n3 = normalize(vec3(0.0, 1.0, PHI));
    vec3 n4 = normalize(vec3(0.0, 1.0, -PHI));
    vec3 n5 = normalize(vec3(PHI, 0.0, 1.0));
    vec3 n6 = normalize(vec3(-PHI, 0.0, 1.0));

    float d1 = abs(dot(vPosition, n1));
    float d2 = abs(dot(vPosition, n2));
    float d3 = abs(dot(vPosition, n3));
    float d4 = abs(dot(vPosition, n4));
    float d5 = abs(dot(vPosition, n5));
    float d6 = abs(dot(vPosition, n6));

    float dFracture = min(min(min(d1, d2), min(d3, d4)), min(d5, d6));

    // Phase 8.75 Fracture Prediction Visualization:
    // When tension increases, golden-ratio fault planes become barely visible.
    // Internal stress lines appear briefly, pulse slowly, and disappear.
    // NEVER become cracks — "Something inside is calculating its breaking point."
    float calcWave = sin(uTime * 1.5 - dFracture * 28.0);
    float calcPulse = smoothstep(0.40, 0.92, calcWave);
    float previewLine = smoothstep(0.010, 0.001, dFracture) * calcPulse * uStressPreview;
    vec3 previewEmission = mix(vec3(0.98, 0.65, 0.20), vec3(0.40, 0.82, 1.00), calcPulse) * previewLine * 2.2;

    // Phase 9.0 Act IV Fracture Initiation: Golden-Ratio Fissure Ignition & Optical Disruption
    // The fault planes ignite into luminous incandescent cracks with ionized cyan fringes.
    float fissureCoreWidth = mix(0.003, 0.024, uFractureProgress);
    float fissureCore = smoothstep(fissureCoreWidth, 0.0005, dFracture) * uFractureProgress;
    float fissureAura = exp(-dFracture * dFracture * mix(900.0, 160.0, uFractureProgress)) * uFractureProgress;
    vec3 fissureCol = mix(vec3(0.28, 0.82, 1.00), vec3(1.0, 0.97, 0.88), fissureCore);
    vec3 fissureEmission = fissureCol * (fissureCore * 5.4 + fissureAura * 2.6);

    // Photoelastic Stress Fringes (Birefringence along shear planes)
    float planeStress = exp(-dFracture * dFracture * 160.0) * max(uTension, uFractureProgress);
    float photoPhase = planeStress * 20.0 - uTime * 4.0;
    vec3 photoelasticCol = mix(
      vec3(1.0, 0.58, 0.18), // Hot incandescent amber
      vec3(0.32, 0.82, 1.00), // Electric ionized cyan
      sin(photoPhase) * 0.5 + 0.5
    );
    vec3 stressGlow = photoelasticCol * planeStress * (1.8 + vStress * 2.2);

    // Acoustic / Photonic Concentric Pressure Waves
    float pressureWave = sin(length(vPosition) * 24.0 - uTime * 14.0) * 0.5 + 0.5;
    float pressurePulse = pow(pressureWave, 4.0) * max(uTension, uFractureProgress * 0.8) * 0.45;
    vec3 pressureEmission = vec3(0.95, 0.60, 0.20) * pressurePulse;

    // 9. Internal Quantum Spark Self-Emission (Expanding Core under mounting pressure)
    float distToCore = length(vPosition);
    float coreSpread = mix(6.0, 2.2, max(uTension, uFractureProgress));
    float coreHeartbeat = sin(uTime * (3.0 + max(uTension, uFractureProgress) * 8.0)) * 0.22 + 0.95;
    float internalCoreGlow = exp(-distToCore * distToCore * coreSpread) * coreHeartbeat * internalFlicker;
    vec3 coreEmission = uGlowColor * internalCoreGlow * (2.8 + (uTension + uFractureProgress * 1.5) * 3.2) * effectiveTransmission;

    // 10. Composite Color & Alpha (Controlled brightness - mysterious, never flashy)
    vec3 finalColor = obsidianBase * surfaceDensity;
    finalColor += keyLighting * uMaterialLock;
    finalColor += rimLighting * (0.6 + uMaterialLock * 0.4);
    finalColor += coreEmission;
    finalColor += stressGlow;
    finalColor += previewEmission;
    finalColor += fissureEmission;
    finalColor += pressureEmission;
    finalColor += vec3(0.25, 0.85, 1.0) * internalCaustics * (1.2 + uFractureProgress * 0.8);

    // Fresnel specular rim glow
    finalColor += uGlowColor * pow(vFresnel, 4.0) * uIntensity * 0.45;

    // Phase 9.18: Observer Awakening Response
    // Heightened Fresnel emission and iridescent responsiveness near observer gaze
    float observerFresnel = pow(vFresnel, 1.8) * uObserverProximity * (0.8 + uObserverAttention * 1.4);
    vec3 observerAura = mix(vec3(0.28, 0.85, 1.0), vec3(1.0, 0.88, 0.55), uObserverAttention) * observerFresnel * 1.6;

    // Localized Fresnel activation aligned with Attention Vector
    float attentionAlign = max(0.0, dot(normalize(vPosition), -uAttentionDirection));
    float localizedFresnel = pow(vFresnel, 2.0) * pow(attentionAlign, 2.0) * uAttentionStrength * 2.4;
    vec3 localizedFresnelCol = vec3(0.40, 0.88, 1.00) * localizedFresnel;

    // Touch Gravitational Ripple Radiance
    float distToTouchFrag = length(vPosition - uTouchRipple.xyz);
    float rippleRing = exp(-abs(distToTouchFrag - 0.35) * 7.0) * uTouchRipple.w;
    vec3 rippleEmission = vec3(0.35, 0.92, 1.0) * rippleRing * 2.8;

    // Phase 9.18.5: Hidden Discovery Full Lattice Illumination & Memory Pulse
    float latticeGlow = smoothstep(0.024, 0.001, dFracture) * uHiddenDiscovery * 4.8;
    float discoveryWave = sin(length(vPosition) * 16.0 - uTime * 6.0) * 0.5 + 0.5;
    vec3 discoveryEmission = mix(vec3(0.98, 0.82, 0.35), vec3(0.40, 0.92, 1.00), discoveryWave) * (uHiddenDiscovery * (2.8 + latticeGlow));

    // Phase 9.19: Crystal Personality Response
    vec3 archetypeAura = vec3(0.0);
    if (uArchetypeMode > 0.5 && uArchetypeMode < 1.5) {
      // THE_WITNESS: Mirror obsidian, tranquil deep indigo/pure white rim, pure glassy clarity
      archetypeAura = mix(vec3(0.12, 0.25, 0.45), vec3(0.95, 0.98, 1.0), pow(vFresnel, 3.0)) * 0.45;
    } else if (uArchetypeMode > 1.5 && uArchetypeMode < 2.5) {
      // THE_CATALYST: Ionized energetic flutter, electric cyan/magenta fringe, turbulent surface caustics
      float flutter = sin(uTime * 12.0 + vPosition.y * 15.0) * 0.5 + 0.5;
      archetypeAura = mix(vec3(0.1, 0.85, 1.0), vec3(0.95, 0.2, 0.65), flutter) * pow(vFresnel, 1.5) * 0.75;
    } else if (uArchetypeMode > 2.5) {
      // THE_ARCHITECT: Sacred geometry gold, heightened prismatic chromatic dispersion, luminous facet lattice
      float architectLattice = smoothstep(0.02, 0.002, dFracture);
      archetypeAura = mix(vec3(0.95, 0.75, 0.25), vec3(1.0, 0.92, 0.6), vFresnel) * (0.55 + architectLattice * 0.8);
    }

    // Phase 9.20.5: Crystal Memory Recognition Waves
    float distFromCenter = length(vPosition);
    float recognitionRing = sin(distFromCenter * 16.0 - uTime * 6.0) * 0.5 + 0.5;
    float recognitionGlow = pow(recognitionRing, 4.0) * uRecognitionResonance;
    vec3 recognitionCol = mix(vec3(0.35, 0.85, 1.0), vec3(1.0, 0.95, 0.7), recognitionRing) * recognitionGlow * 2.8;

    finalColor += observerAura + localizedFresnelCol + rippleEmission + discoveryEmission + archetypeAura + recognitionCol;


    // Alpha transitions from translucent hologram (0.45) to solid obsidian glass (0.96)
    float finalAlpha = mix(0.45, 0.96, uMaterialLock);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
