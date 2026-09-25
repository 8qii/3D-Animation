'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useSceneManager } from '@/hooks/useSceneManager';
import { useExperienceStore, SCENES } from '@/store/experienceStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Dynamic import with SSR disabled for clean WebGL lifecycle
const Experience = dynamic(
  () => import('@/components/canvas/Experience').then((mod) => mod.Experience),
  { ssr: false }
);

export default function Home() {
  // Initialize Lenis smooth scroll and synchronize with Zustand store
  const { progress, scrollTo } = useScrollProgress();
  const { activeScene, sceneIndex } = useSceneManager();
  const isMuted = useExperienceStore((state) => state.isMuted);
  const toggleMute = useExperienceStore((state) => state.toggleMute);

  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-100 font-sans">
      {/* Cinematic Fullscreen Loader */}
      <LoadingScreen />

      {/* Fixed Fullscreen Three.js WebGL Canvas */}
      <Experience />

      {/* Cinematic UI Overlay (HUD & Controls) */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-6 md:px-12 pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-[0.25em] uppercase text-slate-200">
            AETHERIA // 3D
          </span>
        </div>

        <div className="flex items-center space-x-6 pointer-events-auto">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full border border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
              R3F • 60 FPS
            </span>
          </div>

          <button
            onClick={toggleMute}
            className="font-mono text-xs text-slate-400 hover:text-slate-100 transition-colors uppercase tracking-wider px-2 py-1"
          >
            SOUND [{isMuted ? 'OFF' : 'ON'}]
          </button>
        </div>
      </header>

      {/* Scene Navigation Pagination Dots */}
      <nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end space-y-4 pointer-events-auto">
        {SCENES.map((scene, idx) => {
          const isActive = idx === sceneIndex;
          return (
            <button
              key={scene.id}
              onClick={() => {
                const targetScroll = idx * (window.innerHeight * 1.2);
                scrollTo(targetScroll);
              }}
              className="group flex items-center space-x-3 text-right focus:outline-none"
            >
              <span
                className={`font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-cyan-400 opacity-100 translate-x-0'
                    : 'text-slate-500 opacity-0 group-hover:opacity-80 translate-x-2'
                }`}
              >
                {scene.title}
              </span>
              <div
                className={`w-2 transition-all duration-300 rounded-full ${
                  isActive
                    ? 'h-6 bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                    : 'h-2 bg-slate-700 group-hover:bg-slate-500'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Scrollable Storytelling Sections */}
      <div className="relative z-10">
        {/* Section 01: Genesis */}
        <section className="min-h-[120vh] flex flex-col justify-center px-6 md:px-20 pointer-events-none">
          <div className="max-w-xl space-y-4 pointer-events-auto">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 font-mono text-[11px] tracking-[0.25em] uppercase">
              <span>SCENE 01</span>
              <span>•</span>
              <span>GENESIS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-white leading-none">
              The Core <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
                Awakening
              </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-md">
              A bespoke procedural crystal pulsating in deep space, rendered with custom GLSL shaders,
              volumetric fresnel glow, and responsive pointer physics.
            </p>
            <div className="pt-4 flex items-center space-x-3 text-xs font-mono text-slate-500">
              <span className="animate-bounce">↓</span>
              <span>SCROLL TO TRAVERSE THE TIMELINE</span>
            </div>
          </div>
        </section>

        {/* Section 02: Structure */}
        <section className="min-h-[120vh] flex flex-col justify-center items-end px-6 md:px-20 text-right pointer-events-none">
          <div className="max-w-xl space-y-4 pointer-events-auto">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-purple-500/20 bg-purple-950/20 text-purple-400 font-mono text-[11px] tracking-[0.25em] uppercase">
              <span>SCENE 02</span>
              <span>•</span>
              <span>STRUCTURE</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-tight text-white leading-none">
              Quantum <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                Dispersion
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-md ml-auto">
              Dynamic camera choreography lerping between perspective targets. Real-time post-processing
              composes depth of field, bloom, and chromatic aberration.
            </p>
          </div>
        </section>

        {/* Section 03: Ascension */}
        <section className="min-h-[120vh] flex flex-col justify-center px-6 md:px-20 pointer-events-none">
          <div className="max-w-xl space-y-4 pointer-events-auto">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-sky-500/20 bg-sky-950/20 text-sky-400 font-mono text-[11px] tracking-[0.25em] uppercase">
              <span>SCENE 03</span>
              <span>•</span>
              <span>ASCENSION</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-tight text-white leading-none">
              Infinite <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400">
                Luminescence
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-md">
              Thousands of procedural particles swirling in harmonic vortex coordinates, ready for custom
              Blender GLTF story assets and multi-stage GSAP storytelling.
            </p>
          </div>
        </section>
      </div>

      {/* Bottom Telemetry HUD */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-12 pointer-events-none text-slate-400 border-t border-slate-900/60 bg-gradient-to-t from-slate-950/80 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span className="text-slate-500 uppercase">ACTIVE SCENE:</span>
          <span className="text-cyan-400 font-medium tracking-wider">
            {activeScene.title.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="text-slate-500 uppercase">SCROLL PROGRESS:</span>
          <span className="text-slate-200 tabular-nums">
            {(progress * 100).toFixed(0).padStart(3, '0')}%
          </span>
        </div>
      </footer>
    </main>
  );
}
