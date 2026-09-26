'use client';

import { useEffect } from 'react';
import { useExperienceStore } from '@/store/experienceStore';
import { soundEngine } from '@/utils/audioEngine';

export function useAudioTransition() {
  const isMuted = useExperienceStore((state) => state.isMuted);
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const scrollEnergy = useExperienceStore((state) => state.scrollEnergy);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Sync continuous transition frequency & filter updates
  useEffect(() => {
    if (!isMuted) {
      soundEngine.updateTransition(transitionProgress, scrollEnergy);

      // Trigger D-Minor singularity bell chime when threshold crossed
      if (transitionProgress >= 0.65) {
        soundEngine.triggerSingularityChime();
      } else if (transitionProgress < 0.2) {
        soundEngine.resetChimeTrigger();
      }
    }
  }, [transitionProgress, scrollEnergy, isMuted]);

  useEffect(() => {
    return () => {
      soundEngine.destroy();
    };
  }, []);
}
