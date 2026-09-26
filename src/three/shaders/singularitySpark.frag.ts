export const singularitySparkFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAttention;
  uniform float uExcitation;
  uniform float uBreathPhase;
  uniform float uSparkProgress; // [0..1]

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Analytical 2D Simplex Noise for plasma turbulence
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion for multi-octave solar plasma
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      total += amp * snoise(p);
      p = p * 2.1 + vec2(1.2, 3.4);
      amp *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv - vec2(0.5);
    float dist = length(uv);

    if (dist > 0.49 || uSparkProgress <= 0.001) {
      discard;
    }

    float angle = atan(uv.y, uv.x);

    // 1. Gravitational Lens Distortion (Einstein Ring Field)
    // Light is bent towards the singularity mass center
    float einsteinRadius = 0.16 * uSparkProgress;
    float lensFactor = 0.045 * uSparkProgress / (dist + 0.04);
    float warpedDist = dist - lensFactor;

    // Einstein Ring caustic peak
    float einsteinRing = exp(-pow((dist - einsteinRadius) * 28.0, 2.0));

    // Chromatic dispersion around gravitational boundary
    float ringR = exp(-pow((dist - einsteinRadius * 1.03) * 30.0, 2.0));
    float ringG = exp(-pow((dist - einsteinRadius) * 30.0, 2.0));
    float ringB = exp(-pow((dist - einsteinRadius * 0.97) * 30.0, 2.0));
    vec3 einsteinColor = vec3(ringR, ringG, ringB) * vec3(1.0, 0.75, 0.45);

    // 2. Internal Energy Core & Plasma Turbulence
    float plasmaSpeed = uTime * (1.2 + uExcitation * 2.5);
    vec2 noiseCoord = uv * 8.0 + vec2(cos(angle), sin(angle)) * 0.5;
    float plasmaNoise = fbm(noiseCoord + vec2(plasmaSpeed * 0.4, -plasmaSpeed * 0.3));

    // Hyper-dense central point charge
    float coreRadius = 0.045 * (1.0 + uBreathPhase * 0.2 + uAttention * 0.3);
    float coreSharp = exp(-pow(dist / coreRadius, 2.2));

    // Internal radiant glow gradient
    float innerGlow = exp(-dist * 18.0);
    float outerCorona = exp(-dist * 7.5);

    // 3. Observer Attention Flares & Corona Rays
    float rayFreq = 16.0;
    float rays = sin(angle * rayFreq + uTime * 0.8) * 0.5 + 0.5;
    rays *= sin(angle * 8.0 - uTime * 1.4) * 0.5 + 0.5;
    float coronaRays = rays * exp(-dist * 11.0) * (0.3 + uAttention * 1.2);

    // 4. Color Palette Composition
    vec3 colDeepAmber = vec3(0.96, 0.55, 0.08); // #f59e0b
    vec3 colSolarGold = vec3(0.98, 0.75, 0.14); // #fbbf24
    vec3 colCyanIon   = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colPureWhite = vec3(1.00, 1.00, 1.00);

    // Base color gradient
    vec3 color = mix(colCyanIon, colDeepAmber, smoothstep(0.35, 0.08, dist));
    color = mix(color, colSolarGold, innerGlow);
    color += einsteinColor * 1.8 * (0.8 + uExcitation * 1.2);
    color += coronaRays * colSolarGold * 2.2;

    // Super-radiant point charge ignition
    float centerIntensity = coreSharp * (3.0 + uExcitation * 2.5 + uAttention * 2.0);
    color = mix(color, colPureWhite, clamp(centerIntensity, 0.0, 1.0));
    color += colPureWhite * pow(coreSharp, 3.0) * 4.0;

    // Additive plasma noise texture in the mantle
    color += (plasmaNoise * 0.25) * colSolarGold * innerGlow;

    // 5. Total Alpha Falloff
    float alpha = coreSharp * 1.5 + innerGlow * 0.85 + outerCorona * 0.45 + einsteinRing * 0.9;
    alpha += coronaRays * 0.6;
    alpha *= smoothstep(0.48, 0.22, dist);
    alpha *= uSparkProgress;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;
