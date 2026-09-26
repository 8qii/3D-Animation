'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DebugPanel } from '@/components/ui/DebugPanel';

// Dynamic client import with SSR disabled for pure WebGL lifecycle
const Experience = dynamic(
  () => import('@/components/canvas/Experience').then((mod) => mod.Experience),
  { ssr: false }
);

export default function Home() {
  // Initialize Lenis smooth scroll
  useScrollProgress();

  return (
    <main className="relative min-h-[200vh] bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Cinematic Fullscreen Loader */}
      <LoadingScreen />

      {/* Development Preview Mode, FPS & Debug Panel */}
      <DebugPanel />

      {/* Fixed Fullscreen Three.js WebGL Canvas (Act I: The Void) */}
      <Experience />

      {/* Minimal HUD: Top Left */}
      <header className="fixed top-8 left-8 md:top-12 md:left-12 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-3.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] opacity-75" />
          <h1 className="font-mono text-[11px] font-normal tracking-[0.32em] text-slate-400/80 uppercase">
            AETHERIA // OBSERVATORY 0.1
          </h1>
        </div>
      </header>

      {/* Minimal HUD: Bottom Center */}
      <footer className="fixed bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="flex flex-col items-center space-y-3">
          <p className="font-mono text-[10px] md:text-[11px] font-light tracking-[0.38em] text-slate-400/70 uppercase transition-opacity duration-1000 animate-pulse [animation-duration:4s]">
            TOUCH THE VOID // INITIATE SCROLL
          </p>
          <div className="w-[1px] h-6 bg-gradient-to-b from-cyan-400/40 to-transparent" />
        </div>
      </footer>
    </main>
  );
}
