'use client';

import { useEffect } from 'react';
import { useExperienceStore } from '@/store/experienceStore';
import { soundEngine } from '@/utils/audioEngine';

export function useAudioTransition() {
  const isMuted = useExperienceStore((state) => state.isMuted);
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const act2Progress = useExperienceStore((state) => state.act2Progress);
  const matterProgress = useExperienceStore((state) => state.matterProgress);
  const act3Progress = useExperienceStore((state) => state.act3Progress);
  const materialLockProgress = useExperienceStore((state) => state.materialLockProgress);
  const scrollEnergy = useExperienceStore((state) => state.scrollEnergy);
  const pointer = useExperienceStore((state) => state.pointer);
  const attentionLevel = useExperienceStore((state) => state.attentionLevel);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Sync continuous spatial position, sub-bass, and crystal resonance
  useEffect(() => {
    if (!isMuted) {
      soundEngine.updateTransition(
        transitionProgress,
        scrollEnergy,
        pointer.x,
        attentionLevel,
        act2Progress
      );

      // Trigger D-Minor singularity bell chime when spark ignition threshold crossed
      if (transitionProgress >= 0.65 || act2Progress >= 0.20) {
        soundEngine.triggerSingularityChime(pointer.x);
      } else if (transitionProgress < 0.2 && act2Progress < 0.1) {
        soundEngine.resetChimeTrigger();
      }

      // Cinematic Silence Event:
      // When matter reaches pre-materialization lock (matterProgress >= 0.82),
      // the universe ducks into absolute silence before the final materialization.
      if (matterProgress >= 0.82 && materialLockProgress < 0.70) {
        soundEngine.triggerCinematicSilence();
      } else if (matterProgress < 0.45) {
        soundEngine.resetSilence(isMuted);
      }

      // Act III Glass Cello & Deep Harmonic Chord Resolution:
      // Triggers after silence once physical obsidian crystal locks into place.
      if (materialLockProgress >= 0.70 || act3Progress >= 0.20) {
        soundEngine.triggerGlassCelloResolution();
      } else if (materialLockProgress < 0.20 && act3Progress < 0.05) {
        soundEngine.resetResolution();
      }
    }
  }, [
    transitionProgress,
    act2Progress,
    matterProgress,
    act3Progress,
    materialLockProgress,
    scrollEnergy,
    pointer.x,
    attentionLevel,
    isMuted,
  ]);

  useEffect(() => {
    return () => {
      soundEngine.destroy();
    };
  }, []);
}
