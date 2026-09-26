'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';

export function Lights() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const internalCoreLightRef = useRef<THREE.PointLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const materialLock = store.materialLockProgress;

    // Architectural Key Light (Warm Architectural Studio Illumination)
    if (keyLightRef.current) {
      keyLightRef.current.intensity = materialLock * 2.2;
    }

    // Architectural Rim Light (Sharp Grazing Specular Backlight)
    if (rimLightRef.current) {
      rimLightRef.current.intensity = materialLock * 3.2;
    }

    // Internal Quantum Self-Emission (Pulsating heart trapped within obsidian)
    if (internalCoreLightRef.current) {
      const pulse = Math.sin(time * 3.0) * 0.35 + 0.95;
      internalCoreLightRef.current.intensity = materialLock * pulse * 2.5;
    }

    // Subtle Ambient Fill
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = materialLock * 0.35;
    }
  });

  return (
    <group name="architectural-lighting-rig">
      {/* Subtle Ambient Fill */}
      <ambientLight ref={ambientLightRef} color="#0f172a" intensity={0} />

      {/* Directional Key Light */}
      <directionalLight
        ref={keyLightRef}
        position={[4.0, 5.0, 3.5]}
        color="#fff5e6"
        intensity={0}
      />

      {/* Directional Grazing Rim Backlight */}
      <directionalLight
        ref={rimLightRef}
        position={[-4.0, 2.5, -3.5]}
        color="#38bdf8"
        intensity={0}
      />

      {/* Internal Self-Emission Core Point Light */}
      <pointLight
        ref={internalCoreLightRef}
        position={[0, 0, 0]}
        color="#f59e0b"
        distance={6.0}
        decay={2.0}
        intensity={0}
      />
    </group>
  );
}
