export const crystalFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uGlowColor;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying float vFresnel;

  void main() {
    // Subtle normal shimmer
    vec3 normal = normalize(vNormal);

    // Dynamic gradient across height and normal
    float gradientMix = (normal.y * 0.5 + 0.5) + sin(vPosition.y * 2.0 + uTime * 0.5) * 0.2;
    vec3 baseColor = mix(uColorA, uColorB, clamp(gradientMix, 0.0, 1.0));

    // Internal facet shimmer
    float facets = sin(vPosition.x * 8.0) * cos(vPosition.z * 8.0);
    baseColor += vec3(facets * 0.08);

    // Fresnel rim glow for cinematic atmosphere
    vec3 fresnelGlow = uGlowColor * vFresnel * uIntensity;

    // Specular highlight approximation
    vec3 lightDir = normalize(vec3(1.0, 2.0, 2.0));
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);
    vec3 specular = vec3(1.0) * spec * 0.6;

    vec3 finalColor = baseColor + fresnelGlow + specular;

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;
