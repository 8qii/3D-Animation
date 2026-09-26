import { create } from 'zustand';

export type SceneId = 'scene-01' | 'scene-02' | 'scene-03';

export type TransitionState =
  | 'VACUUM_RESTING'
  | 'SINGULARITY_APPROACH'
  | 'QUANTUM_IGNITION'
  | 'SINGULARITY_STABILIZED';

export type Act2Phase =
  | 'IDLE'
  | 'SPARK_IGNITION'
  | 'COORDINATE_GENESIS'
  | 'GEOMETRY_STABILIZATION';

export type MonolithPhase =
  | 'MONOLITH_REST'
  | 'MEMORY_RESONANCE'
  | 'FINAL_STILLNESS';

export type ObserverRecognitionState =
  | 'DORMANT'
  | 'OBSERVER_DETECTED'
  | 'OBSERVER_SYNCHRONIZED'
  | 'GENESIS_RESPONSE_ACTIVE';

export type ObserverArchetype =
  | 'THE_INITIATE'
  | 'THE_WITNESS'
  | 'THE_CATALYST'
  | 'THE_ARCHITECT';

export type HiddenEndingType =
  | 'TRANSCENDENCE'
  | 'SUPERNOVA'
  | 'ASCENSION';

export type GpuTier = 'TIER_ULTRA' | 'TIER_BALANCED' | 'TIER_EFFICIENT';


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

  // Act II: The Singularity Engine
  act2Progress: number; // 0 to 1 across Act II timeline
  act2Phase: Act2Phase;
  matterProgress: number; // 0 to 1 across Matter Genesis
  setAct2Progress: (progress: number) => void;
  setAct2Phase: (phase: Act2Phase) => void;
  setMatterProgress: (progress: number) => void;

  // Act III: The Monolith Engine & Phase 8.75 Memory & Stillness
  act3Progress: number; // 0 to 1 across Act III timeline
  materialLockProgress: number; // 0 (hologram) to 1 (solid physical obsidian)
  tensionProgress: number; // 0 (quiescent monolith) to 1 (critical internal stress)
  monolithPhase: MonolithPhase;
  memoryProgress: number; // 0 to 1 (memory intensity)
  stillnessFactor: number; // 0 (active) to 1 (motionless freeze)
  setAct3Progress: (progress: number) => void;
  setMaterialLockProgress: (progress: number) => void;
  setTensionProgress: (progress: number) => void;
  setMonolithPhase: (phase: MonolithPhase) => void;
  setMemoryProgress: (progress: number) => void;
  setStillnessFactor: (factor: number) => void;

  // Act IV: The Dispersion Engine (Phase 9.0 Fracture, Phase 9.15 Facet Memory Drift, Phase 9.16 Memory Collapse, Phase 9.17 Singularity Threshold)
  act4Progress: number; // 0 to 1 across Act IV timeline
  fractureProgress: number; // 0 to 1 (initial crack fissure opening and facet separation)
  facetMemoryProgress: number; // 0 to 1 (Phase 9.15 facet memory drift & invisible mathematical connection)
  collapseProgress: number; // 0 to 1 (Phase 9.16 memory network collapse & core compression)
  singularityThresholdProgress: number; // 0 to 1 (Phase 9.17 maximum compression & blue-white plasma threshold)
  setAct4Progress: (progress: number) => void;
  setFractureProgress: (progress: number) => void;
  setFacetMemoryProgress: (progress: number) => void;
  setCollapseProgress: (progress: number) => void;
  setSingularityThresholdProgress: (progress: number) => void;

  // Cursor Parallax (Screen Normalized [-1, 1])
  pointer: { x: number; y: number };
  setPointer: (x: number, y: number) => void;

  // Observer Interaction System (3D World Space & Attention)
  mouseWorld: [number, number, number];
  setMouseWorld: (x: number, y: number, z: number) => void;
  attentionLevel: number; // 0 (passive) to 1 (focused observation)
  setAttentionLevel: (level: number) => void;

  // Observer Awakening & Recognition Layer
  observerState: ObserverRecognitionState;
  setObserverState: (state: ObserverRecognitionState) => void;
  observerProximity: number; // 0 (far) to 1 (direct contact)
  setObserverProximity: (proximity: number) => void;
  observerHoverDuration: number; // seconds hovered on crystal
  setObserverHoverDuration: (duration: number) => void;
  observerStillnessScore: number; // 0 (erratic) to 1 (zen stillness)
  setObserverStillnessScore: (score: number) => void;
  cameraOffset: { yaw: number; pitch: number };
  setCameraOffset: (offset: { yaw: number; pitch: number }) => void;
  touchRipple: { active: boolean; intensity: number; position: [number, number, number] };
  triggerTouchRipple: (position: [number, number, number], intensity?: number) => void;
  setTouchRippleIntensity: (intensity: number) => void;

  // Attention Vector System
  attentionVector: [number, number, number];
  setAttentionVector: (vec: [number, number, number]) => void;
  attentionStrength: number;
  setAttentionStrength: (strength: number) => void;

  // Hidden Discovery Event (stillness > 0.8 & hover > 10s)
  hiddenDiscoveryActive: boolean;
  hiddenDiscoveryProgress: number;
  triggerHiddenDiscovery: () => void;
  setHiddenDiscoveryProgress: (val: number) => void;

  // Observer Memory Persistence (localStorage)
  isReturningObserver: boolean;
  setIsReturningObserver: (val: boolean) => void;
  hasSynchronizedBefore: boolean;
  setHasSynchronizedBefore: (val: boolean) => void;
  discoveryLevel: number;
  setDiscoveryLevel: (lvl: number) => void;

  // Mobile Gyroscope Layer (±5°)
  gyroOffset: { x: number; y: number };
  setGyroOffset: (offset: { x: number; y: number }) => void;

  // Phase 9.19 Observer Evolution Engine
  observerArchetype: ObserverArchetype;
  setObserverArchetype: (archetype: ObserverArchetype) => void;
  archetypeScores: { witness: number; catalyst: number; architect: number };
  updateArchetypeScores: (scores: Partial<{ witness: number; catalyst: number; architect: number }>) => void;
  hiddenEnding: HiddenEndingType | null;
  setHiddenEnding: (ending: HiddenEndingType | null) => void;
  cursorGravitationalForce: number;
  setCursorGravitationalForce: (force: number) => void;

  // Adaptive GPU Quality System
  gpuTier: GpuTier;
  setGpuTier: (tier: GpuTier) => void;


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

  // Act II: The Singularity Initial State
  act2Progress: 0,
  act2Phase: 'IDLE',
  matterProgress: 0,
  setAct2Progress: (progress: number) =>
    set({
      act2Progress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setAct2Phase: (phase: Act2Phase) => set({ act2Phase: phase }),
  setMatterProgress: (progress: number) =>
    set({
      matterProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),

  // Act III: The Monolith Initial State
  act3Progress: 0,
  materialLockProgress: 0,
  tensionProgress: 0,
  monolithPhase: 'MONOLITH_REST',
  memoryProgress: 0,
  stillnessFactor: 0,
  setAct3Progress: (progress: number) =>
    set({
      act3Progress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setMaterialLockProgress: (progress: number) =>
    set({
      materialLockProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setTensionProgress: (progress: number) =>
    set({
      tensionProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setMonolithPhase: (monolithPhase: MonolithPhase) => set({ monolithPhase }),
  setMemoryProgress: (progress: number) =>
    set({
      memoryProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setStillnessFactor: (factor: number) =>
    set({
      stillnessFactor: Math.min(1.0, Math.max(0.0, factor)),
    }),

  // Act IV: The Dispersion Initial State
  act4Progress: 0,
  fractureProgress: 0,
  facetMemoryProgress: 0,
  collapseProgress: 0,
  singularityThresholdProgress: 0,
  setAct4Progress: (progress: number) =>
    set({
      act4Progress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setFractureProgress: (progress: number) =>
    set({
      fractureProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setFacetMemoryProgress: (progress: number) =>
    set({
      facetMemoryProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setCollapseProgress: (progress: number) =>
    set({
      collapseProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),
  setSingularityThresholdProgress: (progress: number) =>
    set({
      singularityThresholdProgress: Math.min(1.0, Math.max(0.0, progress)),
    }),

  // Pointer parallax initial state
  pointer: { x: 0, y: 0 },
  setPointer: (x: number, y: number) => set({ pointer: { x, y } }),

  // Observer Interaction System
  mouseWorld: [0, 0, 0],
  setMouseWorld: (x: number, y: number, z: number) => set({ mouseWorld: [x, y, z] }),
  attentionLevel: 0,
  setAttentionLevel: (level: number) =>
    set({ attentionLevel: Math.min(1.0, Math.max(0.0, level)) }),

  // Observer Awakening & Recognition Layer
  observerState: 'DORMANT',
  setObserverState: (observerState: ObserverRecognitionState) => set({ observerState }),
  observerProximity: 0,
  setObserverProximity: (proximity: number) =>
    set({ observerProximity: Math.min(1.0, Math.max(0.0, proximity)) }),
  observerHoverDuration: 0,
  setObserverHoverDuration: (duration: number) =>
    set({ observerHoverDuration: Math.max(0, duration) }),
  observerStillnessScore: 0,
  setObserverStillnessScore: (score: number) =>
    set({ observerStillnessScore: Math.min(1.0, Math.max(0.0, score)) }),
  cameraOffset: { yaw: 0, pitch: 0 },
  setCameraOffset: (offset: { yaw: number; pitch: number }) => set({ cameraOffset: offset }),
  touchRipple: { active: false, intensity: 0, position: [0, 0, 0] },
  triggerTouchRipple: (position: [number, number, number], intensity = 1.0) =>
    set({ touchRipple: { active: true, intensity, position } }),
  setTouchRippleIntensity: (intensity: number) =>
    set((state) => ({
      touchRipple: {
        ...state.touchRipple,
        intensity: Math.max(0, intensity),
        active: intensity > 0.01,
      },
    })),

  // Attention Vector System
  attentionVector: [0, 0, -1],
  setAttentionVector: (attentionVector: [number, number, number]) => set({ attentionVector }),
  attentionStrength: 0,
  setAttentionStrength: (strength: number) =>
    set({ attentionStrength: Math.min(1.0, Math.max(0.0, strength)) }),

  // Hidden Discovery Event
  hiddenDiscoveryActive: false,
  hiddenDiscoveryProgress: 0,
  triggerHiddenDiscovery: () => set({ hiddenDiscoveryActive: true, hiddenDiscoveryProgress: 1.0 }),
  setHiddenDiscoveryProgress: (progress: number) =>
    set({ hiddenDiscoveryProgress: Math.min(1.0, Math.max(0.0, progress)) }),

  // Observer Memory Persistence
  isReturningObserver: false,
  setIsReturningObserver: (isReturningObserver: boolean) => set({ isReturningObserver }),
  hasSynchronizedBefore: false,
  setHasSynchronizedBefore: (hasSynchronizedBefore: boolean) => set({ hasSynchronizedBefore }),
  discoveryLevel: 0,
  setDiscoveryLevel: (discoveryLevel: number) => set({ discoveryLevel }),

  // Mobile Gyroscope Layer
  gyroOffset: { x: 0, y: 0 },
  setGyroOffset: (gyroOffset: { x: number; y: number }) => set({ gyroOffset }),

  // Phase 9.19 Observer Evolution Engine
  observerArchetype: 'THE_INITIATE',
  setObserverArchetype: (observerArchetype: ObserverArchetype) => set({ observerArchetype }),
  archetypeScores: { witness: 0, catalyst: 0, architect: 0 },
  updateArchetypeScores: (scores) =>
    set((state) => ({
      archetypeScores: {
        witness: state.archetypeScores.witness + (scores.witness ?? 0),
        catalyst: state.archetypeScores.catalyst + (scores.catalyst ?? 0),
        architect: state.archetypeScores.architect + (scores.architect ?? 0),
      },
    })),
  hiddenEnding: null,
  setHiddenEnding: (hiddenEnding: HiddenEndingType | null) => set({ hiddenEnding }),
  cursorGravitationalForce: 0.04,
  setCursorGravitationalForce: (cursorGravitationalForce: number) => set({ cursorGravitationalForce }),

  // Adaptive GPU Quality System
  gpuTier: 'TIER_ULTRA',
  setGpuTier: (gpuTier: GpuTier) => set({ gpuTier }),



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
