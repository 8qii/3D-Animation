import * as THREE from 'three';
import { crystalVertexShader } from '../shaders/crystal.vert';
import { crystalFragmentShader } from '../shaders/crystal.frag';

export interface CrystalMaterialUniforms {
  uTime: { value: number };
  uDistortion: { value: number };
  uColorA: { value: THREE.Color };
  uColorB: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uIntensity: { value: number };
}

export class CrystalMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: Partial<{
    colorA: THREE.ColorRepresentation;
    colorB: THREE.ColorRepresentation;
    glowColor: THREE.ColorRepresentation;
    intensity: number;
    distortion: number;
  }>) {
    const uniforms: CrystalMaterialUniforms = {
      uTime: { value: 0 },
      uDistortion: { value: parameters?.distortion ?? 0.12 },
      uColorA: { value: new THREE.Color(parameters?.colorA ?? '#0f172a') },
      uColorB: { value: new THREE.Color(parameters?.colorB ?? '#38bdf8') },
      uGlowColor: { value: new THREE.Color(parameters?.glowColor ?? '#818cf8') },
      uIntensity: { value: parameters?.intensity ?? 1.8 },
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
}
