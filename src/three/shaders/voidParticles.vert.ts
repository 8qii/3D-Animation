export const voidParticlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uMouseWorld;
  uniform float uAttention;
  uniform float uExcitation;
  uniform float uBreathPhase;
  uniform float uTransition; // Cross-scene transition progress [0..1]
  uniform float uMorphStage; // 4-Stage Geometry Morph: [0..3]
                             // 0: chaos, 1: orbital, 2: vertex, 3: surface

  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;

  varying vec2 vUv;
  varying float vDepth;
  varying float vPhase;
  varying float vExcitation;
  varying float vInfluence;
  varying float vTransition;
  varying float vMorphStage;

  // Golden Ratio constant Phi
  const float PHI = 1.61803398875;
  const float INV_NORM = 0.52573111211; // 1 / sqrt(1 + Phi^2)

  // Analytical 12 Golden Ratio Icosahedron Vertices
  vec3 getIcosahedronVertex(int idx, float radius) {
    float a = 1.0 * INV_NORM * radius;
    float b = PHI * INV_NORM * radius;

    // XY Plane Rectangle
    if (idx == 0) return vec3(-a,  b, 0.0);
    if (idx == 1) return vec3( a,  b, 0.0);
    if (idx == 2) return vec3(-a, -b, 0.0);
    if (idx == 3) return vec3( a, -b, 0.0);

    // YZ Plane Rectangle
    if (idx == 4) return vec3(0.0, -a,  b);
    if (idx == 5) return vec3(0.0,  a,  b);
    if (idx == 6) return vec3(0.0, -a, -b);
    if (idx == 7) return vec3(0.0,  a, -b);

    // ZX Plane Rectangle
    if (idx == 8)  return vec3( b, 0.0, -a);
    if (idx == 9)  return vec3( b, 0.0,  a);
    if (idx == 10) return vec3(-b, 0.0, -a);
    return vec3(-b, 0.0, a);
  }

  void main() {
    vUv = uv;
    vPhase = aPhase;
    vExcitation = uExcitation;
    vTransition = uTransition;
    vMorphStage = uMorphStage;

    // 1. Kinetic acceleration
    float effectiveSpeed = aSpeed * (1.0 + uExcitation * 2.2 + uTransition * 1.8);

    // STAGE 0: Chaos Position (Act I Brownian micro-drift)
    vec3 brownianOffset;
    brownianOffset.x = sin(uTime * 0.06 * effectiveSpeed + aPhase * 6.28318) * 0.35
                     + cos(uTime * 0.03 + aPhase * 3.14) * 0.15;
    brownianOffset.y = cos(uTime * 0.05 * effectiveSpeed + aPhase * 4.71238) * 0.30
                     + sin(uTime * 0.025 + aPhase * 2.71) * 0.12;
    brownianOffset.z = sin(uTime * 0.04 * effectiveSpeed + aPhase * 5.12345) * 0.25;
    brownianOffset *= (0.85 + uBreathPhase * 0.30);

    vec3 chaosPos = aOffset * (1.0 - uTransition * 0.35) + brownianOffset;

    // STAGE 1: Orbital Position (Act II Keplerian concentric shells)
    float shellIndex = floor(aPhase * 4.0);
    float targetRadius = 0.85 + shellIndex * 0.80;
    float keplerSpeed = (0.28 / sqrt(targetRadius)) * (0.8 + aSpeed * 0.4);
    float orbitAngle = aPhase * 6.28318 + uTime * keplerSpeed;
    float cosTilt = 0.951;
    float sinTilt = 0.309;
    vec3 orbitalPos;
    orbitalPos.x = cos(orbitAngle) * targetRadius;
    orbitalPos.y = sin(orbitAngle) * targetRadius * cosTilt;
    orbitalPos.z = sin(orbitAngle) * targetRadius * sinTilt + sin(aPhase * 16.0 + uTime * 0.2) * 0.12;

    // STAGE 2: Vertex Position (Matter Genesis 12 Golden Ratio nodes)
    int vIdx = int(floor(aPhase * 12.0));
    vec3 vertexPos = getIcosahedronVertex(vIdx, 1.45);
    // Subtle cluster aura around vertex
    vec3 clusterJitter = vec3(
      sin(aPhase * 25.0 + uTime) * 0.06,
      cos(aPhase * 31.0 + uTime * 1.1) * 0.06,
      sin(aPhase * 47.0 + uTime * 0.9) * 0.06
    );
    vertexPos += clusterJitter;

    // STAGE 3: Surface Position (20 Triangular Facet Distribution)
    // Interpolate between two adjacent vertices of a facet
    int nextVIdx = int(mod(float(vIdx + 1), 12.0));
    vec3 vA = getIcosahedronVertex(vIdx, 1.45);
    vec3 vB = getIcosahedronVertex(nextVIdx, 1.45);
    float facetT = fract(aPhase * 7.0);
    vec3 surfacePos = mix(vA, vB, facetT);
    vec3 normalOutward = normalize(surfacePos);
    surfacePos += normalOutward * (sin(aPhase * 50.0 + uTime * 2.0) * 0.04);

    // Observer Gravitational Swirl
    vec3 toMouse = uMouseWorld - chaosPos;
    float distToMouse = length(toMouse.xy);
    float influence = exp(-distToMouse * distToMouse / 5.5) * (0.35 + uAttention * 0.95);
    vInfluence = clamp(influence, 0.0, 1.0);
    vec3 radialForce = normalize(vec3(toMouse.xy, 0.0)) * influence * 0.85;

    // 4-STAGE GEOMETRY MORPH PIPELINE:
    // chaos (0.0) -> orbital (1.0) -> vertex (2.0) -> surface (3.0)
    vec3 morphTarget = chaosPos;
    if (uMorphStage <= 1.0) {
      morphTarget = mix(chaosPos, orbitalPos, uMorphStage);
    } else if (uMorphStage <= 2.0) {
      morphTarget = mix(orbitalPos, vertexPos, uMorphStage - 1.0);
    } else {
      morphTarget = mix(vertexPos, surfacePos, uMorphStage - 2.0);
    }

    vec3 finalWorldCenter = morphTarget + radialForce * (1.0 - clamp(uMorphStage * 0.35, 0.0, 0.7));

    vec4 mvCenter = modelViewMatrix * vec4(finalWorldCenter, 1.0);
    vDepth = -mvCenter.z;

    // Dynamic bokeh sizing
    float focalDistance = 7.0 - uTransition * 1.5;
    float defocus = abs(vDepth - focalDistance) * 0.08;
    float expansion = 1.0 + vInfluence * 0.65 + uExcitation * 0.85;
    float bokehSize = aScale * (0.042 + defocus * 0.065) * expansion;

    vec3 billboardingVertex = mvCenter.xyz + vec3(position.xy * bokehSize, 0.0);
    gl_Position = projectionMatrix * vec4(billboardingVertex, 1.0);
  }
`;
