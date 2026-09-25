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

interface PostProcessingProps {
  enableDoF?: boolean;
}

export function PostProcessing({ enableDoF = true }: PostProcessingProps) {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* Cinematic Bloom - glows bright crystal facets & particles */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.85}
        blendFunction={BlendFunction.SCREEN}
        mipmapBlur
      />

      {/* Depth of Field focusing around the central monolith */}
      {enableDoF && (
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.045}
          bokehScale={2.2}
        />
      )}

      {/* Subtle chromatic lens dispersion at edges */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0007, 0.0007)}
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
