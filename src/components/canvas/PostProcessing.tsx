'use client';

import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  ToneMapping,
  Noise,
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
  const scrollEnergy = useExperienceStore((state) => state.scrollEnergy);
  const breathPhase = useExperienceStore((state) => state.breathPhase);

  const shouldRenderDoF = enableDoF && dofEnabled;

  // Modulate bloom dynamically with synchronized breath and kinetic scroll excitation
  const effectiveBloom = bloomIntensity * (1.0 + breathPhase * 0.15 + scrollEnergy * 0.85);

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* 1. Cinematic Bloom - glows bright central fluctuation & particle layers */}
      <Bloom
        intensity={effectiveBloom}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.85}
        blendFunction={BlendFunction.SCREEN}
        mipmapBlur
      />

      {/* 2. Optical Depth of Field focusing around the central vacuum */}
      {shouldRenderDoF && (
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.045}
          bokehScale={2.2}
        />
      )}

      {/* 3. Micro Anamorphic Chromatic Aberration at frame edges */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation
        modulationOffset={0.32}
      />

      {/* 4. Subtle 35mm Celluloid Film Grain to eliminate color banding */}
      <Noise
        opacity={0.035}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* 5. Vignette framing the cinematic scene */}
      <Vignette
        eskil={false}
        offset={0.16}
        darkness={0.86}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 6. ACES Filmic Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  );
}
