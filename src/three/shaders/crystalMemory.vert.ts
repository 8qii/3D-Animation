export const crystalMemoryVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMemoryIntensity; // [0, 1]
  uniform float uStillness;       // [0, 1] freezes motion down to 5%
  uniform float uPixelRatio;
  uniform float uHiddenDiscovery;

  attribute vec3 aSeed;
  attribute float aLayer; // 0 = Void, 1 = Singularity, 2 = Matter
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vLayer;

  void main() {
    vLayer = aLayer;
    float mem = clamp(uMemoryIntensity, 0.0, 1.0);
    // Final stillness reduces particle motion down to 5%
    float motionScale = mix(1.0, 0.05, clamp(uStillness, 0.0, 1.0));
    float t = uTime * motionScale;

    vec3 localPos = vec3(0.0);

    if (aLayer < 0.5) {
      // 1. VOID MEMORY LAYER (Deep Cyan Dust, near-frozen Brownian drift)
      float r = mix(0.35, 1.08, aSeed.z);
      float phi = aSeed.x * 6.28318;
      float theta = aSeed.y * 3.14159;
      vec3 baseSphere = vec3(
        sin(theta) * cos(phi),
        cos(theta),
        sin(theta) * sin(phi)
      ) * r;

      vec3 brownian = vec3(
        sin(t * 0.35 + aSeed.x * 24.0),
        cos(t * 0.28 + aSeed.y * 24.0),
        sin(t * 0.32 + aSeed.z * 24.0)
      ) * 0.06;

      localPos = baseSphere + brownian;
      vColor = mix(vec3(0.08, 0.45, 0.75), vec3(0.25, 0.85, 0.98), aSeed.y);
      vAlpha = mem * (0.20 + 0.30 * aSeed.x);

    } else if (aLayer < 1.5) {
      // 2. SINGULARITY MEMORY LAYER (Amber Keplerian Orbital Traces)
      float orbitSpeed = (0.55 + aSeed.x * 0.65);
      float angle = t * orbitSpeed + aSeed.y * 6.28318;
      float radius = mix(0.28, 0.92, aSeed.z);

      // Inclined elliptical orbit
      vec3 orbitPos = vec3(
        cos(angle) * radius,
        sin(angle * 1.2 + aSeed.x * 3.14) * radius * 0.55,
        sin(angle) * radius
      );

      // Micro harmonic vibration
      vec3 orbitWave = vec3(
        sin(angle * 3.0) * 0.02,
        cos(angle * 3.0) * 0.02,
        0.0
      );

      localPos = orbitPos + orbitWave;
      float pulse = sin(t * 1.8 + aSeed.x * 12.0) * 0.5 + 0.5;
      vColor = mix(vec3(0.95, 0.50, 0.12), vec3(0.98, 0.78, 0.28), pulse);
      vAlpha = mem * (0.25 + 0.35 * pulse);

    } else {
      // 3. MATTER MEMORY LAYER (White Crystalline Photons around Core)
      float coreRadius = mix(0.06, 0.42, aSeed.z);
      float goldenAngle = aSeed.x * 6.28318 * 1.6180339887;
      float elevation = (aSeed.y - 0.5) * 2.0;

      vec3 corePos = vec3(
        sqrt(1.0 - elevation * elevation) * cos(goldenAngle),
        elevation,
        sqrt(1.0 - elevation * elevation) * sin(goldenAngle)
      ) * coreRadius;

      // Subtle core breath
      float coreBreath = sin(t * 2.2 + aSeed.y * 8.0) * 0.03;
      localPos = corePos * (1.0 + coreBreath);

      vColor = vec3(0.96, 0.98, 1.00);
      vAlpha = mem * (0.35 + 0.45 * sin(t * 1.5 + aSeed.z * 6.0));
    }

    // Strict geometric boundary containment inside crystal
    if (length(localPos) > 1.15) {
      localPos = normalize(localPos) * 1.15;
    }

    // Phase 9.18.5: Hidden Discovery Memory Surge
    vAlpha = mix(vAlpha, min(1.0, vAlpha * 2.2 + 0.35), uHiddenDiscovery);
    vColor = mix(vColor, vec3(1.0, 0.92, 0.65), uHiddenDiscovery * 0.45);

    vec4 mvPosition = modelViewMatrix * vec4(localPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point sizing with discovery expansion
    gl_PointSize = aSize * uPixelRatio * (24.0 / -mvPosition.z) * (1.0 + uHiddenDiscovery * 0.85);
  }
`;

