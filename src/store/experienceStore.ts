import { create } from 'zustand';

export type SceneId = 'scene-01' | 'scene-02' | 'scene-03';

export type TransitionState =
  | 'VACUUM_RESTING'
  | 'SINGULARITY_APPROACH'
  | 'QUANTUM_IGNITION'
  | 'SINGULARITY_STABILIZED';

export interface SceneMeta {
  id: SceneId;
  index: number;
  title: string;
  subtitle: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const SCENES: SceneMeta[] = [
  {
    id: 'scene-01',
    index: 0,
    title: 'Genesis',
    subtitle: 'The Core Awakening',
    cameraPosition: [0, 0, 7],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 'scene-02',
    index: 1,
    title: 'Structure',
    subtitle: 'Quantum Geometry & Dispersion',
    cameraPosition: [3, 1.5, 4.5],
    cameraTarget: [0, 0.2, 0],
  },
  {
    id: 'scene-03',
    index: 2,
    title: 'Ascension',
    subtitle: 'Infinite Luminescence',
    cameraPosition: [0, 4, 3.5],
    cameraTarget: [0, 0, 0],
  },
];

interface ExperienceState {
  // Loading & Readiness
  isLoading: boolean;
  loadingProgress: number; // 0 to 100
  isReady: boolean;
  setLoadingProgress: (progress: number) => void;
  finishLoading: () => void;

  // Scenes & Navigation
  activeSceneId: SceneId;
  activeSceneIndex: number;
  setActiveScene: (id: SceneId) => void;
  setActiveSceneByIndex: (index: number) => void;

  // Scroll Progress
  scrollProgress: number; // 0 to 1 overall
  setScrollProgress: (progress: number) => void;

  // Cross-Scene Transition Engine
  transitionProgress: number; // 0 (pure Act I) to 1 (pure Act II)
  transitionState: TransitionState;
  setTransitionProgress: (progress: number) => void;
  setTransitionState: (state: TransitionState) => void;

  // Cursor Parallax (Screen Normalized [-1, 1])
  pointer: { x: number; y: number };
  setPointer: (x: number, y: number) => void;

  // Observer Interaction System (3D World Space & Attention)
  mouseWorld: [number, number, number];
  setMouseWorld: (x: number, y: number, z: number) => void;
  attentionLevel: number; // 0 (passive) to 1 (focused observation)
  setAttentionLevel: (level: number) => void;

  // Kinetic Scroll Energy (Thermodynamics)
  scrollEnergy: number; // 0 (cold vacuum) to 1 (excited plasma)
  addScrollEnergy: (amount: number) => void;
  decayScrollEnergy: (delta: number) => void;

  // Universal Harmonized Breathing Phase
  breathPhase: number; // 0 to 1 synchronized oscillation
  setBreathPhase: (phase: number) => void;

  // Audio & Experience controls
  isMuted: boolean;
  toggleMute: () => void;

  // Cinematic Preview Mode (Shortcut 'P')
  isPreviewMode: boolean;
  previewTime: number; // 0 to 30s
  togglePreviewMode: () => void;
  setPreviewMode: (val: boolean) => void;
  setPreviewTime: (time: number) => void;

  // Debug & Performance
  isDebugMode: boolean;
  setDebugMode: (val: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;

  // Real-time Tuning Uniforms / Parameters
  bloomIntensity: number;
  setBloomIntensity: (val: number) => void;
  dofEnabled: boolean;
  setDofEnabled: (val: boolean) => void;
  particleSpeedMultiplier: number;
  setParticleSpeedMultiplier: (val: number) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  // Loading initial state
  isLoading: true,
  loadingProgress: 0,
  isReady: false,
  setLoadingProgress: (progress: number) =>
    set({
      loadingProgress: Math.min(100, Math.max(0, Math.round(progress))),
    }),
  finishLoading: () =>
    set({
      isLoading: false,
      isReady: true,
      loadingProgress: 100,
    }),

  // Scene initial state
  activeSceneId: 'scene-01',
  activeSceneIndex: 0,
  setActiveScene: (id: SceneId) => {
    const scene = SCENES.find((s) => s.id === id);
    if (scene) {
      set({ activeSceneId: id, activeSceneIndex: scene.index });
    }
  },
  setActiveSceneByIndex: (index: number) => {
    const clampedIndex = Math.min(SCENES.length - 1, Math.max(0, index));
    const scene = SCENES[clampedIndex];
    if (scene) {
      set({ activeSceneId: scene.id, activeSceneIndex: clampedIndex });
    }
  },

  // Scroll initial state
  scrollProgress: 0,
  setScrollProgress: (progress: number) =>
    set({
      scrollProgress: Math.min(1, Math.max(0, progress)),
    }),

  // Cross-Scene Transition Initial State
  transitionProgress: 0,
  transitionState: 'VACUUM_RESTING',
  setTransitionProgress: (progress: number) =>
    set({
      transitionProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setTransitionState: (transitionState: TransitionState) =>
    set({ transitionState }),

  // Pointer parallax initial state
  pointer: { x: 0, y: 0 },
  setPointer: (x: number, y: number) => set({ pointer: { x, y } }),

  // Observer Interaction System
  mouseWorld: [0, 0, 0],
  setMouseWorld: (x: number, y: number, z: number) => set({ mouseWorld: [x, y, z] }),
  attentionLevel: 0,
  setAttentionLevel: (level: number) =>
    set({ attentionLevel: Math.min(1.0, Math.max(0.0, level)) }),

  // Kinetic Scroll Energy
  scrollEnergy: 0,
  addScrollEnergy: (amount: number) =>
    set((state) => ({
      scrollEnergy: Math.min(1.0, state.scrollEnergy + amount),
    })),
  decayScrollEnergy: (delta: number) =>
    set((state) => ({
      scrollEnergy: Math.max(0.0, state.scrollEnergy * Math.exp(-delta / 1.8)),
    })),

  // Universal Harmonized Breathing Phase
  breathPhase: 0,
  setBreathPhase: (phase: number) => set({ breathPhase: phase }),

  // Audio controls
  isMuted: true,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // Cinematic Preview Mode
  isPreviewMode: false,
  previewTime: 0,
  togglePreviewMode: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode, previewTime: 0 })),
  setPreviewMode: (val: boolean) => set({ isPreviewMode: val, previewTime: 0 }),
  setPreviewTime: (time: number) => set({ previewTime: time }),

  // Debug & Performance
  isDebugMode: false,
  setDebugMode: (val: boolean) => set({ isDebugMode: val }),
  fps: 60,
  setFps: (fps: number) => set({ fps }),

  // Real-time Tuning Parameters
  bloomIntensity: 1.2,
  setBloomIntensity: (val: number) => set({ bloomIntensity: val }),
  dofEnabled: true,
  setDofEnabled: (val: boolean) => set({ dofEnabled: val }),
  particleSpeedMultiplier: 1.0,
  setParticleSpeedMultiplier: (val: number) => set({ particleSpeedMultiplier: val }),
}));
