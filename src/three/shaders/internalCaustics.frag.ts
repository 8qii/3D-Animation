export const internalCausticsFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform float uExcitation;

  varying vec3 vWorldPosition;
  varying float vChordIndex;
  varying float vProgress;

  // Analytical Simplex-like noise for 3D crystal density
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
                   mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
                   mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    if (vProgress <= 0.01) {
      discard;
    }

    float distFromCenter = length(vWorldPosition);

    // 1. Dynamic Caustic Network Hooks
    vec3 causticCoord = vWorldPosition * 6.5 + vec3(0.0, 0.0, uTime * 0.8);
    float c1 = abs(sin(causticCoord.x * 2.5 + sin(causticCoord.y * 2.0)));
    float c2 = abs(cos(causticCoord.y * 2.5 + cos(causticCoord.z * 2.0)));
    float causticWeb = pow(1.0 - (c1 * c2), 4.0);

    // 2. 3D Internal Density Noise (crystalline lattice imperfections)
    float density = noise3D(vWorldPosition * 4.0 + vec3(uTime * 0.15));
    density = smoothstep(0.3, 0.8, density);

    // 3. Central Focal Caustic Point
    float focalCore = exp(-distFromCenter * distFromCenter * 8.0);

    // Palette: Ethereal cyan caustic rays with amber focal flash
    vec3 colCyanCaustic = vec3(0.25, 0.85, 1.0);
    vec3 colAmberCore   = vec3(1.00, 0.70, 0.18);
    vec3 colWhiteLight  = vec3(1.0);

    vec3 color = mix(colCyanCaustic, colAmberCore, focalCore);
    color += colWhiteLight * (causticWeb * 1.5 + focalCore * 2.0);
    color += colCyanCaustic * density * 0.8;

    // Intensity fades outward toward vertices
    float alpha = (focalCore * 1.2 + causticWeb * 0.7 + density * 0.35) * vProgress;
    alpha *= smoothstep(1.5, 0.2, distFromCenter);
    alpha = clamp(alpha, 0.0, 0.65);

    gl_FragColor = vec4(color, alpha);
  }
`;
