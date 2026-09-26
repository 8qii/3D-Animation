export const vectorGridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uGridReveal;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    if (uGridReveal <= 0.001) {
      discard;
    }

    vec2 coord = (vUv - 0.5) * 6.0;
    float dist = length(coord);

    if (dist > 3.0) {
      discard;
    }

    // Grid line calculation with screen-space derivative anti-aliasing
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);
    float gridPattern = 1.0 - min(line, 1.0);

    // Primary Cartesian crosshair axes (x=0, y=0)
    vec2 axes = abs(coord) / fwidth(coord);
    float axisLine = min(axes.x, axes.y);
    float axisPattern = (1.0 - min(axisLine, 1.0)) * 1.5;

    // Concentric coordinate rings
    float ring1 = abs(dist - 1.0) / fwidth(dist);
    float ring2 = abs(dist - 2.0) / fwidth(dist);
    float rings = (1.0 - min(ring1, 1.0)) * 0.8 + (1.0 - min(ring2, 1.0)) * 0.6;

    float combined = max(gridPattern * 0.35, max(axisPattern, rings));

    // Distance falloff from central singularity
    float radialFalloff = smoothstep(2.8, 0.4, dist);

    // Color transition: electric cyan to solar amber laser
    vec3 cyanLaser  = vec3(0.20, 0.85, 1.00);
    vec3 amberLaser = vec3(1.00, 0.70, 0.20);
    vec3 laserColor = mix(cyanLaser, amberLaser, uGridReveal * 0.6);

    // Alpha modulation with uGridReveal
    float alpha = combined * radialFalloff * uGridReveal * 0.55;

    gl_FragColor = vec4(laserColor, alpha);
  }
`;
