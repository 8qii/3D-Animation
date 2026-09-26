export const facetMemoryFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFacetMemoryProgress;
  uniform float uCollapseProgress;

  varying float vLineCoord;
  varying float vAlpha;
  varying vec3 vWorldPosition;

  void main() {
    if (vAlpha <= 0.001) {
      discard;
    }

    // Mathematical memory color: cyan quantum filament fading into sacred golden memory
    vec3 cyanTrace = vec3(0.25, 0.85, 1.00);
    vec3 goldTrace = vec3(1.00, 0.78, 0.35);

    // Color pulses along the thread length
    float colorShift = sin(vLineCoord * 3.14159 + uTime * 2.0) * 0.5 + 0.5;
    vec3 threadCol = mix(cyanTrace, goldTrace, colorShift);

    // Phase 9.16: Under collapse, memory color shifts toward blinding white-hot photon energy
    vec3 hotWhite = vec3(1.0, 0.98, 0.95);
    threadCol = mix(threadCol, hotWhite, uCollapseProgress * 0.75);

    // Subtle edge fade
    float lineFade = sin(vLineCoord * 3.14159);
    float finalAlpha = vAlpha * pow(lineFade, 0.6) * 0.75;

    // Brightness increases from 100% to 180% (1.8 -> 3.24)
    float brightnessBoost = mix(1.8, 3.24, uCollapseProgress);

    gl_FragColor = vec4(threadCol * brightnessBoost, finalAlpha);
  }
`;
