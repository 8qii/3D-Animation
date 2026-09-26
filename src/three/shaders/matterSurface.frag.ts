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
    if (uSurfaceProgress <= 0.005) {
      discard;
    }

    // 1. Facet wireframe edge detection using barycentric coordinates
    vec3 d = fwidth(vBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.5, vBarycentric);
    float edgeFactor = min(min(a3.x, a3.y), a3.z);
    float wireframeEdge = 1.0 - edgeFactor;

    // 2. Holographic Thin-Film Iridescence Fringes
    float thinFilmPhase = vFresnel * 18.0 - uTime * 1.4;
    float fringe = sin(thinFilmPhase) * 0.5 + 0.5;
    vec3 colIridescent = mix(
      vec3(0.20, 0.85, 0.98), // Cyan interference
      vec3(0.98, 0.65, 0.20), // Amber interference
      fringe
    );

    // Subtle holographic quantum lattice scanlines
    float scanline = sin((vBarycentric.x + vBarycentric.y * 1.732) * 55.0 + uTime * 2.0) * 0.12;

    // 3. Facet Colors
    vec3 colDeepObsidian = vec3(0.03, 0.06, 0.12);
    vec3 colWhiteEdge     = vec3(0.98, 0.99, 1.00);

    vec3 surfaceColor = colDeepObsidian;
    surfaceColor += colIridescent * (vFresnel * 1.8 + scanline);
    surfaceColor += colWhiteEdge * wireframeEdge * 1.25;

    // 4. Strict Translucent Holographic Constraint:
    // Stays strictly non-opaque (maximum alpha <= 0.45)
    float baseAlpha = mix(0.08, 0.32, vFresnel);
    float edgeAlpha = wireframeEdge * 0.55;
    float totalAlpha = (baseAlpha + edgeAlpha) * uSurfaceProgress;
    totalAlpha = clamp(totalAlpha, 0.0, 0.45);

    gl_FragColor = vec4(surfaceColor, totalAlpha);
  }
`;
