export const crystalVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uDistortion;
  uniform float uTension; // Phase 8.5 internal stress tension (0.0 to 1.0)
  uniform float uFractureProgress; // Phase 9.0 Act IV fracture initiation (0.0 to 1.0)
  uniform vec3 uObserverPos;
  uniform float uObserverAttention;
  uniform float uObserverProximity;
  uniform vec4 uTouchRipple; // xyz pos, w intensity
  uniform vec3 uAttentionDirection;
  uniform float uAttentionStrength;
  uniform float uHiddenDiscovery;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying float vFresnel;
  varying float vStress;

  // Simple noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // 1. Simplex Noise Base Organic Breathing
    float noise = snoise(position * 1.5 + vec3(uTime * 0.2));

    // 2. Phase 8.5 Subtle Vertex Displacement & Microscopic Facet Vibration
    float facetJitter = sin(uTime * 48.0 + dot(position, vec3(14.2, 18.9, 11.7))) * 0.0035 * uTension;
    float internalPulse = sin(uTime * 22.0 - length(position) * 6.0) * 0.0045 * uTension;
    float tensionDisplacement = facetJitter + internalPulse;

    // 3. Phase 9.0 Act IV Golden-Ratio Fracture Stress Deformation
    const float PHI = 1.6180339887;
    vec3 n1 = normalize(vec3(1.0, PHI, 0.0));
    vec3 n2 = normalize(vec3(1.0, -PHI, 0.0));
    vec3 n3 = normalize(vec3(0.0, 1.0, PHI));
    vec3 n4 = normalize(vec3(0.0, 1.0, -PHI));
    vec3 n5 = normalize(vec3(PHI, 0.0, 1.0));
    vec3 n6 = normalize(vec3(-PHI, 0.0, 1.0));

    float s1 = dot(position, n1);
    float s2 = dot(position, n2);
    float s3 = dot(position, n3);
    float s4 = dot(position, n4);
    float s5 = dot(position, n5);
    float s6 = dot(position, n6);

    float d1 = abs(s1);
    float d2 = abs(s2);
    float d3 = abs(s3);
    float d4 = abs(s4);
    float d5 = abs(s5);
    float d6 = abs(s6);
    float dFracture = min(min(min(d1, d2), min(d3, d4)), min(d5, d6));

    // Opposing directional shear across the golden ratio fault planes
    float shear1 = sign(s1) * smoothstep(0.15, 0.0, d1);
    float shear2 = sign(s2) * smoothstep(0.15, 0.0, d2);
    float shear3 = sign(s3) * smoothstep(0.15, 0.0, d3);
    vec3 shearOffset = (n1 * shear1 + n2 * shear2 + n3 * shear3) * (0.028 * uFractureProgress);

    // Microscopic outward normal dislocation at the fracture seams (monolith remains mostly intact)
    float seamGap = smoothstep(0.08, 0.005, dFracture) * (0.038 * uFractureProgress);
    vec3 fractureDeformation = normal * seamGap + shearOffset;

    // Phase 9.18: Observer Awakening Micro-Displacement & Gravitational Response
    float distToObserver = length(position - uObserverPos);
    float observerRipple = sin(distToObserver * 12.0 - uTime * 4.0) * exp(-distToObserver * 1.5) * (0.016 * uObserverAttention * uObserverProximity);
    
    // Touch Gravitational Disturbance Ripple
    float distToTouch = length(position - uTouchRipple.xyz);
    float touchWave = sin(distToTouch * 18.0 - uTime * 9.0) * exp(-distToTouch * 2.2) * (0.032 * uTouchRipple.w);

    // Phase 9.18.5: Hidden Discovery Memory Pulse
    float discoveryPulse = sin(uTime * 3.5 - length(position) * 4.5) * (0.025 * uHiddenDiscovery);

    vec3 displacedPosition = position + normal * (noise * uDistortion + tensionDisplacement + observerRipple + touchWave + discoveryPulse) + fractureDeformation;

    // Compute localized vertex stress metric for fragment shader photoelastic fringes
    vStress = clamp(uTension * (0.35 + 0.65 * abs(noise) + abs(facetJitter) * 60.0) + uFractureProgress * 0.8, 0.0, 1.0);

    vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPos.xyz;

    // Fresnel factor calculation
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vec3 viewDirection = normalize(cameraPosition - worldPos.xyz);
    vFresnel = pow(1.0 - max(dot(viewDirection, worldNormal), 0.0), 3.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;
