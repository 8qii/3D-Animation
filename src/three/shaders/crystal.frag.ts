export const crystalFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uGlowColor;
  uniform vec3 uAbsorptionColor;
  uniform float uIntensity;
  uniform float uTransmission;
  uniform float uRoughness;
  uniform float uDispersion;
  uniform float uRefractiveIndex;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying float vFresnel;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Dynamic gradient across height and normal
    float gradientMix = (normal.y * 0.5 + 0.5) + sin(vPosition.y * 2.0 + uTime * 0.5) * 0.2;
    vec3 baseColor = mix(uColorA, uColorB, clamp(gradientMix, 0.0, 1.0));

    // Internal facet shimmer
    float facets = sin(vPosition.x * 8.0) * cos(vPosition.z * 8.0);
    baseColor += vec3(facets * 0.08);

    // Chromatic Dispersion (Wavelength separation R, G, B)
    float etaR = 1.0 / uRefractiveIndex;
    float etaG = 1.0 / (uRefractiveIndex + uDispersion * 0.03);
    float etaB = 1.0 / (uRefractiveIndex + uDispersion * 0.06);

    vec3 refR = refract(-viewDir, normal, etaR);
    vec3 refG = refract(-viewDir, normal, etaG);
    vec3 refB = refract(-viewDir, normal, etaB);

    vec3 dispersionCol = vec3(
      dot(refR, vec3(1.0, 0.0, 0.0)) * 0.5 + 0.5,
      dot(refG, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5,
      dot(refB, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5
    );
    baseColor = mix(baseColor, dispersionCol, uDispersion * (1.0 - uRoughness));

    // Beer-Lambert internal volumetric absorption
    float opticalPathLength = length(vPosition) * 1.5;
    vec3 absorption = exp(-uAbsorptionColor * opticalPathLength);
    baseColor *= absorption;

    // Fresnel rim glow
    vec3 fresnelGlow = uGlowColor * vFresnel * uIntensity;

    // Specular highlight approximation
    vec3 lightDir = normalize(vec3(1.0, 2.0, 2.0));
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVector), 0.0), 32.0 / (uRoughness + 0.1));
    vec3 specular = vec3(1.0) * spec * 0.7;

    vec3 finalColor = baseColor + fresnelGlow + specular;
    float alpha = mix(0.92, 1.0, vFresnel);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
