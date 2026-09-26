export const ghostRibbonVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGhostIntensity;
  uniform float uArchetypeMode;
  uniform vec3 uObserverPos;
  uniform float uObserverAttention;
  uniform float uProximityResonance;

  attribute float aProgress; // [0, 1] parameter along trajectory ribbon
  attribute vec3 aOffset;
  attribute float aWidth;

  varying float vProgress;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vProgress = aProgress;

    // Breathing harmonic motion
    float orbitWave = sin(uTime * 0.8 + aProgress * 6.28318) * 0.05;
    vec3 pos = position + aOffset * (1.0 + orbitWave);

    // Observer interactive attraction
    float distToObs = length(pos - uObserverPos);
    float pullStrength = exp(-distToObs * distToObs * 2.5) * (uObserverAttention * 0.06 + uProximityResonance * 0.08);
    pos += normalize(uObserverPos - pos + vec3(0.0001)) * pullStrength;

    // Archetype Spectral Palette
    vec3 baseColor = vec3(0.3, 0.75, 1.0); // Default Initiate
    if (uArchetypeMode > 0.5 && uArchetypeMode < 1.5) {
      // THE_WITNESS: Celestial sky-blue, calm silver-white
      baseColor = mix(vec3(0.20, 0.55, 0.95), vec3(0.90, 0.95, 1.00), sin(aProgress * 3.14159));
    } else if (uArchetypeMode > 1.5 && uArchetypeMode < 2.5) {
      // THE_CATALYST: Hot energetic magenta to electric cyan
      baseColor = mix(vec3(0.95, 0.20, 0.65), vec3(0.15, 0.90, 1.00), sin(aProgress * 6.28 + uTime * 2.0) * 0.5 + 0.5);
    } else if (uArchetypeMode > 2.5) {
      // THE_ARCHITECT: Sacred geometry gold and luminous amber
      baseColor = mix(vec3(0.98, 0.72, 0.18), vec3(1.00, 0.94, 0.50), sin(aProgress * 4.0) * 0.5 + 0.5);
    }

    // Resonance surge
    vec3 resonanceGlow = vec3(1.0, 1.0, 1.0) * uProximityResonance * 0.6;
    vColor = baseColor + resonanceGlow;

    // Alpha modulated by traveling light wave & overall ghost intensity
    float travelingWave = sin(aProgress * 14.0 - uTime * 3.0) * 0.5 + 0.5;
    vAlpha = clamp(uGhostIntensity * (0.25 + 0.75 * travelingWave + uProximityResonance * 0.5), 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
