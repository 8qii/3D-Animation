'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function ObserverController() {
  const { raycaster, camera, pointer } = useThree();

  const setMouseWorld = useExperienceStore((state) => state.setMouseWorld);
  const setAttentionLevel = useExperienceStore((state) => state.setAttentionLevel);
  const setBreathPhase = useExperienceStore((state) => state.setBreathPhase);

  // Pre-allocated plane at z = 0 and intersection vector
  const focalPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const worldPoint = useRef(new THREE.Vector3(0, 0, 0));
  const lastWorldPoint = useRef(new THREE.Vector3(0, 0, 0));

  // Attention dynamics
  const attentionRef = useRef(0.2);
  const stillnessTimer = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Synchronized Universal Breathing Phase (0.05 Hz = 20-second fundamental cycle)
    const breathOscillation = Math.sin(time * 0.314159) * 0.5 + 0.5; // [0, 1]
    setBreathPhase(breathOscillation);

    // 2. 3D World Unprojection on focal plane z = 0
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(focalPlane.current, worldPoint.current);

    if (hit) {
      // Smooth world coordinate transition
      setMouseWorld(worldPoint.current.x, worldPoint.current.y, worldPoint.current.z);

      // 3. Attention Estimation: measure pointer speed in 3D world space
      const distanceMoved = worldPoint.current.distanceTo(lastWorldPoint.current);
      lastWorldPoint.current.copy(worldPoint.current);

      const pointerSpeed = distanceMoved / Math.max(0.001, delta);

      // When the observer is still or moving gently near the focal core, attention rises
      const distFromCenter = Math.sqrt(
        worldPoint.current.x * worldPoint.current.x + worldPoint.current.y * worldPoint.current.y
      );

      const isCentrallyObserved = distFromCenter < 3.2;
      const isStill = pointerSpeed < 1.8;

      if (isStill && isCentrallyObserved) {
        stillnessTimer.current += delta;
        // Intimacy grows with stillness
        const targetAttention = Math.min(1.0, 0.4 + stillnessTimer.current * 0.25);
        attentionRef.current = damp(attentionRef.current, targetAttention, 2.0, delta);
      } else {
        stillnessTimer.current = Math.max(0, stillnessTimer.current - delta * 2.0);
        const targetAttention = isCentrallyObserved ? 0.35 : 0.1;
        attentionRef.current = damp(attentionRef.current, targetAttention, 3.5, delta);
      }
    } else {
      // Observer gaze left canvas
      attentionRef.current = damp(attentionRef.current, 0.0, 1.5, delta);
      stillnessTimer.current = 0;
    }

    setAttentionLevel(attentionRef.current);
  });

  return null;
}
