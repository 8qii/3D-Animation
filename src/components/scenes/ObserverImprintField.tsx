'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { observerImprintVertexShader } from '@/three/shaders/observerImprint.vert';
import { observerImprintFragmentShader } from '@/three/shaders/observerImprint.frag';

const IMPRINT_POINT_COUNT = 180;

function createPrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function ObserverImprintField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate icosahedral interior nodal coordinates
  const { positions, seeds, sizes } = useMemo(() => {
    const rng = createPrng(4829);
    const pos = new Float32Array(IMPRINT_POINT_COUNT * 3);
    const sd = new Float32Array(IMPRINT_POINT_COUNT * 3);
    const sz = new Float32Array(IMPRINT_POINT_COUNT);

    const PHI = 1.6180339887;
    // 12 base vertices of icosahedron
    const vertices = [
      new THREE.Vector3(-1, PHI, 0).normalize(),
      new THREE.Vector3(1, PHI, 0).normalize(),
      new THREE.Vector3(-1, -PHI, 0).normalize(),
      new THREE.Vector3(1, -PHI, 0).normalize(),
      new THREE.Vector3(0, -1, PHI).normalize(),
      new THREE.Vector3(0, 1, PHI).normalize(),
      new THREE.Vector3(0, -1, -PHI).normalize(),
      new THREE.Vector3(0, 1, -PHI).normalize(),
      new THREE.Vector3(PHI, 0, -1).normalize(),
      new THREE.Vector3(PHI, 0, 1).normalize(),
      new THREE.Vector3(-PHI, 0, -1).normalize(),
      new THREE.Vector3(-PHI, 0, 1).normalize(),
    ];

    for (let i = 0; i < IMPRINT_POINT_COUNT; i++) {
      const vA = vertices[Math.floor(rng() * vertices.length)];
      const vB = vertices[Math.floor(rng() * vertices.length)];
      const t = rng();
      const radius = 0.25 + rng() * 0.95;

      const interpolated = new THREE.Vector3().lerpVectors(vA, vB, t).normalize().multiplyScalar(radius);

      pos[i * 3] = interpolated.x;
      pos[i * 3 + 1] = interpolated.y;
      pos[i * 3 + 2] = interpolated.z;

      sd[i * 3] = rng();
      sd[i * 3 + 1] = rng();
      sd[i * 3 + 2] = rng();

      sz[i] = 0.04 + rng() * 0.06;
    }

    return { positions: pos, seeds: sd, sizes: sz };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uImprintIntensity: { value: 0 },
      uStillness: { value: 0 },
      uObserverAttention: { value: 0 },
      uObserverPos: { value: new THREE.Vector3(0, 0, 0) },
      uArchetypeMode: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const archive = store.observerArchive;
    const materialLock = store.materialLockProgress;
    const stillness = store.stillnessFactor;
    const archetype = store.observerArchetype;

    // Imprint intensity scales with previous sessions, milestones, and observation time
    const sessionCount = archive?.sessionCount || 1;
    const duration = archive?.totalObservationDuration || 0;
    const milestoneCount = archive?.milestones.length || 0;
    const baseIntensity = Math.min(1.0, ((sessionCount - 1) * 0.3) + (milestoneCount * 0.15) + (duration / 120.0) * 0.3);

    // Active when material begins crystallizing and past interaction history exists (or during deep stillness)
    const effectiveIntensity = baseIntensity * materialLock;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uImprintIntensity.value = effectiveIntensity;
      materialRef.current.uniforms.uStillness.value = stillness;
      materialRef.current.uniforms.uObserverAttention.value = store.attentionLevel * store.observerProximity;
      materialRef.current.uniforms.uObserverPos.value.set(store.mouseWorld[0], store.mouseWorld[1], store.mouseWorld[2]);

      let archMode = 0;
      if (archetype === 'THE_WITNESS') archMode = 1;
      else if (archetype === 'THE_CATALYST') archMode = 2;
      else if (archetype === 'THE_ARCHITECT') archMode = 3;
      materialRef.current.uniforms.uArchetypeMode.value = archMode;
    }

    if (pointsRef.current) {
      pointsRef.current.visible = effectiveIntensity > 0.01;
    }
  });

  return (
    <points ref={pointsRef} renderOrder={9}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={observerImprintVertexShader}
        fragmentShader={observerImprintFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
