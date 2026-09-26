import * as THREE from 'three';
import { crystalVertexShader } from '../shaders/crystal.vert';
import { crystalFragmentShader } from '../shaders/crystal.frag';

export interface CrystalMaterialUniforms {
  uTime: { value: number };
  uMaterialLock: { value: number };
  uTension: { value: number };
  uStressPreview: { value: number };
  uDistortion: { value: number };
  uColorA: { value: THREE.Color };
  uColorB: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uAbsorptionColor: { value: THREE.Color };
  uIntensity: { value: number };
  uTransmission: { value: number };
  uRoughness: { value: number };
  uDispersion: { value: number };
  uRefractiveIndex: { value: number };
  uKeyLightDir: { value: THREE.Vector3 };
  uRimLightDir: { value: THREE.Vector3 };
}

export class CrystalMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: Partial<{
    colorA: THREE.ColorRepresentation;
    colorB: THREE.ColorRepresentation;
    glowColor: THREE.ColorRepresentation;
    absorptionColor: THREE.ColorRepresentation;
    intensity: number;
    distortion: number;
    transmission: number;
    roughness: number;
    dispersion: number;
    refractiveIndex: number;
    materialLock: number;
    tension: number;
    stressPreview: number;
  }>) {
    const uniforms: CrystalMaterialUniforms = {
      uTime: { value: 0 },
      uMaterialLock: { value: parameters?.materialLock ?? 0.0 },
      uTension: { value: parameters?.tension ?? 0.0 },
      uStressPreview: { value: parameters?.stressPreview ?? 0.0 },
      uDistortion: { value: parameters?.distortion ?? 0.04 },
      uColorA: { value: new THREE.Color(parameters?.colorA ?? '#030712') },
      uColorB: { value: new THREE.Color(parameters?.colorB ?? '#1e293b') },
      uGlowColor: { value: new THREE.Color(parameters?.glowColor ?? '#f59e0b') },
      uAbsorptionColor: { value: new THREE.Color(parameters?.absorptionColor ?? '#02040a') },
      uIntensity: { value: parameters?.intensity ?? 2.4 },
      uTransmission: { value: parameters?.transmission ?? 0.85 },
      uRoughness: { value: parameters?.roughness ?? 0.08 },
      uDispersion: { value: parameters?.dispersion ?? 0.16 },
      uRefractiveIndex: { value: parameters?.refractiveIndex ?? 1.52 },
      uKeyLightDir: { value: new THREE.Vector3(4.0, 5.0, 3.5).normalize() },
      uRimLightDir: { value: new THREE.Vector3(-4.0, 2.5, -3.5).normalize() },
    };

    super({
      vertexShader: crystalVertexShader,
      fragmentShader: crystalFragmentShader,
      uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }

  update(time: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uTime.value = time;
  }

  setMaterialLock(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uMaterialLock.value = val;
  }

  setTension(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uTension.value = val;
  }

  setStressPreview(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uStressPreview.value = val;
  }

  setTransmission(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uTransmission.value = val;
  }

  setDispersion(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uDispersion.value = val;
  }
}
