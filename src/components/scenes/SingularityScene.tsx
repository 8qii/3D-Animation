'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SingularitySpark } from './SingularitySpark';
import { CoordinateGenesis } from './CoordinateGenesis';
import { MatterGenesis } from './MatterGenesis';
import { CrystalMonolith } from './CrystalMonolith';
import { useExperienceStore } from '@/store/experienceStore';

export function SingularityScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const store = useExperienceStore.getState();
    const transition = store.transitionProgress;
    const act2Progress = store.act2Progress;
    const act3Progress = store.act3Progress;

    // Visibility and scale modulation based on transition / Act II & III presence
    const activeWeight = Math.max(transition, act2Progress, act3Progress);
    if (groupRef.current) {
      groupRef.current.visible = activeWeight > 0.01;
    }
  });

  return (
    <group ref={groupRef} name="act-02-act-03-crystalline-continuum">
      {/* 1. Animated Cartesian Axes & Blueprint Geometry */}
      <CoordinateGenesis />

      {/* 2. Quantum Spark Singularity Core & Gravitational Lens */}
      <SingularitySpark />

      {/* 3. Matter Genesis Framework: Vertices, Wireframe, Facet Surfaces */}
      <MatterGenesis />

      {/* 4. Act III: The Physical Obsidian Crystal Monolith */}
      <CrystalMonolith />
    </group>
  );
}
