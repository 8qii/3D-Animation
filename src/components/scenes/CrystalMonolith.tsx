'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrystalMaterial } from '@/three/materials/CrystalMaterial';
import { useExperienceStore } from '@/store/experienceStore';
import { TrappedEnergyField } from './TrappedEnergyField';

export function CrystalMonolith() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<CrystalMaterial>(null);

  // Sacred Icosahedron Geometry (20 triangular facets, golden ratio proportion)
  const geometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.45, 0);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const material = useMemo(() => new CrystalMaterial(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const materialLock = store.materialLockProgress;
    const tension = store.tensionProgress;

    if (materialRef.current) {
      materialRef.current.update(time);
      materialRef.current.setMaterialLock(materialLock);
      materialRef.current.setTension(tension);
    }

    if (groupRef.current) {
      // Visible once material lock begins
      groupRef.current.visible = materialLock > 0.01;

      // Slow majestic tumbling rotation preserving coordinate DNA
      groupRef.current.rotation.x = time * 0.12;
      groupRef.current.rotation.y = time * 0.16;
      groupRef.current.rotation.z = time * 0.08;

      // Subtle expansion scale lock: 0.94 -> 1.0 as physical matter solidifies
      // with microscopic high-frequency breathing vibration under mounting tension
      const microVibe = Math.sin(time * 30.0) * 0.0035 * tension;
      const targetScale = THREE.MathUtils.lerp(0.94, 1.0, materialLock) * (1.0 + microVibe);
      groupRef.current.scale.set(targetScale, targetScale, targetScale);
    }
  });

  return (
    <group ref={groupRef} name="crystal-monolith-system" position={[0, 0, 0]}>
      {/* 1. Trapped Internal Energy Particles */}
      <TrappedEnergyField />

      {/* 2. Sacred Obsidian Monolith Mesh */}
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
