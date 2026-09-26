'use client';

import { useEffect, useState } from 'react';
import { useExperienceStore } from '@/store/experienceStore';

export function DebugOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'd' ||
        e.key === 'D' ||
        (e.ctrlKey && e.shiftKey && e.key === 'D')
      ) {
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fps = useExperienceStore((state) => state.fps);
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const act2Progress = useExperienceStore((state) => state.act2Progress);
  const act3Progress = useExperienceStore((state) => state.act3Progress);
  const materialLockProgress = useExperienceStore((state) => state.materialLockProgress);
  const tensionProgress = useExperienceStore((state) => state.tensionProgress);
  const fractureProgress = useExperienceStore((state) => state.fractureProgress);
  const facetMemoryProgress = useExperienceStore((state) => state.facetMemoryProgress);
  const collapseProgress = useExperienceStore((state) => state.collapseProgress);
  const singularityThresholdProgress = useExperienceStore((state) => state.singularityThresholdProgress);
  const mouseWorld = useExperienceStore((state) => state.mouseWorld);
  const observerState = useExperienceStore((state) => state.observerState);
  const observerArchetype = useExperienceStore((state) => state.observerArchetype);
  const observerProximity = useExperienceStore((state) => state.observerProximity);
  const observerStillnessScore = useExperienceStore((state) => state.observerStillnessScore);
  const observerHoverDuration = useExperienceStore((state) => state.observerHoverDuration);
  const attentionLevel = useExperienceStore((state) => state.attentionLevel);
  const universeCoherenceScore = useExperienceStore((state) => state.universeCoherenceScore);
  const observerSignature = useExperienceStore((state) => state.observerSignature);
  const observerDna = useExperienceStore((state) => state.observerDna);
  const personalFrequency = useExperienceStore((state) => state.personalFrequency);
  const consciousState = useExperienceStore((state) => state.consciousState);
  const observerIntention = useExperienceStore((state) => state.observerIntention);
  const intentionVerified = useExperienceStore((state) => state.intentionVerified);
  const memoryReciprocityProgress = useExperienceStore((state) => state.memoryReciprocityProgress);
  const gateActivationProgress = useExperienceStore((state) => state.gateActivationProgress);
  const act5HandshakeCompleted = useExperienceStore((state) => state.act5HandshakeCompleted);
  const act5Prepared = useExperienceStore((state) => state.act5Prepared);
  const act5GateArmed = useExperienceStore((state) => state.act5GateArmed);
  const hiddenEnding = useExperienceStore((state) => state.hiddenEnding);
  const hiddenDiscoveryActive = useExperienceStore((state) => state.hiddenDiscoveryActive);
  const awakenedFacetCount = useExperienceStore((state) => state.awakenedFacetCount);
  const recognitionResonance = useExperienceStore((state) => state.recognitionResonance);
  const ceremonyActive = useExperienceStore((state) => state.ceremonyActive);
  const ceremonyStep = useExperienceStore((state) => state.ceremonyStep);
  const recombinationPrepared = useExperienceStore((state) => state.recombinationPrepared);
  const gpuTier = useExperienceStore((state) => state.gpuTier);

  const coordX = (mouseWorld[0] * 0.1).toFixed(3);
  const coordY = (mouseWorld[1] * 0.1).toFixed(3);
  const coordZ = (mouseWorld[2] * 0.1).toFixed(3);

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none">
        <span className="font-mono text-[7px] tracking-[0.22em] text-slate-600/40 uppercase">
          [D] debug
        </span>
      </div>
    );
  }

  const rows: [string, string][] = [
    ['FPS', String(fps)],
    ['GPU TIER', gpuTier],
    ['COORDINATES', `[${coordX}, ${coordY}, ${coordZ}]`],
    ['TRANSITION', (transitionProgress * 100).toFixed(1) + '%'],
    ['ACT II', (act2Progress * 100).toFixed(1) + '%'],
    ['ACT III', (act3Progress * 100).toFixed(1) + '%'],
    ['MATERIAL LOCK', (materialLockProgress * 100).toFixed(1) + '%'],
    ['TENSION', (tensionProgress * 100).toFixed(1) + '%'],
    ['FRACTURE', (fractureProgress * 100).toFixed(1) + '%'],
    ['FACET MEMORY', (facetMemoryProgress * 100).toFixed(1) + '%'],
    ['COLLAPSE', (collapseProgress * 100).toFixed(1) + '%'],
    ['SINGULARITY Δ', (singularityThresholdProgress * 100).toFixed(1) + '%'],
    ['OBSERVER STATE', observerState],
    ['ARCHETYPE', observerArchetype],
    ['PROXIMITY', (observerProximity * 100).toFixed(0) + '%'],
    ['STILLNESS', (observerStillnessScore * 100).toFixed(0) + '%'],
    ['HOVER', observerHoverDuration.toFixed(1) + 's'],
    ['ATTENTION', (attentionLevel * 100).toFixed(0) + '%'],
    ['COHERENCE', universeCoherenceScore + '%'],
    ['SIGNATURE', observerSignature || '—'],
    ['DNA CODE', observerDna?.code.slice(0, 24) || '—'],
    ['FREQUENCY', personalFrequency.toFixed(2) + ' Hz'],
    ['CONSCIOUS', consciousState],
    ['INTENTION', observerIntention],
    ['INTENTION Δ', intentionVerified ? 'VERIFIED' : 'pending'],
    ['RECIPROCITY', (memoryReciprocityProgress * 100).toFixed(0) + '%'],
    ['GATE ACT.', (gateActivationProgress * 100).toFixed(0) + '%'],
    ['ACT5 PREPARED', act5Prepared ? 'YES' : 'no'],
    ['ACT5 GATE', act5GateArmed ? 'ARMED' : 'no'],
    ['ACT5 HANDSHAKE', act5HandshakeCompleted ? 'DONE' : 'no'],
    ['HIDDEN ENDING', hiddenEnding || '—'],
    ['DISCOVERY', hiddenDiscoveryActive ? 'ACTIVE' : 'no'],
    ['AWAKE FACETS', String(awakenedFacetCount)],
    ['RECOGNITION', (recognitionResonance * 100).toFixed(0) + '%'],
    ['CEREMONY', ceremonyActive ? ceremonyStep : 'inactive'],
    ['RECOMBI. READY', recombinationPrepared ? 'YES' : 'no'],
  ];

  return (
    <div className="fixed top-0 right-0 z-50 w-72 max-h-screen overflow-y-auto pointer-events-auto select-text bg-slate-950/90 backdrop-blur-sm border-l border-b border-slate-700/60 p-3">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-700/50">
        <span className="font-mono text-[9px] tracking-[0.3em] text-cyan-400/80 uppercase font-semibold">
          AETHERIA DEBUG ∷ [D] CLOSE
        </span>
        <button
          onClick={() => setVisible(false)}
          className="font-mono text-[9px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          ✕
        </button>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-slate-800/40">
              <td className="py-[2px] pr-2 font-mono text-[7.5px] tracking-[0.18em] text-slate-500 uppercase whitespace-nowrap">
                {label}
              </td>
              <td className="py-[2px] font-mono text-[7.5px] tracking-[0.12em] text-slate-300 text-right break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
