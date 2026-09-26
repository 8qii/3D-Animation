'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrystalMaterial } from '@/three/materials/CrystalMaterial';
import { useExperienceStore } from '@/store/experienceStore';
import { TrappedEnergyField } from './TrappedEnergyField';
import { CrystalMemoryField } from './CrystalMemoryField';
import { PhotonLeakage } from './PhotonLeakage';
import { CrystalShatter } from './CrystalShatter';

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
    const fracture = store.fractureProgress;

    // Motion scale decelerates from 1.0 down to 0.0 at complete stillness,
    // and remains deeply arrested during fracture initiation
    const motionScale = Math.max(0.0, 1.0 - stillness) * (1.0 - fracture * 0.7);

    if (materialRef.current) {
      materialRef.current.update(time);
      materialRef.current.setMaterialLock(materialLock);
      materialRef.current.setTension(tension);
      materialRef.current.setStressPreview(tension);
      materialRef.current.setFracture(fracture);
    }

    if (meshRef.current) {
      // Solid monolithic crystal mesh is visible during material lock and hairline fracture,
      // then seamlessly hands over to CrystalShatter once facet detachment commences
      meshRef.current.visible = materialLock > 0.01 && fracture <= 0.02;
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

      // Microscopic facet vibration reduces down during pre-stillness, freezes,
      // and then experiences high-frequency fracture shear jitter when fracture initiates
      const vibeFactor = motionScale * 0.9 + 0.1 * (1.0 - stillness);
      const fractureJitter = Math.sin(time * 65.0) * 0.005 * fracture;
      const microVibe = (Math.sin(time * 30.0) * 0.0035 * tension * vibeFactor) + fractureJitter;
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

      {/* 3. Escaping Photons & Golden-Ratio Light Sheets */}
      <PhotonLeakage />

      {/* 4. Act IV Golden Ratio Facet Separation System */}
      <CrystalShatter />

      {/* 5. Sacred Obsidian Monolith Mesh (Hands over to CrystalShatter on separation) */}
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
