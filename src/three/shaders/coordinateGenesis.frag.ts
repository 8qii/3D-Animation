export const coordinateGenesisFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uGenesisProgress; // Emergence progress [0..1]
  uniform float uStabilization;   // Geometry stabilization [0..1]
  uniform float uExcitation;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Antialiased line drawing helper
  float drawLine(float dist, float thickness) {
    float delta = fwidth(dist);
    return 1.0 - smoothstep(thickness - delta, thickness + delta, dist);
  }

  void main() {
    // Coordinate space centered at origin [-4.0, 4.0]
    vec2 p = (vUv - vec2(0.5)) * 8.0;
    float dist = length(p);

    if (uGenesisProgress <= 0.001) {
      discard;
    }

    // Outer expansion frontier
    float maxReach = 3.8 * uGenesisProgress;
    if (dist > maxReach) {
      discard;
    }

    float angle = atan(p.y, p.x);

    // 1. Cartesian Main Axes
    // X Axis: Amber line along y = 0
    float distToX = abs(p.y);
    float xAxis = drawLine(distToX, 0.015);
    xAxis *= smoothstep(0.12, 0.25, abs(p.x)); // Clearance around core

    // Y Axis: Cyan line along x = 0
    float distToY = abs(p.x);
    float yAxis = drawLine(distToY, 0.015);
    yAxis *= smoothstep(0.12, 0.25, abs(p.y)); // Clearance around core

    // 2. Graduation Ticks along Axes
    // Ticks every 0.5 units
    float tickX = drawLine(abs(fract(p.x * 2.0 + 0.5) - 0.5) * 0.5, 0.012);
    tickX *= step(abs(p.y), 0.08) * step(0.25, abs(p.x));

    float tickY = drawLine(abs(fract(p.y * 2.0 + 0.5) - 0.5) * 0.5, 0.012);
    tickY *= step(abs(p.x), 0.08) * step(0.25, abs(p.y));

    // Major metric ticks at every 1.0 unit (longer)
    float majorTickX = drawLine(abs(fract(p.x + 0.5) - 0.5), 0.014);
    majorTickX *= step(abs(p.y), 0.16) * step(0.25, abs(p.x));

    float majorTickY = drawLine(abs(fract(p.y + 0.5) - 0.5), 0.014);
    majorTickY *= step(abs(p.x), 0.16) * step(0.25, abs(p.y));

    // 3. Concentric Vector Blueprint Circles
    float circle1 = drawLine(abs(dist - 0.8), 0.012);
    float circle2 = drawLine(abs(dist - 1.6), 0.014);
    float circle3 = drawLine(abs(dist - 2.5), 0.012);
    float circle4 = drawLine(abs(dist - 3.4), 0.014);

    // Dashed pattern for circle 2 & 4
    float dashPattern = step(0.5, fract(angle * 12.0 / 6.28318));
    circle2 *= dashPattern;
    circle4 *= step(0.4, fract(angle * 24.0 / 6.28318));

    // 4. Diagonal 45-degree Alignment Lines
    vec2 pDiag = abs(p);
    float distDiag = abs(pDiag.x - pDiag.y) * 0.707106;
    float diagLines = drawLine(distDiag, 0.010);
    // Dashed diagonals
    diagLines *= step(0.45, fract(dist * 3.0 - uTime * 0.2));
    diagLines *= smoothstep(0.4, 0.7, dist);

    // 5. Quadrant Reticle Brackets (at r = 2.0)
    float reticle = 0.0;
    vec2 rPos = abs(p) - vec2(1.414, 1.414);
    if (abs(rPos.x) < 0.25 && abs(rPos.y) < 0.25) {
      float corner = drawLine(min(abs(rPos.x), abs(rPos.y)), 0.014);
      reticle = corner * step(abs(rPos.x), 0.20) * step(abs(rPos.y), 0.20);
    }

    // 6. Color Composition
    vec3 colAmberX = vec3(0.96, 0.62, 0.15); // #f59e0b
    vec3 colCyanY  = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colBlueGrid = vec3(0.35, 0.55, 0.90);
    vec3 colWhiteReticle = vec3(0.95, 0.98, 1.0);

    vec3 finalColor = vec3(0.0);
    finalColor += colAmberX * (xAxis + tickX * 0.8 + majorTickX);
    finalColor += colCyanY * (yAxis + tickY * 0.8 + majorTickY);
    finalColor += colBlueGrid * (circle1 * 0.75 + circle2 * 0.85 + circle3 * 0.65 + circle4 * 0.7);
    finalColor += colCyanY * (diagLines * 0.45);
    finalColor += colWhiteReticle * (reticle * 1.2);

    // Pulsing scan wave along axes
    float scanWave = exp(-pow(dist - mod(uTime * 1.5, 3.5), 2.0) * 8.0) * 0.4;
    finalColor += vec3(0.3, 0.8, 1.0) * scanWave * (xAxis + yAxis);

    // Alpha modulation
    float combinedAlpha = (xAxis + yAxis) * 0.95
                        + (tickX + tickY) * 0.7
                        + (majorTickX + majorTickY) * 0.9
                        + (circle1 + circle2 + circle3 + circle4) * 0.65
                        + diagLines * 0.4
                        + reticle * 0.95;

    // Edge falloff at reach limit and outer boundary
    float frontierFade = smoothstep(maxReach, maxReach - 0.4, dist);
    combinedAlpha *= frontierFade;
    combinedAlpha *= (0.7 + uStabilization * 0.3);
    combinedAlpha = clamp(combinedAlpha, 0.0, 1.0);

    if (combinedAlpha <= 0.005) {
      discard;
    }

    gl_FragColor = vec4(finalColor, combinedAlpha);
  }
`;
