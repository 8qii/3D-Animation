'use client';

import { useEffect } from 'react';
import { useExperienceStore, TransitionState } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

const TRANSITION_START = 0.10;
const IGNITION_POINT = 0.18;
const TRANSITION_END = 0.28;

export function useTimelineController() {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const setTransitionProgress = useExperienceStore((state) => state.setTransitionProgress);
  const setTransitionState = useExperienceStore((state) => state.setTransitionState);

  useEffect(() => {
    // 1. Calculate raw linear progress within transition zone
    const rawProgress = clamp(
      (scrollProgress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START),
      0.0,
      1.0
    );

    // 2. Smooth cubic Hermite interpolation curve
    const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    setTransitionProgress(smoothProgress);

    // 3. State machine lifecycle evaluation
    let nextState: TransitionState = 'VACUUM_RESTING';
    if (scrollProgress >= TRANSITION_END) {
      nextState = 'SINGULARITY_STABILIZED';
    } else if (scrollProgress >= IGNITION_POINT) {
      nextState = 'QUANTUM_IGNITION';
    } else if (scrollProgress >= TRANSITION_START) {
      nextState = 'SINGULARITY_APPROACH';
    }

    setTransitionState(nextState);
  }, [scrollProgress, setTransitionProgress, setTransitionState]);
}
