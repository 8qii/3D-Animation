'use client';

import React from 'react';
import { useExperienceStore } from '@/store/experienceStore';

export function CinematicTextReveal() {
  const transitionProgress = useExperienceStore((state) => state.transitionProgress);
  const transitionState = useExperienceStore((state) => state.transitionState);
  const isMuted = useExperienceStore((state) => state.isMuted);
  const toggleMute = useExperienceStore((state) => state.toggleMute);

  // Compute opacities based on transition progress [0..1]
  const act1Opacity = Math.max(0, 1 - transitionProgress * 3.5);
  const act2Opacity = Math.min(1, Math.max(0, (transitionProgress - 0.15) / 0.7));
  const isIgnited = transitionProgress >= 0.65;

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
              isIgnited
                ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8] opacity-75'
            }`}
          />
          <h1 className="font-mono text-[11px] font-normal tracking-[0.32em] text-slate-400/80 uppercase">
            AETHERIA // OBSERVATORY 0.1
          </h1>
        </div>

        {/* Dynamic Transition State Badge */}
        <div
          className="mt-2 pl-5 transition-opacity duration-500"
          style={{ opacity: transitionProgress > 0.05 ? 0.9 : 0.4 }}
        >
          <span className="font-mono text-[9px] tracking-[0.3em] text-slate-500 uppercase">
            STATE: <span className={isIgnited ? 'text-amber-400/90' : 'text-cyan-400/80'}>{transitionState}</span>
          </span>
        </div>
      </header>

      {/* Bottom Center: Act I Prompt (Dissolves as observer scrolls) */}
      <footer
        className="fixed bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-700"
        style={{
          opacity: act1Opacity,
          transform: `translateY(${transitionProgress * 20}px)`,
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
          transform: `translateY(${(1 - act2Opacity) * 30}px) scale(${0.96 + act2Opacity * 0.04})`,
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-950/20 backdrop-blur-sm">
            <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="font-mono text-[9px] tracking-[0.35em] text-amber-300/90 uppercase">
              ACT II // THE SINGULARITY
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extralight tracking-[0.25em] text-slate-100 uppercase">
            The Point of <span className="font-light text-amber-200 drop-shadow-[0_0_24px_rgba(245,158,11,0.4)]">Intent</span>
          </h2>

          <p className="max-w-md font-sans text-xs md:text-sm font-light leading-relaxed tracking-[0.15em] text-slate-400/80">
            In the silence of the unmeasured, light resolves into geometric coherence.
          </p>

          {/* Telemetry coordinate readout */}
          <div className="pt-2 font-mono text-[9px] tracking-[0.35em] text-slate-500/80 uppercase">
            COORDINATE LOCK: [ 0.000, 0.000, 0.000 ] // CHARGE: {Math.round(transitionProgress * 100)}%
          </div>
        </div>
      </div>
    </>
  );
}
