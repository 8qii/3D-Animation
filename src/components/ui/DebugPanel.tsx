'use client';

import { useEffect, useState } from 'react';
import { useExperienceStore } from '@/store/experienceStore';

export function DebugPanel() {
  const isPreviewMode = useExperienceStore((state) => state.isPreviewMode);
  const previewTime = useExperienceStore((state) => state.previewTime);
  const togglePreviewMode = useExperienceStore((state) => state.togglePreviewMode);

  const isDebugMode = useExperienceStore((state) => state.isDebugMode);
  const setDebugMode = useExperienceStore((state) => state.setDebugMode);
  const fps = useExperienceStore((state) => state.fps);

  const bloomIntensity = useExperienceStore((state) => state.bloomIntensity);
  const setBloomIntensity = useExperienceStore((state) => state.setBloomIntensity);

  const dofEnabled = useExperienceStore((state) => state.dofEnabled);
  const setDofEnabled = useExperienceStore((state) => state.setDofEnabled);

  const particleSpeedMultiplier = useExperienceStore(
    (state) => state.particleSpeedMultiplier
  );
  const setParticleSpeedMultiplier = useExperienceStore(
    (state) => state.setParticleSpeedMultiplier
  );

  const attentionLevel = useExperienceStore((state) => state.attentionLevel);
  const scrollEnergy = useExperienceStore((state) => state.scrollEnergy);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // 1. Detect ?debug=true in URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === 'true') {
        setDebugMode(true);
      }
    }
  }, [setDebugMode]);

  // 2. Global keyboard shortcut 'P' to toggle cinematic preview mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePreviewMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePreviewMode]);

  // FPS Counter: Hidden in production unless ?debug=true is passed
  const showFpsCounter = isDevelopment || isDebugMode;

  return (
    <>
      {/* FPS Counter (Hidden in production unless ?debug=true) */}
      {showFpsCounter && (
        <aside
          aria-label="Engine Performance"
          className="fixed top-8 right-8 md:top-12 md:right-12 z-40 pointer-events-none select-none"
        >
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-slate-800/80 bg-slate-950/60 backdrop-blur-md shadow-lg shadow-black/40">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                fps >= 55
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : fps >= 30
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            <span className="font-mono text-[10px] tracking-wider text-slate-300 font-medium tabular-nums">
              {fps} FPS
            </span>
            <span className="font-mono text-[9px] text-slate-500 tabular-nums">
              {(1000 / Math.max(1, fps)).toFixed(1)}ms
            </span>
          </div>
        </aside>
      )}

      {/* Cinematic Preview Mode Active Banner */}
      {isPreviewMode && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none animate-in fade-in duration-500">
          <div className="flex items-center space-x-3 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-slate-950/80 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] text-cyan-300 uppercase font-medium">
              CINEMATIC PREVIEW
            </span>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
              {previewTime.toFixed(1).padStart(4, '0')}s / 40.0s
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              PRESS P TO EXIT
            </span>
          </div>
          {/* Thin progress scrub bar */}
          <div className="w-56 h-[2px] bg-slate-800/80 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-75 shadow-[0_0_6px_#38bdf8]"
              style={{ width: `${(previewTime / 30.0) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Debug Control Panel (Available ONLY when ?debug=true) */}
      {isDebugMode && (
        <section
          aria-label="Engine Debug Console"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col font-mono text-xs select-none pointer-events-auto"
        >
          <div className="w-72 rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden text-slate-300">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-sm bg-purple-400" />
                <span className="text-[11px] font-semibold tracking-wider text-slate-200 uppercase">
                  DEBUG CONSOLE
                </span>
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                {isCollapsed ? '[EXPAND]' : '[COLLAPSE]'}
              </button>
            </div>

            {/* Panel Body */}
            {!isCollapsed && (
              <div className="p-3.5 space-y-3.5">
                {/* 30s Sequence Trigger */}
                <div>
                  <button
                    onClick={togglePreviewMode}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isPreviewMode
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                    }`}
                  >
                    <span>{isPreviewMode ? 'STOP PREVIEW [P]' : 'START 30S PREVIEW [P]'}</span>
                  </button>
                </div>

                {/* Observer Interaction Telemetry */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>OBSERVER ATTENTION</span>
                    <span className="text-cyan-400 tabular-nums">
                      {(attentionLevel * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{ width: `${attentionLevel * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span>SCROLL KINETIC ENERGY</span>
                    <span className="text-amber-400 tabular-nums">
                      {(scrollEnergy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100"
                      style={{ width: `${scrollEnergy * 100}%` }}
                    />
                  </div>
                </div>

                {/* Postprocessing: Bloom Slider */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>BLOOM INTENSITY</span>
                    <span className="text-cyan-400 tabular-nums">{bloomIntensity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.05"
                    value={bloomIntensity}
                    onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Particle Speed Multiplier */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>PARTICLE SPEED</span>
                    <span className="text-purple-400 tabular-nums">
                      {particleSpeedMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={particleSpeedMultiplier}
                    onChange={(e) => setParticleSpeedMultiplier(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>

                {/* Depth of Field Toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400">DEPTH OF FIELD</span>
                  <button
                    onClick={() => setDofEnabled(!dofEnabled)}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                      dofEnabled
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {dofEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Mode status */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
                  <span>CAMERA CHOREOGRAPHY</span>
                  <span className="text-slate-400 font-medium">
                    {isPreviewMode ? '30S FLIGHT' : '0.05HZ DRIFT'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
