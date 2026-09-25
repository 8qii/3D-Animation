export const particlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aRandom;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 transformed = position;

    // Organic orbital swirling motion
    float angle = uTime * aSpeed * 0.3 + aRandom * 6.28318;
    float radius = length(position.xz);

    transformed.x += cos(angle) * (0.3 + aRandom * 0.2);
    transformed.z += sin(angle) * (0.3 + aRandom * 0.2);
    transformed.y += sin(uTime * 0.5 + aRandom * 10.0) * 0.4;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    // Dynamic point sizing with perspective distance attenuation
    gl_PointSize = aScale * uPixelRatio * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Varying color palette: subtle cyan to deep violet and warm gold highlights
    vec3 colCyan = vec3(0.3, 0.8, 1.0);
    vec3 colViolet = vec3(0.7, 0.4, 1.0);
    vec3 colGold = vec3(1.0, 0.85, 0.5);

    if (aRandom < 0.45) {
      vColor = colCyan;
    } else if (aRandom < 0.8) {
      vColor = colViolet;
    } else {
      vColor = colGold;
    }

    // Distance alpha fade
    vAlpha = smoothstep(15.0, 1.0, -mvPosition.z) * (0.4 + aRandom * 0.6);
  }
`;
