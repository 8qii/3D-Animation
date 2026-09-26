'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { crystalMemoryVertexShader } from '@/three/shaders/crystalMemory.vert';
import { crystalMemoryFragmentShader } from '@/three/shaders/crystalMemory.frag';

const TOTAL_MEMORY_POINTS = 420;
const VOID_COUNT = 180;
const SINGULARITY_COUNT = 140;
const MATTER_COUNT = 100;

function createPrng(initialSeed: number) {
  let s = initialSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function CrystalMemoryField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, layers, sizes } = useMemo(() => {
    const rng = createPrng(8829);
    const pos = new Float32Array(TOTAL_MEMORY_POINTS * 3);
    const sd = new Float32Array(TOTAL_MEMORY_POINTS * 3);
    const ly = new Float32Array(TOTAL_MEMORY_POINTS);
    const sz = new Float32Array(TOTAL_MEMORY_POINTS);

    for (let i = 0; i < TOTAL_MEMORY_POINTS; i++) {
      const idx3 = i * 3;
      sd[idx3] = rng();
      sd[idx3 + 1] = rng();
      sd[idx3 + 2] = rng();

      pos[idx3] = 0;
      pos[idx3 + 1] = 0;
      pos[idx3 + 2] = 0;

      if (i < VOID_COUNT) {
        ly[i] = 0.0; // Void Layer
        sz[i] = 1.0 + rng() * 1.6;
      } else if (i < VOID_COUNT + SINGULARITY_COUNT) {
        ly[i] = 1.0; // Singularity Layer
        sz[i] = 1.4 + rng() * 1.8;
      } else {
        ly[i] = 2.0; // Matter Layer
        sz[i] = 1.8 + rng() * 2.2;
      }
    }

    return { positions: pos, seeds: sd, layers: ly, sizes: sz };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMemoryIntensity: { value: 0 },
      uStillness: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const memory = store.memoryProgress;
    const stillness = store.stillnessFactor;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uMemoryIntensity.value = memory;
      materialRef.current.uniforms.uStillness.value = stillness;
    }

    if (pointsRef.current) {
      pointsRef.current.visible = memory > 0.01;
    }
  });

  return (
    <points ref={pointsRef} renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aLayer" args={[layers, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={crystalMemoryVertexShader}
        fragmentShader={crystalMemoryFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
