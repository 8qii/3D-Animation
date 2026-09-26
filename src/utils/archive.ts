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

export interface MovementMemory {
  avgSpeed: number;
  smoothness: number;
  stillnessRatio: number;
  dominantIntent: 'CONTEMPLATIVE_WITNESS' | 'KINETIC_CATALYST' | 'SACRED_ARCHITECT' | 'UNFORMED';
}

export interface ObserverDna {
  code: string;
  codons: string[];
  resonanceHash: string;
  alignmentVector: [number, number, number];
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
  personalFrequency: number;
  memoryFreshness: number;
  movementMemory: MovementMemory;
  dna: ObserverDna;
  act5HandshakeCompleted: boolean;
  act5CeremonyCompleted: boolean;
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

export function generatePersonalFrequency(
  firstArrival: number,
  dominantArchetype: ObserverArchetype,
  sessionCount: number
): number {
  let baseFreq = 440.0;
  if (dominantArchetype === 'THE_WITNESS') {
    baseFreq = 432.0; // Universal Natural Tuning / Contemplation
  } else if (dominantArchetype === 'THE_CATALYST') {
    baseFreq = 528.0; // Transformation / DNA Frequency
  } else if (dominantArchetype === 'THE_ARCHITECT') {
    baseFreq = 417.0; // Undoing Situations & Facilitating Sacred Change
  }

  // Micro-offset derived deterministically from firstArrival & sessionCount
  const offsetSeed = ((firstArrival ^ (sessionCount * 1337)) >>> 0) % 1000;
  const microOffset = ((offsetSeed / 1000.0) * 8.0 - 4.0) * (1.6180339887 / 2.0);
  return Math.round((baseFreq + microOffset) * 10) / 10;
}

export function calculateMemoryFreshness(lastArrival: number, currentNow: number): number {
  const deltaMs = Math.max(0, currentNow - lastArrival);
  // Half-life of 24 hours (86,400,000 ms).
  // Retains a foundational memory floor of 0.25
  const halfLife = 86400000;
  return Math.max(0.25, Math.exp(-deltaMs / halfLife));
}

export function synthesizeObserverDna(
  firstArrival: number,
  dominantArchetype: ObserverArchetype,
  sessionCount: number,
  scores: { witness: number; catalyst: number; architect: number },
  personalFreq: number
): ObserverDna {
  const archLabel = dominantArchetype.replace('THE_', '').slice(0, 4);
  const total = Math.max(1, scores.witness + scores.catalyst + scores.architect);
  const normW = scores.witness / total;
  const normC = scores.catalyst / total;
  const normA = scores.architect / total;

  const seed = ((firstArrival ^ (sessionCount * 7919) ^ Math.floor(normW * 65535)) >>> 0) % 0xffff;
  const hex = seed.toString(16).toUpperCase().padStart(4, '0');
  const code = `Φ-${archLabel}-${hex}·REV${sessionCount}·${personalFreq.toFixed(1)}Hz`;

  const codons = [
    `VOID:${((seed * 3) % 256).toString(16).toUpperCase().padStart(2, '0')}`,
    `SING:${((seed * 7) % 256).toString(16).toUpperCase().padStart(2, '0')}`,
    `MATT:${((seed * 11) % 256).toString(16).toUpperCase().padStart(2, '0')}`,
    `DISP:${((seed * 17) % 256).toString(16).toUpperCase().padStart(2, '0')}`,
  ];

  return {
    code,
    codons,
    resonanceHash: hex,
    alignmentVector: [
      Math.round(normW * 100) / 100,
      Math.round(normC * 100) / 100,
      Math.round(normA * 100) / 100,
    ],
  };
}

export function loadArchive(): ObserverArchive {
  if (typeof window === 'undefined') {
    return createDefaultArchive();
  }

  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    const now = Date.now();
    if (raw) {
      const data = JSON.parse(raw) as Partial<ObserverArchive>;
      const sessionCount = (data.sessionCount || 1) + 1;
      const dominantArchetype = data.dominantArchetype || 'THE_INITIATE';
      const scores = data.accumulatedScores || { witness: 0, catalyst: 0, architect: 0 };
      const firstArrival = data.firstArrival || now;
      const lastArrival = data.lastArrival || now;
      const freshness = calculateMemoryFreshness(lastArrival, now);

      const personalFreq =
        data.personalFrequency ||
        generatePersonalFrequency(firstArrival, dominantArchetype, sessionCount);

      const defaultMovement: MovementMemory = {
        avgSpeed: 0.5,
        smoothness: 0.7,
        stillnessRatio: 0.5,
        dominantIntent: 'UNFORMED',
      };

      const dna =
        data.dna ||
        synthesizeObserverDna(firstArrival, dominantArchetype, sessionCount, scores, personalFreq);

      const archive: ObserverArchive = {
        signature: generateObserverSignature(firstArrival, dominantArchetype, sessionCount, scores),
        sessionCount,
        firstArrival,
        lastArrival: now,
        totalObservationDuration: data.totalObservationDuration || 0,
        dominantArchetype,
        accumulatedScores: scores,
        milestones: data.milestones || [],
        worldMutationLevel: Math.min(3, Math.floor(sessionCount / 2)),
        preferredEnding: data.preferredEnding || null,
        act5Unlocked: !!data.act5Unlocked,
        personalFrequency: personalFreq,
        memoryFreshness: freshness,
        movementMemory: data.movementMemory || defaultMovement,
        dna,
        act5HandshakeCompleted: !!data.act5HandshakeCompleted,
        act5CeremonyCompleted: !!data.act5CeremonyCompleted,
      };

      saveArchive(archive);
      return archive;
    }

    // Attempt migration from legacy storage keys
    const legacyMemRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacyEvoRaw = localStorage.getItem(LEGACY_EVO_KEY);

    let sessionCount = 1;
    let firstArrival = now;
    let dominantArchetype: ObserverArchetype = 'THE_INITIATE';
    let scores = { witness: 0, catalyst: 0, architect: 0 };
    let preferredEnding: HiddenEndingType | null = null;

    if (legacyMemRaw) {
      const mem = JSON.parse(legacyMemRaw);
      sessionCount = (mem.visits || 1) + 1;
      firstArrival = mem.firstVisit || now;
    }
    if (legacyEvoRaw) {
      const evo = JSON.parse(legacyEvoRaw);
      if (evo.archetype) dominantArchetype = evo.archetype;
      if (evo.scores) scores = evo.scores;
      if (evo.hiddenEnding) preferredEnding = evo.hiddenEnding;
    }

    const personalFreq = generatePersonalFrequency(firstArrival, dominantArchetype, sessionCount);
    const dna = synthesizeObserverDna(firstArrival, dominantArchetype, sessionCount, scores, personalFreq);

    const newArchive: ObserverArchive = {
      signature: generateObserverSignature(firstArrival, dominantArchetype, sessionCount, scores),
      sessionCount,
      firstArrival,
      lastArrival: now,
      totalObservationDuration: 0,
      dominantArchetype,
      accumulatedScores: scores,
      milestones: [],
      worldMutationLevel: Math.min(3, Math.floor(sessionCount / 2)),
      preferredEnding,
      act5Unlocked: false,
      personalFrequency: personalFreq,
      memoryFreshness: 1.0,
      movementMemory: {
        avgSpeed: 0.5,
        smoothness: 0.7,
        stillnessRatio: 0.5,
        dominantIntent: 'UNFORMED',
      },
      dna,
      act5HandshakeCompleted: false,
      act5CeremonyCompleted: false,
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
  const scores = { witness: 0, catalyst: 0, architect: 0 };
  const dna = synthesizeObserverDna(now, 'THE_INITIATE', 1, scores, 440.0);
  return {
    signature: 'Ψ-0001·INITIATE·REV-1',
    sessionCount: 1,
    firstArrival: now,
    lastArrival: now,
    totalObservationDuration: 0,
    dominantArchetype: 'THE_INITIATE',
    accumulatedScores: scores,
    milestones: [],
    worldMutationLevel: 0,
    preferredEnding: null,
    act5Unlocked: false,
    personalFrequency: 440.0,
    memoryFreshness: 1.0,
    movementMemory: {
      avgSpeed: 0.5,
      smoothness: 0.7,
      stillnessRatio: 0.5,
      dominantIntent: 'UNFORMED',
    },
    dna,
    act5HandshakeCompleted: false,
    act5CeremonyCompleted: false,
  };
}
