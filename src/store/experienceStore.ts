import { create } from 'zustand';

export type SceneId = 'scene-01' | 'scene-02' | 'scene-03';

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
    cameraPosition: [0, 0, 6],
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

  // Cursor Parallax
  pointer: { x: number; y: number };
  setPointer: (x: number, y: number) => void;

  // Audio & Experience controls
  isMuted: boolean;
  toggleMute: () => void;
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

  // Pointer parallax initial state
  pointer: { x: 0, y: 0 },
  setPointer: (x: number, y: number) => set({ pointer: { x, y } }),

  // Audio controls
  isMuted: true,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
