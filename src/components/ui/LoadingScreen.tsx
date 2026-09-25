'use client';

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useExperienceStore } from '@/store/experienceStore';

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const finishLoading = useExperienceStore((state) => state.finishLoading);
  const setLoadingProgress = useExperienceStore((state) => state.setLoadingProgress);

  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth number interpolation up to current progress
  useEffect(() => {
    // If progress is 0 but inactive, simulate quick smooth ready progression
    const target = active ? progress : 100;
    setLoadingProgress(target);

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const step = Math.max(1, Math.ceil((target - prev) * 0.2));
          return Math.min(target, prev + step);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [progress, active, setLoadingProgress]);

  // When progress reaches 100%, trigger cinematic fade-out
  useEffect(() => {
    if (displayProgress >= 100 && !isFadingOut) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        finishLoading();

        // Remove from DOM after transition
        setTimeout(() => {
          setIsDone(true);
        }, 1000);
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [displayProgress, isFadingOut, finishLoading]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] text-slate-100 transition-opacity duration-1000 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow atmosphere */}
      <div className="absolute w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 max-w-sm w-full px-6">
        {/* Monolith geometry icon */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border border-sky-400/40 rounded-lg rotate-45 animate-spin [animation-duration:8s]" />
          <div className="w-2.5 h-2.5 bg-sky-400 rounded-sm shadow-[0_0_12px_#38bdf8]" />
        </div>

        {/* Minimal subtitle */}
        <div className="text-center space-y-1">
          <p className="text-[10px] tracking-[0.35em] text-slate-400 uppercase font-mono">
            Cinematic Environment
          </p>
          <h2 className="text-xs font-medium tracking-[0.2em] text-slate-200 uppercase">
            Initializing WebGL Engine
          </h2>
        </div>

        {/* Percentage Counter */}
        <div className="font-mono text-3xl font-light tracking-wider text-slate-100 tabular-nums">
          {displayProgress.toString().padStart(3, '0')}
          <span className="text-sky-400 text-sm font-normal ml-1">%</span>
        </div>

        {/* Cinematic Thin Progress Line */}
        <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-150 ease-out shadow-[0_0_10px_#38bdf8]"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
