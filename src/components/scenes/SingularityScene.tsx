'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SingularitySpark } from './SingularitySpark';
import { CoordinateGenesis } from './CoordinateGenesis';
import { useExperienceStore } from '@/store/experienceStore';

export function SingularityScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const store = useExperienceStore.getState();
    const transition = store.transitionProgress;
    const act2Progress = store.act2Progress;

    // Visibility and scale modulation based on transition / Act II presence
    const activeWeight = Math.max(transition, act2Progress);
    if (groupRef.current) {
      groupRef.current.visible = activeWeight > 0.01;
    }
  });

  return (
    <group ref={groupRef} name="act-02-the-singularity">
      {/* 1. Animated Cartesian Axes & Blueprint Geometry */}
      <CoordinateGenesis />

      {/* 2. Quantum Spark Singularity Core & Gravitational Lens */}
      <SingularitySpark />
    </group>
  );
}
