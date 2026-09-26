export const observerImprintVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uImprintIntensity; // [0, 1] scales with visits / time
  uniform float uStillness;
  uniform float uObserverAttention;
  uniform vec3 uObserverPos;
  uniform float uArchetypeMode; // 0=Initiate, 1=Witness, 2=Catalyst, 3=Architect

  attribute vec3 aSeed;
  attribute float aSize;
  attribute float aConnectionIndex;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Subtle breathing harmonic
    float breath = sin(uTime * 1.2 + aSeed.x * 6.28) * 0.035;
    vec3 pos = position * (1.0 + breath);

    // Observer gaze magnetism
    float distToObs = length(pos - uObserverPos);
    float obsPull = exp(-distToObs * distToObs * 3.0) * uObserverAttention * 0.04;
    pos += normalize(pos + vec3(0.0001)) * obsPull;

    // Personality Imprint Coloration
    vec3 col = vec3(0.3, 0.75, 1.0); // Default Initiate cyan
    if (uArchetypeMode > 0.5 && uArchetypeMode < 1.5) {
      // THE_WITNESS: Deep sapphire to tranquil silver-white
      col = mix(vec3(0.15, 0.45, 0.95), vec3(0.92, 0.96, 1.00), aSeed.y);
    } else if (uArchetypeMode > 1.5 && uArchetypeMode < 2.5) {
      // THE_CATALYST: Hot energetic magenta to electric ionized cyan
      col = mix(vec3(0.95, 0.15, 0.65), vec3(0.10, 0.90, 1.00), sin(uTime * 4.0 + aSeed.z * 10.0) * 0.5 + 0.5);
    } else if (uArchetypeMode > 2.5) {
      // THE_ARCHITECT: Sacred luminous gold and warm amber
      col = mix(vec3(0.98, 0.68, 0.15), vec3(1.00, 0.92, 0.45), aSeed.y);
    }

    vColor = col;

    // Alpha scales with imprint intensity and proximity to observer attention
    float atten = 1.0 + exp(-distToObs * 2.0) * uObserverAttention * 1.5;
    vAlpha = clamp(uImprintIntensity * (0.35 + 0.65 * aSeed.x) * atten, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (aSize * (2.5 + atten * 1.5) * (300.0 / -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;
