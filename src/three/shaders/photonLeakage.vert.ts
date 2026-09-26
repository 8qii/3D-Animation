export const photonLeakageVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFractureProgress;

  attribute vec3 aVelocity;
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Escaping photon life cycle (0.0 to 1.0 cycle along fault plane trajectory)
    float cycle = fract(uTime * aSpeed + aSeed);
    
    // Outward trajectory starting from near the fissure seam (~1.2 to 1.45) outward to ~3.6
    float dist = mix(1.25, 3.6, pow(cycle, 1.3));
    vec3 currentPos = position + aVelocity * dist * (0.3 + 0.7 * uFractureProgress);

    // Micro jitter from high quantum energy state
    currentPos += sin(currentPos * 25.0 + uTime * 12.0) * 0.015 * uFractureProgress;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuates with distance and scales with fracture progress
    float sizeScale = aSize * (150.0 / -mvPosition.z);
    gl_PointSize = sizeScale * uFractureProgress * (1.0 - cycle * 0.5);

    // Color gradient: starts incandescent amber-white at crystal boundary, shifts to electric cyan
    vec3 coreColor = vec3(1.0, 0.97, 0.88);
    vec3 trailingColor = vec3(0.28, 0.82, 1.0);
    vColor = mix(coreColor, trailingColor, smoothstep(0.1, 0.85, cycle));

    // Fade in at birth from fissure, sustained glow, fade out at boundary
    float fadeIn = smoothstep(0.0, 0.15, cycle);
    float fadeOut = smoothstep(1.0, 0.75, cycle);
    vAlpha = fadeIn * fadeOut * uFractureProgress;
  }
`;
