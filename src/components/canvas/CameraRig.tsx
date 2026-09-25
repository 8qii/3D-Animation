'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore, SCENES } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function CameraRig() {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const pointer = useExperienceStore((state) => state.pointer);

  // Reusable vectors to eliminate GC in the render loop
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 6));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Determine base camera position & target by interpolating across scenes based on scroll
    // Scene 01: [0, 0, 6] -> target [0, 0, 0]
    // Scene 02: [3, 1.5, 4.5] -> target [0, 0.2, 0]
    // Scene 03: [0, 4, 3.5] -> target [0, 0, 0]
    const totalScenes = SCENES.length;
    const scaledProgress = scrollProgress * (totalScenes - 1);
    const sceneIndex = Math.min(Math.floor(scaledProgress), totalScenes - 2);
    const sceneAlpha = scaledProgress - sceneIndex;

    const fromScene = SCENES[sceneIndex] || SCENES[0];
    const toScene = SCENES[sceneIndex + 1] || SCENES[SCENES.length - 1];

    const basePosX = THREE.MathUtils.lerp(fromScene.cameraPosition[0], toScene.cameraPosition[0], sceneAlpha);
    const basePosY = THREE.MathUtils.lerp(fromScene.cameraPosition[1], toScene.cameraPosition[1], sceneAlpha);
    const basePosZ = THREE.MathUtils.lerp(fromScene.cameraPosition[2], toScene.cameraPosition[2], sceneAlpha);

    const baseTargetX = THREE.MathUtils.lerp(fromScene.cameraTarget[0], toScene.cameraTarget[0], sceneAlpha);
    const baseTargetY = THREE.MathUtils.lerp(fromScene.cameraTarget[1], toScene.cameraTarget[1], sceneAlpha);
    const baseTargetZ = THREE.MathUtils.lerp(fromScene.cameraTarget[2], toScene.cameraTarget[2], sceneAlpha);

    // Mouse parallax offset (subtle cinematic drift)
    const parallaxX = pointer.x * 0.45;
    const parallaxY = pointer.y * 0.35;

    targetCamPos.current.set(
      basePosX + parallaxX,
      basePosY + parallaxY,
      basePosZ
    );

    targetLookAt.current.set(
      baseTargetX + parallaxX * 0.2,
      baseTargetY + parallaxY * 0.2,
      baseTargetZ
    );

    // Smooth exponential damping directly on state.camera
    const activeCamera = state.camera;
    activeCamera.position.x = damp(activeCamera.position.x, targetCamPos.current.x, 3.5, delta);
    activeCamera.position.y = damp(activeCamera.position.y, targetCamPos.current.y, 3.5, delta);
    activeCamera.position.z = damp(activeCamera.position.z, targetCamPos.current.z, 3.5, delta);

    currentLookAt.current.x = damp(currentLookAt.current.x, targetLookAt.current.x, 4.0, delta);
    currentLookAt.current.y = damp(currentLookAt.current.y, targetLookAt.current.y, 4.0, delta);
    currentLookAt.current.z = damp(currentLookAt.current.z, targetLookAt.current.z, 4.0, delta);

    activeCamera.lookAt(currentLookAt.current);
  });

  return null;
}
