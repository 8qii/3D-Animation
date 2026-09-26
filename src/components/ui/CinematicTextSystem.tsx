'use client';

import React, { useMemo } from 'react';
import { useExperienceStore } from '@/store/experienceStore';

interface TypewriterTextProps {
  text: string;
  className?: string;
  glowColor?: 'cyan' | 'amber' | 'gold';
  depthFactor?: number;
}

function TypewriterText({ text, className = '', glowColor = 'cyan', depthFactor = 1 }: TypewriterTextProps) {
  const characters = useMemo(() => text.split(''), [text]);

  const glowStyles = {
    cyan: 'text-cyan-200 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)] [text-shadow:0_1px_2px_rgba(2,132,199,0.9),0_0_24px_rgba(56,189,248,0.5)]',
    amber: 'text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] [text-shadow:0_1px_2px_rgba(217,119,6,0.9),0_0_24px_rgba(251,191,36,0.5)]',
    gold: 'text-yellow-100 drop-shadow-[0_0_16px_rgba(253,224,71,0.95)] [text-shadow:0_1px_3px_rgba(202,138,4,0.9),0_0_30px_rgba(250,204,21,0.7)]',
  }[glowColor];

  return (
    <div
      className={`relative inline-flex flex-wrap items-center justify-center font-mono select-none [transform-style:preserve-3d] ${className}`}
      style={{
        transform: `translateZ(${depthFactor * 8}px)`,
      }}
    >
      {characters.map((char, index) => (
        <span
          key={`${text}-${index}`}
          className={`inline-block transition-all duration-700 animate-[letterFadeIn_0.7s_cubic-bezier(0.16,1,0.3,1)_both] ${glowStyles}`}
          style={{
            animationDelay: `${index * 38}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transform: `translateZ(${Math.sin(index * 0.4) * 4}px)`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}

export function CinematicTextSystem() {
  const observerState = useExperienceStore((state) => state.observerState);
  const observerProximity = useExperienceStore((state) => state.observerProximity);
  const observerStillnessScore = useExperienceStore((state) => state.observerStillnessScore);
  const observerHoverDuration = useExperienceStore((state) => state.observerHoverDuration);
  const attentionLevel = useExperienceStore((state) => state.attentionLevel);
  const hiddenDiscoveryActive = useExperienceStore((state) => state.hiddenDiscoveryActive);
  const isReturningObserver = useExperienceStore((state) => state.isReturningObserver);

  // Determine active narrative line and conscious theme
  const narrative = useMemo(() => {
    if (hiddenDiscoveryActive) {
      return {
        title: 'THE INNER SANCTUM IS UNLOCKED',
        subtitle: 'Sacred lattice memory yields its deepest golden-ratio harmonic truth.',
        status: 'HIDDEN MEMORY REVEAL',
        color: 'gold' as const,
        borderColor: 'border-yellow-400/80 shadow-[0_0_35px_rgba(234,179,8,0.4)]',
        badgeBg: 'bg-yellow-950/75',
        dotColor: 'bg-yellow-300 shadow-[0_0_14px_#fde047]',
      };
    }

    switch (observerState) {
      case 'GENESIS_RESPONSE_ACTIVE':
        return {
          title: 'ENERGY AWAITS INTENTION',
          subtitle: 'The quantum threshold responds to pure observer consciousness.',
          status: 'AWARENESS LINK ESTABLISHED',
          color: 'gold' as const,
          borderColor: 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.25)]',
          badgeBg: 'bg-yellow-950/60',
          dotColor: 'bg-yellow-300 shadow-[0_0_12px_#fde047]',
        };
      case 'OBSERVER_SYNCHRONIZED':
        return {
          title: 'THE STRUCTURE REMEMBERS',
          subtitle: 'Sacred fault planes attune to the observer’s stillness.',
          status: 'THE STRUCTURE HAS RECOGNIZED YOU',
          color: 'amber' as const,
          borderColor: 'border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
          badgeBg: 'bg-amber-950/50',
          dotColor: 'bg-amber-300 shadow-[0_0_10px_#f59e0b]',
        };
      case 'OBSERVER_DETECTED':
        return {
          title: 'CONSCIOUSNESS DETECTED',
          subtitle: 'Consciousness penetrates the crystalline boundary.',
          status: 'THE OBSERVER HAS ARRIVED',
          color: 'cyan' as const,
          borderColor: 'border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]',
          badgeBg: 'bg-cyan-950/50',
          dotColor: 'bg-cyan-300 shadow-[0_0_10px_#38bdf8]',
        };
      default:
        return null;
    }
  }, [observerState, hiddenDiscoveryActive]);

  if (!narrative) return null;

  const proximityPercent = Math.round(observerProximity * 100);
  const stillnessPercent = Math.round(observerStillnessScore * 100);
  const hoverSeconds = observerHoverDuration.toFixed(1);

  return (
    <div className="fixed inset-x-0 bottom-6 md:bottom-10 z-20 flex flex-col items-center pointer-events-none select-none px-4 [perspective:1200px]">
      {/* Returning Visitor Holographic Greeting Tag */}
      {isReturningObserver && (
        <div className="mb-2 px-3 py-0.5 rounded-full border border-cyan-400/30 bg-slate-950/60 backdrop-blur-md animate-[letterFadeIn_0.8s_ease-out_both]">
          <span className="font-mono text-[8px] md:text-[9px] tracking-[0.35em] text-cyan-300 uppercase font-light">
            WELCOME BACK, OBSERVER
          </span>
        </div>
      )}

      {/* 3D Holographic Conscious Recognition HUD Bar */}
      <div
        className={`relative flex items-center space-x-3.5 md:space-x-5 px-4 md:px-6 py-1.5 md:py-2 rounded-full border backdrop-blur-lg transition-all duration-700 [transform-style:preserve-3d] ${narrative.borderColor} ${narrative.badgeBg}`}
        style={{
          transform: `translateZ(12px) rotateX(${Math.max(-4, Math.min(4, (0.5 - attentionLevel) * 8))}deg)`,
        }}
      >
        {/* Holographic Scanline Grid Overlay */}
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-45 pointer-events-none" />

        {/* Volumetric Radial Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-md pointer-events-none" />

        <div className="flex items-center space-x-2.5 relative z-10">
          <span className={`w-2 h-2 rounded-full animate-ping [animation-duration:2.2s] ${narrative.dotColor}`} />
          <span className="font-mono text-[9px] md:text-[10.5px] tracking-[0.3em] font-semibold uppercase text-slate-100">
            {narrative.status}
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 md:space-x-4 text-[8.5px] md:text-[9.5px] font-mono tracking-[0.22em] text-slate-300/80 relative z-10 border-l border-slate-700/60 pl-3 md:pl-4">
          <span>PROXIMITY: <strong className="text-cyan-300 font-medium">{proximityPercent}%</strong></span>
          <span>STILLNESS: <strong className="text-amber-300 font-medium">{stillnessPercent}%</strong></span>
          <span>SYNC: <strong className="text-emerald-300 font-medium">{hoverSeconds}s</strong></span>
          <span>ATTENTION: <strong className="text-white font-medium">{(attentionLevel * 100).toFixed(0)}%</strong></span>
        </div>
      </div>

      {/* 3D Holographic Conscious Typography Emergence */}
      <div
        className="mt-3 flex flex-col items-center text-center max-w-xl transition-all duration-700 [transform-style:preserve-3d]"
        style={{
          filter: `blur(${Math.max(0, (1.0 - attentionLevel) * 1.5)}px)`,
        }}
      >
        <TypewriterText
          key={narrative.title}
          text={narrative.title}
          glowColor={narrative.color}
          className="text-xs md:text-sm tracking-[0.34em] font-light uppercase"
          depthFactor={1.5}
        />
        <p className="mt-1 font-sans text-[10px] md:text-xs tracking-[0.18em] text-slate-300/80 font-light max-w-md">
          {narrative.subtitle}
        </p>
      </div>
    </div>
  );
}
