'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { exposedCoreVertexShader } from '@/three/shaders/exposedCore.vert';
import { exposedCoreFragmentShader } from '@/three/shaders/exposedCore.frag';

export function ExposedQuantumCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFractureProgress: { value: 0 },
      uFacetMemoryProgress: { value: 0 },
      uCollapseProgress: { value: 0 },
      uThresholdProgress: { value: 0 },
      uHiddenEnding: { value: 0 },
    }),
    []
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(0.58, 32, 32), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const fracture = store.fractureProgress;
    const facetMemory = store.facetMemoryProgress;
    const collapse = store.collapseProgress;
    const threshold = store.singularityThresholdProgress;
    const ending = store.hiddenEnding;

    let endingVal = 0;
    if (ending === 'TRANSCENDENCE') endingVal = 1;
    else if (ending === 'SUPERNOVA') endingVal = 2;
    else if (ending === 'ASCENSION') endingVal = 3;

    const isVisible = fracture > 0.02 || facetMemory > 0.001 || collapse > 0.001 || threshold > 0.001;
    if (meshRef.current) {
      meshRef.current.visible = isVisible;

      // Pulse rate and internal compression:
      // Radius: 0.85 -> 0.65
      const pulseSpeed = 1.8 + collapse * 12.0 + threshold * 14.0;
      const breath = Math.sin(time * pulseSpeed) * (0.04 + collapse * 0.06 + threshold * 0.05);
      const compressionFactor = (1.0 - collapse * 0.15 - threshold * 0.20);
      const targetScale = ((0.75 + fracture * 0.25 + facetMemory * 0.15) * compressionFactor) + breath;
      meshRef.current.scale.set(targetScale, targetScale, targetScale);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uFractureProgress.value = fracture;
      materialRef.current.uniforms.uFacetMemoryProgress.value = facetMemory;
      materialRef.current.uniforms.uCollapseProgress.value = collapse;
      materialRef.current.uniforms.uThresholdProgress.value = threshold;
      materialRef.current.uniforms.uHiddenEnding.value = endingVal;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} renderOrder={5}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={exposedCoreVertexShader}
        fragmentShader={exposedCoreFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
