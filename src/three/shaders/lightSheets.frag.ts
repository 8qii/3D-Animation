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

    float innerCutoff = mix(0.35, 0.12, uFractureProgress);
    if (dist < innerCutoff || dist > 1.0) {
      discard;
    }

    // Radial beam pattern (angle around center)
    float angle = atan(p.y, p.x);
    float beamNoise = sin(angle * 14.0 + uTime * 2.2) * 0.25 + sin(angle * 36.0 - uTime * 4.2) * 0.15;
    beamNoise = pow(abs(beamNoise) + 0.65, 2.2);

    // Radial falloff: emerges sharply at inner core, expands outward into space
    float innerRamp = smoothstep(innerCutoff, innerCutoff + 0.12, dist);
    float outerFalloff = pow(1.0 - smoothstep(0.40, 1.0, dist), mix(2.2, 1.5, uFractureProgress));

    float sheetAlpha = innerRamp * outerFalloff * beamNoise * uFractureProgress;

    // Glowing golden-white core transitioning to ionized cyan blade edges
    vec3 sheetColor = mix(vec3(1.0, 0.96, 0.88), vec3(0.32, 0.82, 1.0), smoothstep(innerCutoff, 0.85, dist));

    gl_FragColor = vec4(sheetColor * (2.2 + uFractureProgress * 2.8), sheetAlpha * 0.55);
  }
`;
