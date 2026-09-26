export const facetMemoryFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFacetMemoryProgress;

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

    // Subtle edge fade
    float lineFade = sin(vLineCoord * 3.14159);
    float finalAlpha = vAlpha * pow(lineFade, 0.6) * 0.75;

    gl_FragColor = vec4(threadCol * 1.8, finalAlpha);
  }
`;
