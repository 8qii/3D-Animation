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
    }),
    []
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(0.58, 32, 32), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const fracture = store.fractureProgress;
    const facetMemory = store.facetMemoryProgress;

    const isVisible = fracture > 0.02 || facetMemory > 0.001;
    if (meshRef.current) {
      meshRef.current.visible = isVisible;

      // Slow majestic core pulsation
      const breath = Math.sin(time * 1.8) * 0.04;
      const targetScale = (0.75 + fracture * 0.25 + facetMemory * 0.15) + breath;
      meshRef.current.scale.set(targetScale, targetScale, targetScale);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uFractureProgress.value = fracture;
      materialRef.current.uniforms.uFacetMemoryProgress.value = facetMemory;
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
