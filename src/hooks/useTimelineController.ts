'use client';

import { useEffect } from 'react';
import { useExperienceStore, TransitionState, Act2Phase, MonolithPhase } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

const TRANSITION_START = 0.10;
const IGNITION_POINT = 0.18;
const TRANSITION_END = 0.28;

const ACT2_SCROLL_START = 0.20;
const ACT2_SCROLL_END = 0.40;

const ACT3_SCROLL_START = 0.38;
const ACT3_SCROLL_END = 0.65;

export function useTimelineController() {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const isPreviewMode = useExperienceStore((state) => state.isPreviewMode);
  const previewTime = useExperienceStore((state) => state.previewTime);
  const setTransitionProgress = useExperienceStore((state) => state.setTransitionProgress);
  const setTransitionState = useExperienceStore((state) => state.setTransitionState);
  const setAct2Progress = useExperienceStore((state) => state.setAct2Progress);
  const setAct2Phase = useExperienceStore((state) => state.setAct2Phase);
  const setMatterProgress = useExperienceStore((state) => state.setMatterProgress);
  const setAct3Progress = useExperienceStore((state) => state.setAct3Progress);
  const setMaterialLockProgress = useExperienceStore((state) => state.setMaterialLockProgress);
  const setTensionProgress = useExperienceStore((state) => state.setTensionProgress);
  const setMonolithPhase = useExperienceStore((state) => state.setMonolithPhase);
  const setMemoryProgress = useExperienceStore((state) => state.setMemoryProgress);
  const setStillnessFactor = useExperienceStore((state) => state.setStillnessFactor);
  const setAct4Progress = useExperienceStore((state) => state.setAct4Progress);
  const setFractureProgress = useExperienceStore((state) => state.setFractureProgress);
  const setFacetMemoryProgress = useExperienceStore((state) => state.setFacetMemoryProgress);
  const setCollapseProgress = useExperienceStore((state) => state.setCollapseProgress);
  const setSingularityThresholdProgress = useExperienceStore((state) => state.setSingularityThresholdProgress);

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

    // 2. Act II, Act III, & Act IV Phase 9.0 Timeline Calculations
    let act2Prog = 0.0;
    let act2Ph: Act2Phase = 'IDLE';
    let matterProg = 0.0;
    let act3Prog = 0.0;
    let materialLock = 0.0;
    let tensionProg = 0.0;
    let monolithPh: MonolithPhase = 'MONOLITH_REST';
    let memProg = 0.0;
    let stillness = 0.0;
    let act4Prog = 0.0;
    let fractureProg = 0.0;
    let facetMemProg = 0.0;
    let collapseProg = 0.0;
    let thresholdProg = 0.0;

    if (isPreviewMode) {
      // 0 - 60s Cinematic sequence:
      // 0-10s: Spark Ignition
      // 10-20s: Coordinate Genesis
      // 20-30s: Geometry Stabilization & Matter Genesis
      // 30-34s: Pre-Materialization Silence & Caustics
      // 34-38s: Act III The Monolith Revealed & Solidified
      // 38-44s: Phase 8.75 MEMORY_RESONANCE (fracture prediction, tension 0.85 -> 0.98)
      // 44-47.5s: Phase 8.75 FINAL_STILLNESS (3s complete freeze, near absolute silence)
      // 47.5-60s: Phase 9.0 Act IV — The Dispersion // Fracture Initiation
      act2Prog = clamp(previewTime / 40.0, 0.0, 1.0);
      if (previewTime < 10.0) {
        act2Ph = 'SPARK_IGNITION';
      } else if (previewTime < 20.0) {
        act2Ph = 'COORDINATE_GENESIS';
      } else {
        act2Ph = 'GEOMETRY_STABILIZATION';
      }

      if (previewTime >= 20.0) {
        matterProg = clamp((previewTime - 20.0) / 16.0, 0.0, 1.0);
      }

      if (previewTime >= 32.0) {
        materialLock = clamp((previewTime - 32.0) / 4.0, 0.0, 1.0);
        act3Prog = clamp((previewTime - 32.0) / 18.0, 0.0, 1.0);
      }

      if (previewTime >= 38.0 && previewTime < 44.0) {
        monolithPh = 'MEMORY_RESONANCE';
        const t = (previewTime - 38.0) / 6.0;
        memProg = 0.35 + t * 0.65;
        tensionProg = 0.85 + t * 0.13; // 0.85 -> 0.98
      } else if (previewTime >= 44.0 && previewTime < 47.5) {
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = 1.0;
      } else if (previewTime >= 47.5) {
        // Phase 9.0, 9.1, 9.15, 9.16, 9.17 Act IV
        const t = clamp((previewTime - 47.5) / 16.0, 0.0, 1.0);
        act4Prog = t;
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = Math.max(0.0, 1.0 - t * 4.0); // Quick unfreeze on fracture snap

        if (previewTime >= 60.0) {
          // Phase 9.17: Singularity Threshold (3.5s sequence: 60.0s -> 63.5s)
          fractureProg = 1.0;
          facetMemProg = 1.0;
          collapseProg = 1.0;
          thresholdProg = clamp((previewTime - 60.0) / 3.5, 0.0, 1.0);
        } else if (previewTime >= 57.5) {
          // Phase 9.16: Memory Collapse Trigger (2.5s sequence: 57.5s -> 60.0s)
          fractureProg = 1.0;
          facetMemProg = 1.0;
          collapseProg = clamp((previewTime - 57.5) / 2.5, 0.0, 1.0);
          thresholdProg = 0.0;
        } else if (previewTime >= 53.5) {
          // Phase 9.15: Facet Memory Drift
          fractureProg = 1.0;
          facetMemProg = clamp((previewTime - 53.5) / 4.0, 0.0, 1.0);
          collapseProg = 0.0;
          thresholdProg = 0.0;
        } else {
          fractureProg = clamp((previewTime - 47.5) / 6.0, 0.0, 1.0);
          facetMemProg = 0.0;
          collapseProg = 0.0;
          thresholdProg = 0.0;
        }
      } else if (previewTime >= 35.0) {
        tensionProg = clamp((previewTime - 35.0) / 3.0, 0.0, 0.85);
      }
    } else {
      // Scroll-driven progression
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
          matterProg = clamp((act2Prog - 0.45) / 0.45, 0.0, 1.0);
        }
      } else if (scrollProgress >= TRANSITION_START) {
        act2Prog = (scrollProgress - TRANSITION_START) / (ACT2_SCROLL_START - TRANSITION_START) * 0.15;
        act2Ph = 'SPARK_IGNITION';
      } else {
        act2Prog = 0.0;
        act2Ph = 'IDLE';
      }

      // Act III: The Monolith materialization ($S \in [0.38, 0.65]$)
      if (scrollProgress >= ACT3_SCROLL_START) {
        materialLock = clamp((scrollProgress - ACT3_SCROLL_START) / 0.06, 0.0, 1.0);
        const rawAct3 = clamp(
          (scrollProgress - ACT3_SCROLL_START) / (ACT3_SCROLL_END - ACT3_SCROLL_START),
          0.0,
          1.0
        );
        act3Prog = rawAct3 * rawAct3 * (3 - 2 * rawAct3);
      }

      // Phase 8.75 & Phase 9.0 & Phase 9.15 & Phase 9.16 & Phase 9.17 Act IV Timeline
      if (scrollProgress >= 0.995) {
        // S = 0.995 - 1.00: Phase 9.17 Singularity Threshold
        fractureProg = 1.0;
        facetMemProg = 1.0;
        collapseProg = 1.0;
        thresholdProg = clamp((scrollProgress - 0.995) / 0.005, 0.0, 1.0);
        act4Prog = 1.0;
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = 0.0;
      } else if (scrollProgress >= 0.985) {
        // S = 0.985 - 0.995: Phase 9.16 Memory Collapse Trigger
        fractureProg = 1.0;
        facetMemProg = 1.0;
        collapseProg = clamp((scrollProgress - 0.985) / 0.010, 0.0, 1.0);
        thresholdProg = 0.0;
        act4Prog = 1.0;
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = 0.0;
      } else if (scrollProgress >= 0.965) {
        // S = 0.965 - 0.985: Phase 9.15 Facet Memory Drift
        fractureProg = 1.0;
        facetMemProg = clamp((scrollProgress - 0.965) / 0.020, 0.0, 1.0);
        collapseProg = 0.0;
        thresholdProg = 0.0;
        act4Prog = 1.0;
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = 0.0;
      } else if (scrollProgress >= 0.93) {
        // S = 0.93 - 0.965: Phase 9.0 / 9.1 Fracture & Facet Separation
        const t = clamp((scrollProgress - 0.93) / 0.035, 0.0, 1.0);
        fractureProg = t;
        facetMemProg = 0.0;
        collapseProg = 0.0;
        thresholdProg = 0.0;
        act4Prog = clamp((scrollProgress - 0.93) / 0.07, 0.0, 1.0);
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = Math.max(0.0, 1.0 - t * 4.0);
      } else if (scrollProgress >= 0.88) {
        // S = 0.88 - 0.93: FINAL_STILLNESS window
        monolithPh = 'FINAL_STILLNESS';
        memProg = 1.0;
        tensionProg = 1.0;
        stillness = 1.0;
      } else if (scrollProgress >= 0.78) {
        // S = 0.78 - 0.88: MEMORY_RESONANCE
        monolithPh = 'MEMORY_RESONANCE';
        const t = (scrollProgress - 0.78) / 0.10;
        memProg = 0.35 + t * 0.65;
        tensionProg = 0.85 + t * 0.13; // 0.85 -> 0.98

        // Motion reduction preceding final stillness
        if (scrollProgress >= 0.85) {
          stillness = clamp((scrollProgress - 0.85) / 0.03, 0.0, 1.0);
        }
      } else if (scrollProgress >= 0.65) {
        // S = 0.65 - 0.78: MONOLITH_REST
        monolithPh = 'MONOLITH_REST';
        memProg = clamp((scrollProgress - 0.65) / 0.13 * 0.35, 0.0, 0.35);
        tensionProg = 0.85;
      } else if (scrollProgress >= 0.50) {
        const rawTension = clamp((scrollProgress - 0.50) / 0.15, 0.0, 0.85);
        tensionProg = rawTension * rawTension;
      }
    }

    setAct2Progress(act2Prog);
    setAct2Phase(act2Ph);
    setMatterProgress(matterProg);
    setAct3Progress(act3Prog);
    setMaterialLockProgress(materialLock);
    setTensionProgress(tensionProg);
    setMonolithPhase(monolithPh);
    setMemoryProgress(memProg);
    setStillnessFactor(stillness);
    setAct4Progress(act4Prog);
    setFractureProgress(fractureProg);
    setFacetMemoryProgress(facetMemProg);
    setCollapseProgress(collapseProg);
    setSingularityThresholdProgress(thresholdProg);
  }, [
    scrollProgress,
    isPreviewMode,
    previewTime,
    setTransitionProgress,
    setTransitionState,
    setAct2Progress,
    setAct2Phase,
    setMatterProgress,
    setAct3Progress,
    setMaterialLockProgress,
    setTensionProgress,
    setMonolithPhase,
    setMemoryProgress,
    setStillnessFactor,
    setAct4Progress,
    setFractureProgress,
    setFacetMemoryProgress,
    setCollapseProgress,
    setSingularityThresholdProgress,
  ]);
}
