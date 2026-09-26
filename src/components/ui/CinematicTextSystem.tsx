'use client';

import React, { useMemo } from 'react';
import { useExperienceStore } from '@/store/experienceStore';

interface TypewriterTextProps {
  text: string;
  className?: string;
  glowColor?: 'cyan' | 'amber' | 'gold';
}

function TypewriterText({ text, className = '', glowColor = 'cyan' }: TypewriterTextProps) {
  const characters = useMemo(() => text.split(''), [text]);

  const glowStyles = {
    cyan: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]',
    amber: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]',
    gold: 'text-yellow-200 drop-shadow-[0_0_14px_rgba(254,240,138,0.85)]',
  }[glowColor];

  return (
    <div className={`relative inline-flex flex-wrap items-center justify-center font-mono select-none ${className}`}>
      {characters.map((char, index) => (
        <span
          key={`${text}-${index}`}
          className={`inline-block transition-all duration-500 animate-[letterFadeIn_0.6s_cubic-bezier(0.16,1,0.3,1)_both] ${glowStyles}`}
          style={{
            animationDelay: `${index * 42}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
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

  // Determine active narrative line and theme based on observer status
  const narrative = useMemo(() => {
    switch (observerState) {
      case 'GENESIS_RESPONSE_ACTIVE':
        return {
          title: 'ENERGY AWAITS INTENTION',
          subtitle: 'The quantum threshold responds to pure observer consciousness.',
          status: 'GENESIS RESPONSE ACTIVE',
          color: 'gold' as const,
          borderColor: 'border-yellow-400/60',
          badgeBg: 'bg-yellow-950/60',
          dotColor: 'bg-yellow-300 shadow-[0_0_12px_#fde047]',
        };
      case 'OBSERVER_SYNCHRONIZED':
        return {
          title: 'THE STRUCTURE REMEMBERS',
          subtitle: 'Sacred fault planes attune to the observer’s stillness.',
          status: 'OBSERVER SYNCHRONIZED',
          color: 'amber' as const,
          borderColor: 'border-amber-400/50',
          badgeBg: 'bg-amber-950/50',
          dotColor: 'bg-amber-300 shadow-[0_0_10px_#f59e0b]',
        };
      case 'OBSERVER_DETECTED':
        return {
          title: 'THE OBSERVER HAS ARRIVED',
          subtitle: 'Consciousness penetrates the crystalline boundary.',
          status: 'OBSERVER DETECTED',
          color: 'cyan' as const,
          borderColor: 'border-cyan-400/50',
          badgeBg: 'bg-cyan-950/50',
          dotColor: 'bg-cyan-300 shadow-[0_0_10px_#38bdf8]',
        };
      default:
        return null;
    }
  }, [observerState]);

  if (!narrative) return null;

  const proximityPercent = Math.round(observerProximity * 100);
  const stillnessPercent = Math.round(observerStillnessScore * 100);
  const hoverSeconds = observerHoverDuration.toFixed(1);

  return (
    <div className="fixed inset-x-0 bottom-6 md:bottom-10 z-20 flex flex-col items-center pointer-events-none select-none px-4">
      {/* Holographic Observer Recognition HUD Bar */}
      <div
        className={`relative flex items-center space-x-4 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-2xl transition-all duration-700 ${narrative.borderColor} ${narrative.badgeBg}`}
      >
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] opacity-40 pointer-events-none" />

        <div className="flex items-center space-x-2 relative z-10">
          <span className={`w-2 h-2 rounded-full animate-ping [animation-duration:2s] ${narrative.dotColor}`} />
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] font-semibold uppercase text-slate-200">
            STATE: {narrative.status}
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[8px] md:text-[9px] font-mono tracking-[0.2em] text-slate-400/90 relative z-10 border-l border-slate-700/60 pl-3">
          <span>PROXIMITY: <strong className="text-cyan-300 font-normal">{proximityPercent}%</strong></span>
          <span>STILLNESS: <strong className="text-amber-300 font-normal">{stillnessPercent}%</strong></span>
          <span>SYNC: <strong className="text-emerald-300 font-normal">{hoverSeconds}s</strong></span>
          <span>ATTENTION: <strong className="text-slate-100 font-normal">{(attentionLevel * 100).toFixed(0)}%</strong></span>
        </div>
      </div>

      {/* Floating Holographic Narrative Line */}
      <div className="mt-3 flex flex-col items-center text-center max-w-xl transition-all duration-700">
        <TypewriterText
          key={narrative.title}
          text={narrative.title}
          glowColor={narrative.color}
          className="text-xs md:text-sm tracking-[0.32em] font-light uppercase"
        />
        <p className="mt-1 font-sans text-[10px] md:text-xs tracking-[0.16em] text-slate-400/80 font-light max-w-md">
          {narrative.subtitle}
        </p>
      </div>
    </div>
  );
}
