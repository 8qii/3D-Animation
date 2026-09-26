export const exposedCoreFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFractureProgress;
  uniform float uFacetMemoryProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying float vFresnel;

  void main() {
    float coreDist = length(vPosition);

    // Three-layer Genesis memory spectrum:
    // 1. Act I Void: cold deep cyan quantum fluctuation traces
    vec3 voidCyan = vec3(0.18, 0.78, 1.00);

    // 2. Act II Singularity: intense amber kinetic flame
    vec3 singularityAmber = vec3(1.00, 0.58, 0.12);

    // 3. Act III Monolith: sacred pure incandescent white-gold
    vec3 monolithGold = vec3(1.00, 0.96, 0.88);

    // Dynamic blending between Genesis memory layers:
    // Core breathes with memory waves
    float memoryWave = sin(uTime * 1.8 + coreDist * 8.0) * 0.5 + 0.5;
    vec3 memoryCol = mix(voidCyan, singularityAmber, memoryWave);
    memoryCol = mix(memoryCol, monolithGold, pow(1.0 - clamp(coreDist * 1.5, 0.0, 1.0), 2.0));

    // Internal radiant heart
    float innerRadiance = exp(-coreDist * 3.2);
    float outerCorona = pow(vFresnel, 1.8);

    // Core luminosity rises smoothly as facets detach and memory drifts
    float totalLuminosity = (1.6 + uFractureProgress * 1.8 + uFacetMemoryProgress * 2.2);

    vec3 finalColor = memoryCol * (innerRadiance * 3.5 + outerCorona * 2.0) * totalLuminosity;
    float finalAlpha = clamp(innerRadiance * 0.95 + outerCorona * 0.75, 0.0, 1.0) * (0.3 + uFractureProgress * 0.7);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
