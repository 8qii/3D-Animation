'use client';

import React from 'react';
import { useExperienceStore } from '@/store/experienceStore';
import { CinematicTextSystem } from './CinematicTextSystem';
import { DebugOverlay } from './DebugOverlay';

export function CinematicTextReveal() {
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const act2Progress = useExperienceStore((state) => state.act2Progress);
  const act2Phase = useExperienceStore((state) => state.act2Phase);
  const act3Progress = useExperienceStore((state) => state.act3Progress);
  const materialLockProgress = useExperienceStore((state) => state.materialLockProgress);
  const tensionProgress = useExperienceStore((state) => state.tensionProgress);
  const monolithPhase = useExperienceStore((state) => state.monolithPhase);
  const fractureProgress = useExperienceStore((state) => state.fractureProgress);
  const facetMemoryProgress = useExperienceStore((state) => state.facetMemoryProgress);
  const collapseProgress = useExperienceStore((state) => state.collapseProgress);
  const singularityThresholdProgress = useExperienceStore((state) => state.singularityThresholdProgress);
  const isMuted = useExperienceStore((state) => state.isMuted);
  const toggleMute = useExperienceStore((state) => state.toggleMute);
  const ceremonyActive = useExperienceStore((state) => state.ceremonyActive);
  const ceremonyStep = useExperienceStore((state) => state.ceremonyStep);
  const recombinationPrepared = useExperienceStore((state) => state.recombinationPrepared);

  // Compute act presence for opacity gating
  const isAct4 = fractureProgress > 0.001 || collapseProgress > 0.001 || singularityThresholdProgress > 0.001;
  const totalPresence = Math.max(transitionProgress, act2Progress, act3Progress, fractureProgress, collapseProgress, singularityThresholdProgress);
  const act1Opacity = Math.max(0, 1 - totalPresence * 3.5);

  const isAct3 = (materialLockProgress >= 0.40 || act3Progress > 0.08) && !isAct4;
  const act2Opacity = !isAct3 && !isAct4 ? Math.min(1, Math.max(0, (totalPresence - 0.12) / 0.65)) : Math.max(0, 1 - materialLockProgress * 2.5);
  const act3Opacity = !isAct4 ? Math.min(1, Math.max(0, (materialLockProgress - 0.20) / 0.70)) : Math.max(0, 1 - fractureProgress * 2.5);
  const act4Opacity = Math.min(1, Math.max(fractureProgress * 2.0, collapseProgress * 2.0, singularityThresholdProgress * 2.0));

  const isIgnited = transitionProgress >= 0.65 || act2Progress >= 0.20;

  return (
    <>
      {/* ── LAYER 1: PERMANENT IDENTITY MARK (top-left) ── */}
      {/* Minimal observatory marker — always present, opacity 0.45, no box */}
      <header className="fixed top-8 left-8 md:top-12 md:left-12 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-3">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${
              isAct4
                ? 'bg-cyan-300 shadow-[0_0_10px_#38bdf8] animate-ping [animation-duration:3s]'
                : isAct3
                ? 'bg-amber-300 shadow-[0_0_8px_#fbbf24]'
                : isIgnited
                ? 'bg-amber-400/80 shadow-[0_0_6px_#f59e0b]'
                : 'bg-cyan-400/60 shadow-[0_0_5px_#38bdf8]'
            }`}
          />
          <span className="font-mono text-[10px] font-light tracking-[0.36em] text-slate-400/45 uppercase">
            AETHERIA // OBSERVATORY
          </span>
        </div>
      </header>

      {/* ── SOUND TOGGLE (top-right) — minimal dot form ── */}
      <div className="fixed top-8 right-8 md:top-12 md:right-12 z-30 pointer-events-auto">
        <button
          onClick={toggleMute}
          className="flex items-center space-x-2 transition-opacity duration-500 hover:opacity-80 active:scale-95"
          aria-label={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
              isMuted ? 'bg-slate-600/50' : 'bg-cyan-400/60 shadow-[0_0_6px_#38bdf8] animate-pulse [animation-duration:4s]'
            }`}
          />
          <span className="font-mono text-[9px] tracking-[0.28em] text-slate-500/50 uppercase select-none">
            {isMuted ? 'off' : 'on'}
          </span>
        </button>
      </div>

      {/* ── LAYER 2: ACT I PROMPT — dissolves on first scroll ── */}
      <footer
        className="fixed bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-1000"
        style={{
          opacity: act1Opacity * 0.7,
          transform: `translateY(${totalPresence * 24}px)`,
        }}
      >
        <p className="font-mono text-[9px] md:text-[10px] font-light tracking-[0.42em] text-slate-400/50 uppercase animate-pulse [animation-duration:5s]">
          TOUCH THE VOID // INITIATE SCROLL
        </p>
        <div className="mt-2 w-[1px] h-5 bg-gradient-to-b from-cyan-400/25 to-transparent" />
      </footer>

      {/* ── LAYER 2: ACT II — CINEMATIC REVEAL — no telemetry ── */}
      <div
        className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none text-center px-8 transition-all duration-1200"
        style={{
          opacity: act2Opacity,
          transform: `translateY(${(1 - act2Opacity) * 30}px) scale(${0.97 + act2Opacity * 0.03})`,
          filter: `blur(${Math.max(0, (1 - act2Opacity) * 12)}px)`,
        }}
      >
        <div className="max-w-lg mx-auto flex flex-col items-center space-y-5">
          <div className="inline-flex items-center space-x-2.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-400/40" />
            <span className="font-mono text-[8.5px] tracking-[0.45em] text-amber-300/60 uppercase">
              ACT II // THE SINGULARITY
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>

          <h2 className="text-2xl md:text-[2.2rem] font-extralight tracking-[0.28em] text-slate-100/90 uppercase leading-tight">
            {act2Phase === 'GEOMETRY_STABILIZATION'
              ? <>Structure <span className="font-light text-amber-200/80">Awakens</span></>
              : act2Phase === 'COORDINATE_GENESIS'
              ? <>Dimension <span className="font-light text-amber-200/80">Emerges</span></>
              : <>The Point of <span className="font-light text-amber-200/80">Intent</span></>}
          </h2>

          <p className="max-w-sm font-sans text-xs font-light leading-loose tracking-[0.16em] text-slate-400/55 italic">
            {act2Phase === 'GEOMETRY_STABILIZATION'
              ? '"Particles coalesce into Keplerian orbital symmetry."'
              : act2Phase === 'COORDINATE_GENESIS'
              ? '"Cartesian vectors define the horizon of the possible."'
              : '"In the silence of the unmeasured, a single point decides."'}
          </p>
        </div>
      </div>

      {/* ── LAYER 2: ACT III — CINEMATIC REVEAL — no telemetry ── */}
      <div
        className="fixed inset-0 z-25 flex flex-col items-center justify-end pb-28 md:pb-36 pointer-events-none select-none text-center px-8 transition-all duration-1200"
        style={{
          opacity: act3Opacity,
          transform: `translateY(${(1 - act3Opacity) * 24}px)`,
          filter: `blur(${Math.max(0, (1 - act3Opacity) * 10)}px)`,
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
          <div className="inline-flex items-center space-x-2.5">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-amber-400/35" />
            <span
              className={`font-mono text-[8.5px] tracking-[0.42em] uppercase transition-colors duration-700 ${
                monolithPhase === 'FINAL_STILLNESS'
                  ? 'text-sky-300/60'
                  : monolithPhase === 'MEMORY_RESONANCE'
                  ? 'text-amber-200/65'
                  : tensionProgress > 0.45
                  ? 'text-amber-300/60'
                  : 'text-amber-300/55'
              }`}
            >
              {monolithPhase === 'MEMORY_RESONANCE' || monolithPhase === 'FINAL_STILLNESS'
                ? 'ACT III // HARMONIC TENSION'
                : tensionProgress > 0.45
                ? 'ACT III // MONOLITH TENSION'
                : 'ACT III // THE MONOLITH'}
            </span>
            <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-amber-400/35" />
          </div>

          <h2 className="text-xl md:text-3xl font-extralight tracking-[0.24em] text-slate-100/90 uppercase italic leading-snug">
            {monolithPhase === 'MEMORY_RESONANCE' || monolithPhase === 'FINAL_STILLNESS'
              ? <>&ldquo;Every structure contains the memory<br />of its own transformation.&rdquo;</>
              : <>&ldquo;Structure is the cage that gives<br />energy its name.&rdquo;</>}
          </h2>

          <p className="max-w-sm font-sans text-[11px] font-light leading-loose tracking-[0.14em] text-slate-400/50">
            {monolithPhase === 'FINAL_STILLNESS'
              ? 'All motion yields to absolute stillness. The structure holds its final breath.'
              : monolithPhase === 'MEMORY_RESONANCE'
              ? 'Void, singularity, and crystalline memory harmonize beneath the obsidian surface.'
              : tensionProgress > 0.45
              ? 'Internal energy approaches critical threshold. Fracture planes awaken along golden-ratio symmetry.'
              : 'Twenty golden-ratio facets resolve the quantum flux into eternal obsidian glass.'}
          </p>
        </div>
      </div>

      {/* ── LAYER 2: ACT IV — CINEMATIC REVEAL — minimal + ceremony ── */}
      <div
        className="fixed inset-0 z-25 flex flex-col items-center justify-end pb-28 md:pb-36 pointer-events-none select-none text-center px-8 transition-all duration-1200"
        style={{
          opacity: act4Opacity,
          transform: `translateY(${(1 - act4Opacity) * 24}px)`,
          filter: `blur(${Math.max(0, (1 - act4Opacity) * 10)}px)`,
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
          <div className="inline-flex items-center space-x-2.5">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-cyan-400/30" />
            <span className="font-mono text-[8.5px] tracking-[0.42em] text-cyan-300/60 uppercase">
              {recombinationPrepared
                ? 'ACT V // THE LIVING CONTINUUM'
                : ceremonyActive
                ? `CEREMONY // ${ceremonyStep.replace('_', ' ')}`
                : singularityThresholdProgress > 0.05
                ? 'ACT IV // SINGULARITY THRESHOLD'
                : collapseProgress > 0.05
                ? 'ACT IV // MEMORY COLLAPSE'
                : facetMemoryProgress > 0.05
                ? 'ACT IV // GEOMETRY RELEASED'
                : 'ACT IV // THE DISPERSION'}
            </span>
            <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-cyan-400/30" />
          </div>

          <h2 className="text-xl md:text-3xl font-extralight tracking-[0.24em] text-slate-100/90 uppercase italic leading-snug">
            {recombinationPrepared
              ? <>&ldquo;The universe was not recreated.<br />It was remembered differently.&rdquo;</>
              : ceremonyActive
              ? <>&ldquo;The observer does not enter a new universe.<br />The universe is reconstructed around the observer.&rdquo;</>
              : <>&ldquo;To become infinite, form must<br />surrender its perimeter.&rdquo;</>}
          </h2>

          <p className="max-w-sm font-sans text-[11px] font-light leading-loose tracking-[0.14em] text-slate-400/50">
            {recombinationPrepared
              ? 'A new cosmos crystallizes from the observer\'s memory. ACT V is complete.'
              : ceremonyActive
              ? 'Quantum codons are immortalized. The lattice breathes in unison with the observer.'
              : singularityThresholdProgress > 0.05
              ? 'Structure transcends its own geometry. The singularity awaits transformation.'
              : collapseProgress > 0.05
              ? 'All facets release into the void. Genesis prepares for dispersion.'
              : facetMemoryProgress > 0.05
              ? 'Twenty facets are suspended in memory, entangled across golden-ratio symmetry.'
              : 'Golden-ratio fault planes breach. The sacred facets detach, releasing energy into the void.'}
          </p>
        </div>
      </div>

      {/* ── LAYER 2: Observer HUD (CinematicTextSystem) — observer-gated ── */}
      <CinematicTextSystem />

      {/* ── LAYER 3: DEBUG TELEMETRY — hidden by default, toggled by D key ── */}
      <DebugOverlay />
    </>
  );
}
