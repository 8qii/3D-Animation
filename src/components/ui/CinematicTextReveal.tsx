'use client';

import React from 'react';
import { useExperienceStore } from '@/store/experienceStore';

export function CinematicTextReveal() {
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const transitionState = useExperienceStore((state) => state.transitionState);
  const act2Progress = useExperienceStore((state) => state.act2Progress);
  const act2Phase = useExperienceStore((state) => state.act2Phase);
  const act3Progress = useExperienceStore((state) => state.act3Progress);
  const materialLockProgress = useExperienceStore((state) => state.materialLockProgress);
  const tensionProgress = useExperienceStore((state) => state.tensionProgress);
  const mouseWorld = useExperienceStore((state) => state.mouseWorld);
  const isMuted = useExperienceStore((state) => state.isMuted);
  const toggleMute = useExperienceStore((state) => state.toggleMute);

  // Compute opacities based on narrative progression
  const totalPresence = Math.max(transitionProgress, act2Progress, act3Progress);
  const act1Opacity = Math.max(0, 1 - totalPresence * 3.5);

  const isAct3 = materialLockProgress >= 0.40 || act3Progress > 0.08;
  const act2Opacity = !isAct3 ? Math.min(1, Math.max(0, (totalPresence - 0.12) / 0.65)) : Math.max(0, 1 - materialLockProgress * 2.5);
  const act3Opacity = Math.min(1, Math.max(0, (materialLockProgress - 0.20) / 0.70));

  const isIgnited = transitionProgress >= 0.65 || act2Progress >= 0.20;

  // Formatting phase badge text
  let phaseLabel = 'QUANTUM VACUUM';
  if (tensionProgress > 0.15) {
    phaseLabel = `INTERNAL TENSION: ${(tensionProgress * 100).toFixed(0)}%`;
  } else if (isAct3) {
    phaseLabel = 'ACT III: MONOLITH CRYSTALLIZATION';
  } else if (act2Phase === 'SPARK_IGNITION') {
    phaseLabel = 'PHASE 1: SPARK IGNITION';
  } else if (act2Phase === 'COORDINATE_GENESIS') {
    phaseLabel = 'PHASE 2: COORDINATE GENESIS';
  } else if (act2Phase === 'GEOMETRY_STABILIZATION') {
    phaseLabel = 'PHASE 3: GEOMETRY STABILIZATION';
  } else if (transitionProgress > 0.1) {
    phaseLabel = transitionState;
  }

  // Format 3D world coordinates for telemetry
  const coordX = (mouseWorld[0] * 0.1).toFixed(3);
  const coordY = (mouseWorld[1] * 0.1).toFixed(3);
  const coordZ = (mouseWorld[2] * 0.1).toFixed(3);
  const coherencePercent = Math.min(100, Math.round(act2Progress * 100));

  return (
    <>
      {/* Top Right: Sound Experience Toggle (Web Audio API) */}
      <div className="fixed top-8 right-8 md:top-12 md:right-12 z-30 pointer-events-auto">
        <button
          onClick={toggleMute}
          className="group flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/60 active:scale-95"
          aria-label={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              isMuted ? 'bg-slate-500' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse'
            }`}
          />
          <span className="font-mono text-[10px] tracking-[0.25em] text-slate-300 uppercase select-none">
            {isMuted ? 'SOUND: OFF' : 'SOUND: ON'}
          </span>
        </button>
      </div>

      {/* Top Left: Observatory Header & Quantum State Telemetry */}
      <header className="fixed top-8 left-8 md:top-12 md:left-12 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${
              isAct3
                ? 'bg-amber-300 shadow-[0_0_16px_#fbbf24]'
                : isIgnited
                ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8] opacity-75'
            }`}
          />
          <h1 className="font-mono text-[11px] font-normal tracking-[0.32em] text-slate-400/80 uppercase">
            {isAct3
              ? 'AETHERIA // OBSERVATORY 0.3'
              : act2Progress > 0.5
              ? 'AETHERIA // OBSERVATORY 0.2'
              : 'AETHERIA // OBSERVATORY 0.1'}
          </h1>
        </div>

        {/* Dynamic Transition State Badge */}
        <div
          className="mt-2 pl-5 transition-opacity duration-500"
          style={{ opacity: totalPresence > 0.05 ? 0.9 : 0.4 }}
        >
          <span className="font-mono text-[9px] tracking-[0.3em] text-slate-500 uppercase">
            STATE: <span className={isAct3 ? 'text-amber-300 font-medium' : isIgnited ? 'text-amber-400/90' : 'text-cyan-400/80'}>{phaseLabel}</span>
          </span>
        </div>
      </header>

      {/* Bottom Center: Act I Prompt (Dissolves as observer scrolls) */}
      <footer
        className="fixed bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-700"
        style={{
          opacity: act1Opacity,
          transform: `translateY(${totalPresence * 20}px)`,
        }}
      >
        <div className="flex flex-col items-center space-y-3">
          <p className="font-mono text-[10px] md:text-[11px] font-light tracking-[0.38em] text-slate-400/70 uppercase transition-opacity duration-1000 animate-pulse [animation-duration:4s]">
            TOUCH THE VOID // INITIATE SCROLL
          </p>
          <div className="w-[1px] h-6 bg-gradient-to-b from-cyan-400/40 to-transparent" />
        </div>
      </footer>

      {/* Center Cinematic Reveal: Act II Singularity Emergence */}
      <div
        className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none text-center px-6 transition-all duration-1000"
        style={{
          opacity: act2Opacity,
          transform: `translateY(${(1 - act2Opacity) * 24}px) scale(${0.96 + act2Opacity * 0.04})`,
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-950/20 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="font-mono text-[9px] tracking-[0.35em] text-amber-300/90 uppercase">
              ACT II // THE SINGULARITY
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extralight tracking-[0.25em] text-slate-100 uppercase">
            The Point of <span className="font-light text-amber-200 drop-shadow-[0_0_24px_rgba(245,158,11,0.4)]">Intent</span>
          </h2>

          <p className="max-w-md font-sans text-xs md:text-sm font-light leading-relaxed tracking-[0.15em] text-slate-400/80">
            {act2Phase === 'GEOMETRY_STABILIZATION'
              ? 'Particles coalesce into Keplerian orbital symmetry. Structure awakens.'
              : act2Phase === 'COORDINATE_GENESIS'
              ? 'Cartesian vectors define the horizon. Dimension emerges from zero.'
              : 'In the silence of the unmeasured, light resolves into geometric coherence.'}
          </p>

          {/* Telemetry coordinate readout & coherence */}
          <div className="pt-2 flex flex-col items-center space-y-1 font-mono text-[9px] tracking-[0.35em] text-slate-500/80 uppercase">
            <div>COORDINATES: [ {coordX}, {coordY}, {coordZ} ]</div>
            <div className="text-amber-400/80">
              GEOMETRIC COHERENCE: {coherencePercent}% // LOCK: STABLE
            </div>
          </div>
        </div>
      </div>

      {/* Center Cinematic Reveal: Act III The Monolith */}
      <div
        className="fixed inset-0 z-25 flex flex-col items-center justify-end pb-24 md:pb-32 pointer-events-none select-none text-center px-6 transition-all duration-1000"
        style={{
          opacity: act3Opacity,
          transform: `translateY(${(1 - act3Opacity) * 20}px)`,
        }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-3.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-slate-950/70 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                tensionProgress > 0.35 ? 'bg-amber-300 shadow-[0_0_12px_#fde047]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
              } animate-pulse`}
            />
            <span className="font-mono text-[10px] tracking-[0.35em] text-amber-300 uppercase font-medium">
              {tensionProgress > 0.45 ? 'ACT III // MONOLITH TENSION' : 'ACT III // THE MONOLITH'}
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-extralight tracking-[0.22em] text-slate-100 uppercase italic">
            &ldquo;Structure is the cage that gives energy its name.&rdquo;
          </h2>

          <p className="max-w-lg font-sans text-xs md:text-sm font-light leading-relaxed tracking-[0.18em] text-slate-400/90">
            {tensionProgress > 0.45
              ? 'Internal energy approaches critical threshold. Fracture planes awaken along golden-ratio symmetry.'
              : 'Twenty golden ratio facets resolve the quantum flux into eternal obsidian glass.'}
          </p>

          <div className="pt-2 font-mono text-[9px] tracking-[0.32em] text-amber-400/80 uppercase">
            {tensionProgress > 0.15
              ? `PHASE: INTERNAL TENSION // STRESS COEFFICIENT: ${(tensionProgress * 100).toFixed(0)}% // FRACTURE PLANES: GOLDEN RATIO DETECTED`
              : 'PHASE: ORDER // GEOMETRIC SYMMETRY: 1.618 // STATUS: MONOLITH STABILIZED'}
          </div>
        </div>
      </div>
    </>
  );
}
