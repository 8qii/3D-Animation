'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { useExperienceStore } from '@/store/experienceStore';

interface UseScrollProgressOptions {
  smoothWheel?: boolean;
  syncWithStore?: boolean;
}

export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const { smoothWheel = true, syncWithStore = true } = options;
  const [progress, setProgress] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const setScrollProgress = useExperienceStore((state) => state.setScrollProgress);
  const addScrollEnergy = useExperienceStore((state) => state.addScrollEnergy);

  useEffect(() => {
    // Only initialize on client
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel,
    });

    lenisRef.current = lenis;

    const handleScroll = (e: { progress: number; scroll: number; velocity?: number }) => {
      const p = e.progress ?? 0;
      setProgress(p);
      if (syncWithStore) {
        setScrollProgress(p);
        // Inject kinetic scroll energy into the quantum field
        const speed = Math.abs(e.velocity ?? 0.5);
        addScrollEnergy(Math.min(0.35, speed * 0.035 + 0.08));
      }
    };

    lenis.on('scroll', handleScroll);

    let rafId: number;
    let lastTime = performance.now();

    const raf = (time: number) => {
      lenis.raf(time);
      const delta = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Relax kinetic energy continuously back to resting vacuum
      useExperienceStore.getState().decayScrollEnergy(delta);

      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [smoothWheel, syncWithStore, setScrollProgress, addScrollEnergy]);

  const scrollTo = useCallback(
    (target: number | string | HTMLElement, scrollOptions?: { duration?: number }) => {
      lenisRef.current?.scrollTo(target, scrollOptions);
    },
    []
  );

  const getLenis = useCallback(() => {
    return lenisRef.current;
  }, []);

  return {
    progress,
    scrollTo,
    getLenis,
  };
}
