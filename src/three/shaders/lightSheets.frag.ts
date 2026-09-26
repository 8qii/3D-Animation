export const lightSheetsFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFractureProgress;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    // UV centered at (0, 0)
    vec2 p = (vUv - 0.5) * 2.0;
    float dist = length(p);

    if (dist < 0.35 || dist > 1.0) {
      discard;
    }

    // Radial beam pattern (angle around center)
    float angle = atan(p.y, p.x);
    float beamNoise = sin(angle * 12.0 + uTime * 2.0) * 0.25 + sin(angle * 32.0 - uTime * 4.0) * 0.15;
    beamNoise = pow(abs(beamNoise) + 0.6, 2.0);

    // Radial falloff: emerges sharply at crystal boundary (~0.4), decays outward to 1.0
    float innerRamp = smoothstep(0.38, 0.52, dist);
    float outerFalloff = pow(1.0 - smoothstep(0.48, 1.0, dist), 2.2);

    float sheetAlpha = innerRamp * outerFalloff * beamNoise * uFractureProgress;

    // Glowing golden-white core transitioning to ionized cyan blade edges
    vec3 sheetColor = mix(vec3(1.0, 0.96, 0.88), vec3(0.35, 0.82, 1.0), smoothstep(0.4, 0.9, dist));

    gl_FragColor = vec4(sheetColor * (1.8 + uFractureProgress * 1.5), sheetAlpha * 0.45);
  }
`;
