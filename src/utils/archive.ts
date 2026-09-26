import { ObserverArchetype, HiddenEndingType } from '@/store/experienceStore';

export interface ObserverJourneyMilestone {
  id: string; // e.g. 'ACT_I_IGNITION', 'ACT_II_COHERENCE', 'ACT_III_CRYSTALLIZATION', 'ACT_IV_DISPERSION', 'HIDDEN_DISCOVERY'
  timestamp: number;
  act: number;
  archetypeAtMoment: ObserverArchetype;
}

export interface WorldMutation {
  tint: [number, number, number]; // RGB multiplier for cosmic background
  particleExcitation: number; // 0 to 1
  gridIntensity: number; // 0 to 1
}

export interface ObserverArchive {
  signature: string;
  sessionCount: number;
  firstArrival: number;
  lastArrival: number;
  totalObservationDuration: number; // total seconds observed across sessions
  dominantArchetype: ObserverArchetype;
  accumulatedScores: { witness: number; catalyst: number; architect: number };
  milestones: ObserverJourneyMilestone[];
  worldMutationLevel: number;
  preferredEnding: HiddenEndingType | null;
  act5Unlocked: boolean;
}

export const ARCHIVE_STORAGE_KEY = 'aetheria_memory_archive';
const LEGACY_STORAGE_KEY = 'aetheria_observer_memory';
const LEGACY_EVO_KEY = 'aetheria_observer_evolution';

export function generateObserverSignature(
  firstArrival: number,
  dominantArchetype: ObserverArchetype,
  sessionCount: number,
  scores: { witness: number; catalyst: number; architect: number }
): string {
  const seed =
    ((firstArrival ^ (sessionCount * 2654435761) ^ Math.floor(scores.witness * 137 + scores.catalyst * 271 + scores.architect * 389)) >>>
      0) %
    0xffff;
  const hex = seed.toString(16).toUpperCase().padStart(4, '0');
  const archLabel = dominantArchetype.replace('THE_', '');
  return `Ψ-${hex}·${archLabel}·REV-${sessionCount}`;
}

export function computeWorldMutation(archive: ObserverArchive): WorldMutation {
  const { dominantArchetype, sessionCount } = archive;
  const mutationFactor = Math.min(1.0, (sessionCount - 1) * 0.25);

  if (dominantArchetype === 'THE_WITNESS') {
    // Deep celestial indigo hue, calming zero-jitter vacuum, reduced particle excitation
    return {
      tint: [0.92, 0.95 + 0.05 * mutationFactor, 1.0 + 0.15 * mutationFactor],
      particleExcitation: Math.max(0.2, 0.5 - 0.2 * mutationFactor),
      gridIntensity: 0.15 + 0.15 * mutationFactor,
    };
  } else if (dominantArchetype === 'THE_CATALYST') {
    // Ionized warm magenta/cyan sparks, heightened background quantum agitation
    return {
      tint: [1.0 + 0.18 * mutationFactor, 0.88, 1.0 + 0.12 * mutationFactor],
      particleExcitation: Math.min(1.0, 0.7 + 0.25 * mutationFactor),
      gridIntensity: 0.2 + 0.1 * mutationFactor,
    };
  } else if (dominantArchetype === 'THE_ARCHITECT') {
    // Golden sacred coordinate grid lines faintly illuminated in deep space
    return {
      tint: [1.0 + 0.15 * mutationFactor, 0.98 + 0.08 * mutationFactor, 0.82],
      particleExcitation: 0.5,
      gridIntensity: 0.35 + 0.35 * mutationFactor,
    };
  }

  // Default Initiate
  return {
    tint: [1.0, 1.0, 1.0],
    particleExcitation: 0.5,
    gridIntensity: 0.2,
  };
}

export function loadArchive(): ObserverArchive {
  if (typeof window === 'undefined') {
    return createDefaultArchive();
  }

  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<ObserverArchive>;
      const sessionCount = (data.sessionCount || 1) + 1;
      const dominantArchetype = data.dominantArchetype || 'THE_INITIATE';
      const scores = data.accumulatedScores || { witness: 0, catalyst: 0, architect: 0 };
      const firstArrival = data.firstArrival || Date.now();

      const archive: ObserverArchive = {
        signature: generateObserverSignature(firstArrival, dominantArchetype, sessionCount, scores),
        sessionCount,
        firstArrival,
        lastArrival: Date.now(),
        totalObservationDuration: data.totalObservationDuration || 0,
        dominantArchetype,
        accumulatedScores: scores,
        milestones: data.milestones || [],
        worldMutationLevel: Math.min(3, Math.floor(sessionCount / 2)),
        preferredEnding: data.preferredEnding || null,
        act5Unlocked: !!data.act5Unlocked,
      };

      saveArchive(archive);
      return archive;
    }

    // Attempt migration from legacy storage keys
    const legacyMemRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacyEvoRaw = localStorage.getItem(LEGACY_EVO_KEY);

    let sessionCount = 1;
    let firstArrival = Date.now();
    let dominantArchetype: ObserverArchetype = 'THE_INITIATE';
    let scores = { witness: 0, catalyst: 0, architect: 0 };
    let preferredEnding: HiddenEndingType | null = null;

    if (legacyMemRaw) {
      const mem = JSON.parse(legacyMemRaw);
      sessionCount = (mem.visits || 1) + 1;
      firstArrival = mem.firstVisit || Date.now();
    }
    if (legacyEvoRaw) {
      const evo = JSON.parse(legacyEvoRaw);
      if (evo.archetype) dominantArchetype = evo.archetype;
      if (evo.scores) scores = evo.scores;
      if (evo.hiddenEnding) preferredEnding = evo.hiddenEnding;
    }

    const newArchive: ObserverArchive = {
      signature: generateObserverSignature(firstArrival, dominantArchetype, sessionCount, scores),
      sessionCount,
      firstArrival,
      lastArrival: Date.now(),
      totalObservationDuration: 0,
      dominantArchetype,
      accumulatedScores: scores,
      milestones: [],
      worldMutationLevel: Math.min(3, Math.floor(sessionCount / 2)),
      preferredEnding,
      act5Unlocked: false,
    };

    saveArchive(newArchive);
    return newArchive;
  } catch {
    return createDefaultArchive();
  }
}

export function saveArchive(archive: ObserverArchive): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
  } catch {
    // Fail silently if localStorage disabled
  }
}

function createDefaultArchive(): ObserverArchive {
  const now = Date.now();
  return {
    signature: 'Ψ-0001·INITIATE·REV-1',
    sessionCount: 1,
    firstArrival: now,
    lastArrival: now,
    totalObservationDuration: 0,
    dominantArchetype: 'THE_INITIATE',
    accumulatedScores: { witness: 0, catalyst: 0, architect: 0 },
    milestones: [],
    worldMutationLevel: 0,
    preferredEnding: null,
    act5Unlocked: false,
  };
}
