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

  useEffect(() => {
    // Only initialize on client
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel,
    });

    lenisRef.current = lenis;

    const handleScroll = (e: { progress: number; scroll: number }) => {
      const p = e.progress ?? 0;
      setProgress(p);
      if (syncWithStore) {
        setScrollProgress(p);
      }
    };

    lenis.on('scroll', handleScroll);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [smoothWheel, syncWithStore, setScrollProgress]);

  const scrollTo = useCallback((target: number | string | HTMLElement, scrollOptions?: { duration?: number }) => {
    lenisRef.current?.scrollTo(target, scrollOptions);
  }, []);

  const getLenis = useCallback(() => {
    return lenisRef.current;
  }, []);

  return {
    progress,
    scrollTo,
    getLenis,
  };
}
