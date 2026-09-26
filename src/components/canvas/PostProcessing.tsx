'use client';

import { useMemo } from 'react';
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
  const attentionLevel = useExperienceStore((state) => state.attentionLevel);
  const touchRipple = useExperienceStore((state) => state.touchRipple);
  const stillnessScore = useExperienceStore((state) => state.observerStillnessScore);

  const shouldRenderDoF = enableDoF && dofEnabled;

  // Modulate bloom dynamically with synchronized breath, kinetic scroll excitation, and observer attention
  const rippleBloom = touchRipple.active ? touchRipple.intensity * 0.6 : 0;
  const effectiveBloom = bloomIntensity * (1.0 + breathPhase * 0.15 + scrollEnergy * 0.85 + attentionLevel * 0.35 + rippleBloom);

  // Dynamic chromatic aberration responding to observer touch and tension
  const rippleOffset = touchRipple.active ? touchRipple.intensity * 0.0016 : 0;
  const chromaticOffset = useMemo(
    () => new THREE.Vector2(0.0006 + attentionLevel * 0.0006 + rippleOffset, 0.0006 + attentionLevel * 0.0006 + rippleOffset),
    [attentionLevel, rippleOffset]
  );

  // Grain clarifies into high-fidelity stillness when observer is still
  const grainOpacity = THREE.MathUtils.lerp(0.038, 0.020, stillnessScore);

  // Vignette tightens subtly during focused contemplation
  const vignetteDarkness = 0.86 + attentionLevel * 0.12;

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

      {/* 3. Micro Anamorphic Chromatic Aberration modulated by observer interactions */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaticOffset}
        radialModulation
        modulationOffset={0.32}
      />

      {/* 4. Subtle 35mm Celluloid Film Grain clarifying with observer stillness */}
      <Noise
        opacity={grainOpacity}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* 5. Vignette framing the cinematic scene */}
      <Vignette
        eskil={false}
        offset={0.16}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 6. ACES Filmic Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  );
}

