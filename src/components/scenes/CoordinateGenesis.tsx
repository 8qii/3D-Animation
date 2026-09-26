'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { coordinateGenesisVertexShader } from '@/three/shaders/coordinateGenesis.vert';
import { coordinateGenesisFragmentShader } from '@/three/shaders/coordinateGenesis.frag';
import { useExperienceStore } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

export function CoordinateGenesis() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGenesisProgress: { value: 0 },
      uStabilization: { value: 0 },
      uExcitation: { value: 0 },
      uRevealFactor: { value: 0.05 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const act2Progress = store.act2Progress;
    const isPreview = store.isPreviewMode;
    const previewTime = store.previewTime;

    // Determine genesis progress:
    // In preview mode: 0-10s = 0, 10s-20s = 0 -> 1, >20s = 1.0
    // In scroll mode: act2Progress < 0.25 = 0, 0.25..0.55 = 0 -> 1, > 0.55 = 1.0
    let genesis = 0.0;
    let stabilization = 0.0;

    if (isPreview) {
      if (previewTime >= 10.0) {
        genesis = clamp((previewTime - 10.0) / 10.0, 0.0, 1.0);
      }
      if (previewTime >= 20.0) {
        stabilization = clamp((previewTime - 20.0) / 20.0, 0.0, 1.0);
      }
    } else {
      if (act2Progress >= 0.20) {
        genesis = clamp((act2Progress - 0.20) / 0.35, 0.0, 1.0);
      }
      if (act2Progress >= 0.55) {
        stabilization = clamp((act2Progress - 0.55) / 0.45, 0.0, 1.0);
      }
    }

    // Observer-driven reveal: 95% invisible at rest, reveals on proximity > 0.5, full on stillness > 0.8
    const proximity = store.observerProximity;
    const stillness = store.observerStillnessScore;
    const proximityReveal = Math.max(0, Math.min(1, (proximity - 0.2) / 0.4));
    const stillnessReveal = Math.max(0, Math.min(1, (stillness - 0.7) / 0.2));
    const revealFactor = 0.05 + proximityReveal * 0.40 + stillnessReveal * 0.55;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uGenesisProgress.value = genesis;
      materialRef.current.uniforms.uStabilization.value = stabilization;
      materialRef.current.uniforms.uExcitation.value = store.scrollEnergy;
      materialRef.current.uniforms.uRevealFactor.value = revealFactor;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.02]} renderOrder={1}>
      <planeGeometry args={[8.0, 8.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={coordinateGenesisVertexShader}
        fragmentShader={coordinateGenesisFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
