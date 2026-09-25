'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Lights() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle breathing light motion for cinematic dynamism
    if (fillLightRef.current) {
      fillLightRef.current.position.x = -4 + Math.sin(time * 0.4) * 0.5;
      fillLightRef.current.position.y = -2 + Math.cos(time * 0.3) * 0.3;
    }

    if (rimLightRef.current) {
      rimLightRef.current.position.y = 4 + Math.sin(time * 0.5) * 0.4;
    }
  });

  return (
    <group name="cinematic-lighting">
      {/* Low-key ambient illumination */}
      <ambientLight intensity={0.25} color="#0b132b" />

      {/* Main Key Light: Cool Cyan/White high angle */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 8, 4]}
        intensity={2.2}
        color="#e0f2fe"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Warm fill light from underneath */}
      <pointLight
        ref={fillLightRef}
        position={[-4, -2, -2]}
        intensity={1.8}
        distance={15}
        color="#7c3aed"
      />

      {/* High-intensity rim backlight for edge brilliance */}
      <pointLight
        ref={rimLightRef}
        position={[0, 4, -4]}
        intensity={3.5}
        distance={20}
        color="#38bdf8"
      />
    </group>
  );
}
