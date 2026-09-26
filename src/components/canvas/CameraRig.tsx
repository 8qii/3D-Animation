'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function CameraRig() {
  const pointer = useExperienceStore((state) => state.pointer);
  const isPreviewMode = useExperienceStore((state) => state.isPreviewMode);
  const previewTime = useExperienceStore((state) => state.previewTime);
  const setPreviewTime = useExperienceStore((state) => state.setPreviewTime);
  const setFps = useExperienceStore((state) => state.setFps);

  // Pre-allocated vectors to eliminate garbage collection
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Frame timing accumulator for FPS measurement
  const frameCounter = useRef(0);
  const timeAccumulator = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const scrollEnergy = store.scrollEnergy;
    const transition = store.transitionProgress;

    // 1. FPS Calculation (smoothed over 0.25 seconds)
    frameCounter.current += 1;
    timeAccumulator.current += delta;
    if (timeAccumulator.current >= 0.25) {
      const currentFps = Math.round(frameCounter.current / timeAccumulator.current);
      setFps(currentFps);
      frameCounter.current = 0;
      timeAccumulator.current = 0;
    }

    const activeCamera = state.camera as THREE.PerspectiveCamera;

    // 2. Optical Realism & Transition Handoff FOV Compression:
    // Base FOV starts at 45.0° and tightens to 42.0° as camera tracks into Singularity
    const baseFov = 45.0 - transition * 3.0;
    const lensBreathing = Math.sin(time * 0.314159) * 0.25 - scrollEnergy * 0.65;
    const targetFov = baseFov + lensBreathing;

    if (Math.abs(activeCamera.fov - targetFov) > 0.01) {
      activeCamera.fov = damp(activeCamera.fov, targetFov, 2.8, delta);
      activeCamera.updateProjectionMatrix();
    }

    // 3. Automatic 30-Second Cinematic Sequence vs. Transition & Observer Handoff
    if (isPreviewMode) {
      const nextTime = (previewTime + delta) % 30.0;
      setPreviewTime(nextTime);

      const t = nextTime;

      if (t < 7.0) {
        // Phase 1 (0s - 7s): The Approaching Gaze
        const progress = t / 7.0;
        const ease = THREE.MathUtils.smoothstep(progress, 0, 1);
        targetCamPos.current.set(
          THREE.MathUtils.lerp(0.0, 0.3, ease),
          THREE.MathUtils.lerp(0.3, -0.15, ease),
          THREE.MathUtils.lerp(7.2, 4.6, ease)
        );
        targetLookAt.current.set(0, 0, 0);
      } else if (t < 16.0) {
        // Phase 2 (7s - 16s): Orbital Vitrine Arc
        const progress = (t - 7.0) / 9.0;
        const angle = progress * Math.PI;
        targetCamPos.current.set(
          Math.sin(angle) * 2.8,
          -0.15 + Math.sin(progress * Math.PI) * 0.9,
          Math.cos(angle) * 1.5 + 3.2
        );
        targetLookAt.current.set(
          Math.sin(angle) * 0.2,
          0.1,
          0
        );
      } else if (t < 23.0) {
        // Phase 3 (16s - 23s): Ascending Crane & Downward Tilt
        const progress = (t - 16.0) / 7.0;
        const ease = THREE.MathUtils.smoothstep(progress, 0, 1);
        targetCamPos.current.set(
          THREE.MathUtils.lerp(-1.2, 0.4, ease),
          THREE.MathUtils.lerp(0.75, 3.2, ease),
          THREE.MathUtils.lerp(4.7, 3.4, ease)
        );
        targetLookAt.current.set(
          THREE.MathUtils.lerp(0.2, 0.0, ease),
          THREE.MathUtils.lerp(0.1, 0.0, ease),
          0
        );
      } else {
        // Phase 4 (23s - 30s): Transcendent Longitudinal Pull-Back
        const progress = (t - 23.0) / 7.0;
        const ease = THREE.MathUtils.smoothstep(progress, 0, 1);
        targetCamPos.current.set(
          THREE.MathUtils.lerp(0.4, 0.0, ease),
          THREE.MathUtils.lerp(3.2, 0.0, ease),
          THREE.MathUtils.lerp(3.4, 7.0, ease)
        );
        targetLookAt.current.set(0, 0, 0);
      }

      activeCamera.position.x = damp(activeCamera.position.x, targetCamPos.current.x, 3.0, delta);
      activeCamera.position.y = damp(activeCamera.position.y, targetCamPos.current.y, 3.0, delta);
      activeCamera.position.z = damp(activeCamera.position.z, targetCamPos.current.z, 3.0, delta);

      currentLookAt.current.x = damp(currentLookAt.current.x, targetLookAt.current.x, 3.2, delta);
      currentLookAt.current.y = damp(currentLookAt.current.y, targetLookAt.current.y, 3.2, delta);
      currentLookAt.current.z = damp(currentLookAt.current.z, targetLookAt.current.z, 3.2, delta);

      activeCamera.lookAt(currentLookAt.current);
    } else {
      // Cosmic Breath: Master 0.05 Hz harmonic respiration
      const breathingY = Math.sin(time * 0.314159) * 0.045;

      // Life Pulse: Subtle 0.25 Hz micro-pulse heartbeat
      const lifePulseY = Math.sin(time * 1.5708) * 0.008;

      // Extremely slow ancient longitudinal drift
      const driftZ = Math.cos(time * 0.08) * 0.06;
      const driftX = Math.sin(time * 0.05) * 0.04;

      // Subtle pointer parallax (constrained nodal pivot)
      const parallaxX = pointer.x * 0.32;
      const parallaxY = pointer.y * 0.24;

      // Camera Handoff: Seamless forward push toward singularity z=5.5 as transition progresses
      const targetBaseZ = THREE.MathUtils.lerp(7.0, 5.5, transition);
      const kineticDepth = -scrollEnergy * 0.35;

      targetCamPos.current.set(
        0.0 + driftX + parallaxX,
        0.0 + breathingY + lifePulseY + parallaxY,
        targetBaseZ + driftZ + kineticDepth
      );

      targetLookAt.current.set(
        parallaxX * 0.15,
        parallaxY * 0.15,
        0.0
      );

      // High-inertia physical damping
      activeCamera.position.x = damp(activeCamera.position.x, targetCamPos.current.x, 2.8, delta);
      activeCamera.position.y = damp(activeCamera.position.y, targetCamPos.current.y, 2.8, delta);
      activeCamera.position.z = damp(activeCamera.position.z, targetCamPos.current.z, 2.8, delta);

      currentLookAt.current.x = damp(currentLookAt.current.x, targetLookAt.current.x, 3.2, delta);
      currentLookAt.current.y = damp(currentLookAt.current.y, targetLookAt.current.y, 3.2, delta);
      currentLookAt.current.z = damp(currentLookAt.current.z, targetLookAt.current.z, 3.2, delta);

      activeCamera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
