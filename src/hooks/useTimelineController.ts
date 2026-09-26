'use client';

import { useEffect } from 'react';
import { useExperienceStore, TransitionState, Act2Phase } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

const TRANSITION_START = 0.10;
const IGNITION_POINT = 0.18;
const TRANSITION_END = 0.28;

const ACT2_SCROLL_START = 0.20;
const ACT2_SCROLL_END = 0.40;

export function useTimelineController() {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const isPreviewMode = useExperienceStore((state) => state.isPreviewMode);
  const previewTime = useExperienceStore((state) => state.previewTime);
  const setTransitionProgress = useExperienceStore((state) => state.setTransitionProgress);
  const setTransitionState = useExperienceStore((state) => state.setTransitionState);
  const setAct2Progress = useExperienceStore((state) => state.setAct2Progress);
  const setAct2Phase = useExperienceStore((state) => state.setAct2Phase);
  const setMatterProgress = useExperienceStore((state) => state.setMatterProgress);

  useEffect(() => {
    // 1. Cross-Scene Transition Progress (Act I -> Act II boundary)
    const rawTransition = clamp(
      (scrollProgress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START),
      0.0,
      1.0
    );
    const smoothTransition = rawTransition * rawTransition * (3 - 2 * rawTransition);
    setTransitionProgress(smoothTransition);

    let nextTransitionState: TransitionState = 'VACUUM_RESTING';
    if (scrollProgress >= TRANSITION_END) {
      nextTransitionState = 'SINGULARITY_STABILIZED';
    } else if (scrollProgress >= IGNITION_POINT) {
      nextTransitionState = 'QUANTUM_IGNITION';
    } else if (scrollProgress >= TRANSITION_START) {
      nextTransitionState = 'SINGULARITY_APPROACH';
    }
    setTransitionState(nextTransitionState);

    // 2. Act II Cinematic Timeline Calculation
    let act2Prog = 0.0;
    let act2Ph: Act2Phase = 'IDLE';
    let matterProg = 0.0;

    if (isPreviewMode) {
      // 0 - 40s Cinematic sequence:
      // 0-10s: Spark Ignition
      // 10-20s: Coordinate Genesis
      // 20-40s: Geometry Stabilization & Matter Genesis
      act2Prog = clamp(previewTime / 40.0, 0.0, 1.0);
      if (previewTime < 10.0) {
        act2Ph = 'SPARK_IGNITION';
      } else if (previewTime < 20.0) {
        act2Ph = 'COORDINATE_GENESIS';
      } else {
        act2Ph = 'GEOMETRY_STABILIZATION';
      }

      if (previewTime >= 20.0) {
        matterProg = clamp((previewTime - 20.0) / 18.0, 0.0, 1.0);
      }
    } else {
      // Scroll-driven progression: S in [0.20, 0.40]
      if (scrollProgress >= ACT2_SCROLL_START) {
        const rawAct2 = clamp(
          (scrollProgress - ACT2_SCROLL_START) / (ACT2_SCROLL_END - ACT2_SCROLL_START),
          0.0,
          1.0
        );
        act2Prog = rawAct2 * rawAct2 * (3 - 2 * rawAct2);

        if (act2Prog < 0.25) {
          act2Ph = 'SPARK_IGNITION';
        } else if (act2Prog < 0.55) {
          act2Ph = 'COORDINATE_GENESIS';
        } else {
          act2Ph = 'GEOMETRY_STABILIZATION';
        }

        if (act2Prog >= 0.45) {
          matterProg = clamp((act2Prog - 0.45) / 0.50, 0.0, 1.0);
        }
      } else if (scrollProgress >= TRANSITION_START) {
        // Subtle prelude into ignition
        act2Prog = (scrollProgress - TRANSITION_START) / (ACT2_SCROLL_START - TRANSITION_START) * 0.15;
        act2Ph = 'SPARK_IGNITION';
      } else {
        act2Prog = 0.0;
        act2Ph = 'IDLE';
      }
    }

    setAct2Progress(act2Prog);
    setAct2Phase(act2Ph);
    setMatterProgress(matterProg);
  }, [
    scrollProgress,
    isPreviewMode,
    previewTime,
    setTransitionProgress,
    setTransitionState,
    setAct2Progress,
    setAct2Phase,
    setMatterProgress,
  ]);
}
