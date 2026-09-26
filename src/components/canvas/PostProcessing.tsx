'use client';

import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';

interface PostProcessingProps {
  enableDoF?: boolean;
}

export function PostProcessing({ enableDoF = true }: PostProcessingProps) {
  const bloomIntensity = useExperienceStore((state) => state.bloomIntensity);
  const dofEnabled = useExperienceStore((state) => state.dofEnabled);

  const shouldRenderDoF = enableDoF && dofEnabled;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* Cinematic Bloom - glows bright central fluctuation & particles */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.85}
        blendFunction={BlendFunction.SCREEN}
        mipmapBlur
      />

      {/* Depth of Field focusing around the central vacuum */}
      {shouldRenderDoF && (
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.045}
          bokehScale={2.0}
        />
      )}

      {/* Subtle chromatic lens dispersion at edges */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation
        modulationOffset={0.3}
      />

      {/* Vignette framing the cinematic scene */}
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={0.85}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ACES Filmic Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  );
}
