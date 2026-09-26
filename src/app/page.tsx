'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useTimelineController } from '@/hooks/useTimelineController';
import { useAudioTransition } from '@/hooks/useAudioTransition';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DebugPanel } from '@/components/ui/DebugPanel';
import { CinematicTextReveal } from '@/components/ui/CinematicTextReveal';

// Dynamic client import with SSR disabled for pure WebGL lifecycle
const Experience = dynamic(
  () => import('@/components/canvas/Experience').then((mod) => mod.Experience),
  { ssr: false }
);

export default function Home() {
  // Initialize Lenis smooth scroll
  useScrollProgress();

  // Initialize Scene Timeline & State Controller
  useTimelineController();

  // Initialize Web Audio API procedural synthesis & event hooks
  useAudioTransition();

  return (
    <main className="relative min-h-[300vh] bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Cinematic Fullscreen Loader */}
      <LoadingScreen />

      {/* Development Preview Mode, FPS & Debug Panel */}
      <DebugPanel />

      {/* Fixed Fullscreen Three.js WebGL Canvas (Act I: The Void & Transition Framework) */}
      <Experience />

      {/* Cinematic Typography, Audio Toggle & Telemetry HUD */}
      <CinematicTextReveal />
    </main>
  );
}
