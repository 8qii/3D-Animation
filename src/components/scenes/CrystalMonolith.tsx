'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrystalMaterial } from '@/three/materials/CrystalMaterial';
import { useExperienceStore } from '@/store/experienceStore';
import { TrappedEnergyField } from './TrappedEnergyField';
import { CrystalMemoryField } from './CrystalMemoryField';

export function CrystalMonolith() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<CrystalMaterial>(null);
  const rotationAccum = useRef({ x: 0, y: 0, z: 0 });

  // Sacred Icosahedron Geometry (20 triangular facets, golden ratio proportion)
  const geometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.45, 0);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const material = useMemo(() => new CrystalMaterial(), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const materialLock = store.materialLockProgress;
    const tension = store.tensionProgress;
    const stillness = store.stillnessFactor;

    // Motion scale decelerates from 1.0 down to 0.0 at complete stillness
    const motionScale = Math.max(0.0, 1.0 - stillness);

    if (materialRef.current) {
      materialRef.current.update(time);
      materialRef.current.setMaterialLock(materialLock);
      materialRef.current.setTension(tension);
      materialRef.current.setStressPreview(tension);
    }

    if (groupRef.current) {
      // Visible once material lock begins
      groupRef.current.visible = materialLock > 0.01;

      // Accumulated tumbling rotation that decelerates into perfect stillness
      rotationAccum.current.x += delta * 0.12 * motionScale;
      rotationAccum.current.y += delta * 0.16 * motionScale;
      rotationAccum.current.z += delta * 0.08 * motionScale;

      groupRef.current.rotation.x = rotationAccum.current.x;
      groupRef.current.rotation.y = rotationAccum.current.y;
      groupRef.current.rotation.z = rotationAccum.current.z;

      // Microscopic facet vibration reduces down to 10% during pre-stillness
      // and freezes completely during the final stillness window
      const vibeFactor = motionScale * 0.9 + 0.1 * (1.0 - stillness);
      const microVibe = Math.sin(time * 30.0) * 0.0035 * tension * vibeFactor;
      const targetScale = THREE.MathUtils.lerp(0.94, 1.0, materialLock) * (1.0 + microVibe);
      groupRef.current.scale.set(targetScale, targetScale, targetScale);
    }
  });

  return (
    <group ref={groupRef} name="crystal-monolith-system" position={[0, 0, 0]}>
      {/* 1. Trapped Internal Energy Particles */}
      <TrappedEnergyField />

      {/* 2. Internal Genesis Memory System (Void, Singularity, Matter layers) */}
      <CrystalMemoryField />

      {/* 3. Sacred Obsidian Monolith Mesh */}
      <mesh
        ref={meshRef}
        name="sacred-crystal-monolith"
        geometry={geometry}
        renderOrder={6}
      >
        <primitive object={material} ref={materialRef} attach="material" />
      </mesh>
    </group>
  );
}
