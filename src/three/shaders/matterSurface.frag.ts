export const matterSurfaceFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSurfaceProgress;
  uniform float uExcitation;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vBarycentric;
  varying float vFresnel;

  void main() {
    if (uSurfaceProgress <= 0.001) {
      discard;
    }

    // 1. Facet wireframe edge detection using barycentric coordinates
    vec3 d = fwidth(vBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.5, vBarycentric);
    float edgeFactor = min(min(a3.x, a3.y), a3.z);
    float wireframeEdge = 1.0 - edgeFactor;

    // 2. Translucent obsidian glass facet interior
    vec3 colDeepObsidian = vec3(0.04, 0.07, 0.14);
    vec3 colCyanGlow      = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colAmberPrism    = vec3(0.96, 0.62, 0.15); // #f59e0b
    vec3 colWhiteEdge     = vec3(0.98, 0.99, 1.00);

    // Facet interior gradient
    vec3 surfaceColor = colDeepObsidian;

    // Chromatic dispersion hooks along Fresnel rim
    vec3 fresnelColor = mix(colCyanGlow, colAmberPrism, vFresnel * 0.7);
    surfaceColor += fresnelColor * vFresnel * 1.6;

    // Facet boundary edge highlight
    surfaceColor += colWhiteEdge * wireframeEdge * 1.2;

    // 3. Progressive opacity reveal:
    // Stays translucent (max alpha ~ 0.45) to preserve the mystery for Act III
    float baseAlpha = mix(0.12, 0.35, vFresnel);
    float edgeAlpha = wireframeEdge * 0.65;
    float totalAlpha = (baseAlpha + edgeAlpha) * uSurfaceProgress;
    totalAlpha = clamp(totalAlpha, 0.0, 0.55);

    gl_FragColor = vec4(surfaceColor, totalAlpha);
  }
`;
