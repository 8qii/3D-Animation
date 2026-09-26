'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function CameraRig() {
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // FPS calculation references
  const frameCounter = useRef(0);
  const timeAccumulator = useRef(0);
  const setFps = useExperienceStore((state) => state.setFps);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Transient store access for optimal 60 FPS performance
    const store = useExperienceStore.getState();
    const pointer = store.pointer;
    const scrollEnergy = store.scrollEnergy;
    const scrollProgress = store.scrollProgress;
    const isPreviewMode = store.isPreviewMode;
    const previewTime = store.previewTime;
    const setPreviewTime = store.setPreviewTime;

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

    // 2. Camera Choreography (3 Distinct Stages):
    // Stage 0: Observer (Contemplative forward gaze)
    // Stage 1: Witness (Diagonal orbital vitrine sweep)
    // Stage 2: Architectural Contemplation (Final Master View: [3.0, 1.5, 4.5] looking at [0, 0.2, 0])

    let choreoStage = 0; // 0: Observer, 1: Witness, 2: Architectural Contemplation
    let stageProgress = 0; // [0..1] within the active stage

    if (isPreviewMode) {
      const nextTime = (previewTime + delta) % 50.0;
      setPreviewTime(nextTime);

      if (nextTime < 12.0) {
        choreoStage = 0;
        stageProgress = nextTime / 12.0;
      } else if (nextTime < 26.0) {
        choreoStage = 1;
        stageProgress = (nextTime - 12.0) / 14.0;
      } else {
        choreoStage = 2;
        stageProgress = Math.min(1.0, (nextTime - 26.0) / 14.0);
      }
    } else {
      if (scrollProgress < 0.22) {
        choreoStage = 0;
        stageProgress = scrollProgress / 0.22;
      } else if (scrollProgress < 0.38) {
        choreoStage = 1;
        stageProgress = (scrollProgress - 0.22) / 0.16;
      } else {
        choreoStage = 2;
        stageProgress = Math.min(1.0, (scrollProgress - 0.38) / 0.14);
      }
    }

    // Dynamic FOV based on choreo stage:
    // 45° (Act I) -> 42° (Act II) -> 39° (Witness) -> 38° (Final Architectural Contemplation)
    let baseFov = 45.0;
    if (choreoStage === 0) {
      baseFov = THREE.MathUtils.lerp(45.0, 42.0, stageProgress);
    } else if (choreoStage === 1) {
      baseFov = THREE.MathUtils.lerp(42.0, 39.0, stageProgress);
    } else {
      baseFov = THREE.MathUtils.lerp(39.0, 38.0, stageProgress);
    }

    const lensBreathing = Math.sin(time * 0.314159) * 0.25 - scrollEnergy * 0.65;
    const targetFov = baseFov + lensBreathing;

    if (Math.abs(activeCamera.fov - targetFov) > 0.01) {
      activeCamera.fov = damp(activeCamera.fov, targetFov, 2.8, delta);
      activeCamera.updateProjectionMatrix();
    }

    // Natural Organic Breathing & Pointer Parallax
    const breathingY = Math.sin(time * 0.314159) * 0.035;
    const driftZ = Math.cos(time * 0.08) * 0.04;
    const parallaxX = pointer.x * 0.25;
    const parallaxY = pointer.y * 0.18;

    if (choreoStage === 0) {
      // Stage 0: OBSERVER
      // Forward contemplative gaze from [0, 0, 7.0] down to [0, 0, 5.5]
      const ease = THREE.MathUtils.smoothstep(stageProgress, 0, 1);
      targetCamPos.current.set(
        0.0 + parallaxX,
        breathingY + parallaxY,
        THREE.MathUtils.lerp(7.0, 5.5, ease) + driftZ
      );
      targetLookAt.current.set(parallaxX * 0.15, parallaxY * 0.15, 0.0);
    } else if (choreoStage === 1) {
      // Stage 1: WITNESS
      // Diagonal vitrine orbital sweep [2.2, 1.4, 4.6] surveying vertices & edges drawing in 3D
      const ease = THREE.MathUtils.smoothstep(stageProgress, 0, 1);
      const angle = ease * Math.PI * 0.65;
      targetCamPos.current.set(
        Math.sin(angle) * 2.2 + parallaxX * 0.4,
        1.2 + Math.sin(ease * Math.PI) * 0.35 + breathingY,
        Math.cos(angle) * 1.4 + 4.2 + driftZ
      );
      targetLookAt.current.set(0.08, 0.05, 0.0);
    } else {
      // Stage 2: ARCHITECTURAL CONTEMPLATION
      // Glides gracefully to final master position: [3.0, 1.5, 4.5] looking at [0, 0.2, 0]
      const ease = THREE.MathUtils.smoothstep(stageProgress, 0, 1);
      targetCamPos.current.set(
        THREE.MathUtils.lerp(2.2, 3.0, ease) + parallaxX * 0.3,
        THREE.MathUtils.lerp(1.2, 1.5, ease) + breathingY,
        THREE.MathUtils.lerp(4.2, 4.5, ease) + driftZ
      );
      targetLookAt.current.set(
        THREE.MathUtils.lerp(0.08, 0.0, ease),
        THREE.MathUtils.lerp(0.05, 0.2, ease),
        0.0
      );
    }

    // High-inertia physical damping
    activeCamera.position.x = damp(activeCamera.position.x, targetCamPos.current.x, 2.6, delta);
    activeCamera.position.y = damp(activeCamera.position.y, targetCamPos.current.y, 2.6, delta);
    activeCamera.position.z = damp(activeCamera.position.z, targetCamPos.current.z, 2.6, delta);

    currentLookAt.current.x = damp(currentLookAt.current.x, targetLookAt.current.x, 3.0, delta);
    currentLookAt.current.y = damp(currentLookAt.current.y, targetLookAt.current.y, 3.0, delta);
    currentLookAt.current.z = damp(currentLookAt.current.z, targetLookAt.current.z, 3.0, delta);

    activeCamera.lookAt(currentLookAt.current);
  });

  return null;
}
