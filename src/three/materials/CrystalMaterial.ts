import * as THREE from 'three';
import { crystalVertexShader } from '../shaders/crystal.vert';
import { crystalFragmentShader } from '../shaders/crystal.frag';

export interface CrystalMaterialUniforms {
  uTime: { value: number };
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
  }>) {
    const uniforms: CrystalMaterialUniforms = {
      uTime: { value: 0 },
      uDistortion: { value: parameters?.distortion ?? 0.08 },
      uColorA: { value: new THREE.Color(parameters?.colorA ?? '#0a0f1d') },
      uColorB: { value: new THREE.Color(parameters?.colorB ?? '#38bdf8') },
      uGlowColor: { value: new THREE.Color(parameters?.glowColor ?? '#f59e0b') },
      uAbsorptionColor: { value: new THREE.Color(parameters?.absorptionColor ?? '#040714') },
      uIntensity: { value: parameters?.intensity ?? 2.2 },
      uTransmission: { value: parameters?.transmission ?? 0.85 },
      uRoughness: { value: parameters?.roughness ?? 0.08 },
      uDispersion: { value: parameters?.dispersion ?? 0.18 },
      uRefractiveIndex: { value: parameters?.refractiveIndex ?? 1.52 },
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

  setTransmission(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uTransmission.value = val;
  }

  setDispersion(val: number) {
    (this.uniforms as unknown as CrystalMaterialUniforms).uDispersion.value = val;
  }
}
