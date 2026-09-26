'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function CameraRig() {
  const pointer = useExperienceStore((state) => state.pointer);

  // Pre-allocated vectors to eliminate garbage collection
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0.05 Hz subtle human breathing motion (20s period)
    const breathingY = Math.sin(time * 0.314159) * 0.045;

    // Extremely slow ancient longitudinal drift
    const driftZ = Math.cos(time * 0.08) * 0.06;
    const driftX = Math.sin(time * 0.05) * 0.04;

    // Subtle pointer parallax (constrained nodal pivot)
    const parallaxX = pointer.x * 0.32;
    const parallaxY = pointer.y * 0.24;

    // Target camera position centered around [0, 0, 7]
    targetCamPos.current.set(
      0.0 + driftX + parallaxX,
      0.0 + breathingY + parallaxY,
      7.0 + driftZ
    );

    // Subtle lookAt tracking
    targetLookAt.current.set(
      parallaxX * 0.15,
      parallaxY * 0.15,
      0.0
    );

    // High-inertia exponential damping for silent, meditative fluidity
    const activeCamera = state.camera;
    activeCamera.position.x = damp(activeCamera.position.x, targetCamPos.current.x, 2.5, delta);
    activeCamera.position.y = damp(activeCamera.position.y, targetCamPos.current.y, 2.5, delta);
    activeCamera.position.z = damp(activeCamera.position.z, targetCamPos.current.z, 2.5, delta);

    currentLookAt.current.x = damp(currentLookAt.current.x, targetLookAt.current.x, 3.0, delta);
    currentLookAt.current.y = damp(currentLookAt.current.y, targetLookAt.current.y, 3.0, delta);
    currentLookAt.current.z = damp(currentLookAt.current.z, targetLookAt.current.z, 3.0, delta);

    activeCamera.lookAt(currentLookAt.current);
  });

  return null;
}
