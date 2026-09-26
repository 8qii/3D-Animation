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
  const gpuTier = useExperienceStore((state) => state.gpuTier);

  // Phase 9.19: Adaptive GPU Quality feature gating
  const shouldRenderDoF = enableDoF && dofEnabled && (gpuTier === 'TIER_ULTRA' || gpuTier === 'TIER_BALANCED');
  const multisampling = gpuTier === 'TIER_ULTRA' ? 4 : gpuTier === 'TIER_BALANCED' ? 2 : 0;
  const enableMipmapBlur = gpuTier !== 'TIER_EFFICIENT';
  const enableNoise = gpuTier !== 'TIER_EFFICIENT';

  // Modulate bloom dynamically with synchronized breath, kinetic scroll excitation, and observer attention
  const rippleBloom = touchRipple.active ? touchRipple.intensity * 0.4 : 0;
  // Tight threshold: only genuine particle/glow events bloom — ambient base stays dark
  const effectiveBloom = bloomIntensity * 0.55 * (1.0 + breathPhase * 0.12 + scrollEnergy * 0.65 + attentionLevel * 0.25 + rippleBloom);

  // Dynamic chromatic aberration responding to observer touch and tension
  const rippleOffset = touchRipple.active ? touchRipple.intensity * 0.0016 : 0;
  const chromaticOffset = useMemo(
    () => new THREE.Vector2(0.0006 + attentionLevel * 0.0006 + rippleOffset, 0.0006 + attentionLevel * 0.0006 + rippleOffset),
    [attentionLevel, rippleOffset]
  );

  // Grain clarifies into high-fidelity stillness when observer is still
  const grainOpacity = THREE.MathUtils.lerp(0.028, 0.014, stillnessScore);

  // Vignette tightens subtly during focused contemplation
  const vignetteDarkness = 0.88 + attentionLevel * 0.10;

  return (
    <EffectComposer multisampling={multisampling} enableNormalPass={false}>
      {/* 1. Cinematic Bloom - tight threshold, only genuine light events */}
      <Bloom
        intensity={effectiveBloom}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.88}
        blendFunction={BlendFunction.SCREEN}
        mipmapBlur={enableMipmapBlur}
      />

      {/* 2. Optical Depth of Field — enabled on BALANCED and ULTRA */}
      {shouldRenderDoF && (
        <DepthOfField
          focusDistance={0.022}
          focalLength={0.045}
          bokehScale={2.8}
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
      {enableNoise && (
        <Noise
          opacity={grainOpacity}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}

      {/* 5. Vignette framing the cinematic scene */}
      <Vignette
        eskil={false}
        offset={0.12}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 6. ACES Filmic Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  );
}

