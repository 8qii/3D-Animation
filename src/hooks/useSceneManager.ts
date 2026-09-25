'use client';

import { useMemo } from 'react';
import { SCENES, SceneId, useExperienceStore } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

export interface SceneTransitionData {
  activeScene: (typeof SCENES)[number];
  nextScene: (typeof SCENES)[number] | null;
  previousScene: (typeof SCENES)[number] | null;
  intraSceneProgress: number; // 0 to 1 within the current scene segment
  sceneIndex: number;
  totalScenes: number;
}

export function useSceneManager(): SceneTransitionData & {
  goToScene: (index: number) => void;
  goToSceneById: (id: SceneId) => void;
} {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const activeSceneIndex = useExperienceStore((state) => state.activeSceneIndex);
  const setActiveSceneByIndex = useExperienceStore((state) => state.setActiveSceneByIndex);
  const setActiveScene = useExperienceStore((state) => state.setActiveScene);

  const totalScenes = SCENES.length;

  const sceneData = useMemo(() => {
    // Map scroll progress (0..1) across N scenes
    // Each segment spans 1 / (totalScenes - 1) or 1 / totalScenes
    const segmentSpan = 1 / totalScenes;
    const computedIndex = clamp(
      Math.floor(scrollProgress / segmentSpan),
      0,
      totalScenes - 1
    );

    const segmentStart = computedIndex * segmentSpan;
    const intraProgress = clamp(
      (scrollProgress - segmentStart) / segmentSpan,
      0,
      1
    );

    const active = SCENES[computedIndex] || SCENES[0];
    const prev = computedIndex > 0 ? SCENES[computedIndex - 1] : null;
    const next = computedIndex < totalScenes - 1 ? SCENES[computedIndex + 1] : null;

    return {
      activeScene: active,
      previousScene: prev,
      nextScene: next,
      intraSceneProgress: intraProgress,
      sceneIndex: computedIndex,
      totalScenes,
    };
  }, [scrollProgress, totalScenes]);

  return {
    ...sceneData,
    goToScene: setActiveSceneByIndex,
    goToSceneById: setActiveScene,
  };
}
