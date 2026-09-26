'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrystalMaterial } from '@/three/materials/CrystalMaterial';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function CrystalMonolith() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<CrystalMaterial>(null);

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

    if (materialRef.current) {
      materialRef.current.update(time);
      materialRef.current.setMaterialLock(materialLock);
    }

    if (meshRef.current) {
      // Visible once material lock begins
      meshRef.current.visible = materialLock > 0.01;

      // Slow majestic tumbling rotation preserving coordinate DNA
      meshRef.current.rotation.x = time * 0.12;
      meshRef.current.rotation.y = time * 0.16;
      meshRef.current.rotation.z = time * 0.08;

      // Subtle expansion scale lock: 0.94 -> 1.0 as physical matter solidifies
      const targetScale = THREE.MathUtils.lerp(0.94, 1.0, materialLock);
      meshRef.current.scale.set(targetScale, targetScale, targetScale);
    }
  });

  return (
    <mesh
      ref={meshRef}
      name="sacred-crystal-monolith"
      geometry={geometry}
      position={[0, 0, 0]}
      renderOrder={6}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
