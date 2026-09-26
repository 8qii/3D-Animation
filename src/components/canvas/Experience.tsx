'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { PostProcessing } from './PostProcessing';
import { ObserverController } from './ObserverController';
import { VoidScene } from '../scenes/VoidScene';
import { useExperienceStore } from '@/store/experienceStore';
import { getNormalizedPointer } from '@/utils/helpers';

interface ExperienceProps {
  className?: string;
  enablePostProcessing?: boolean;
}

export function Experience({ className = '', enablePostProcessing = true }: ExperienceProps) {
  const setPointer = useExperienceStore((state) => state.setPointer);
  const addScrollEnergy = useExperienceStore((state) => state.addScrollEnergy);
  const setAttentionLevel = useExperienceStore((state) => state.setAttentionLevel);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null);

  // Mouse move handler with normalized coordinates [-1..1]
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { innerWidth, innerHeight } = window;
      const normalized = getNormalizedPointer(e.clientX, e.clientY, innerWidth, innerHeight);
      setPointer(normalized.x, normalized.y);
    },
    [setPointer]
  );

  // Mobile Touch as Observer Input
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

        const { innerWidth, innerHeight } = window;
        const normalized = getNormalizedPointer(touch.clientX, touch.clientY, innerWidth, innerHeight);
        setPointer(normalized.x, normalized.y);

        // Immediate tactile contact sparks observer attention
        setAttentionLevel(0.65);
      }
    },
    [setPointer, setAttentionLevel]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        const normalized = getNormalizedPointer(touch.clientX, touch.clientY, innerWidth, innerHeight);
        setPointer(normalized.x, normalized.y);

        // Measure touch drag velocity to inject kinetic energy into the vacuum
        if (lastTouchPos.current) {
          const dx = touch.clientX - lastTouchPos.current.x;
          const dy = touch.clientY - lastTouchPos.current.y;
          const dragDist = Math.sqrt(dx * dx + dy * dy);
          addScrollEnergy(Math.min(0.35, dragDist * 0.008));
        }

        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [setPointer, addScrollEnergy]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchPos.current = null;
  }, []);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      THREE.Cache.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 w-full h-full pointer-events-auto bg-[#030712] ${className}`}
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [0, 0, 7],
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#030712']} />

        {/* Scene depth fog for cathedral spatial composition */}
        <fogExp2 attach="fog" args={['#030712', 0.038]} />

        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault fov={45} position={[0, 0, 7]} />
          <ObserverController />
          <Lights />
          <CameraRig />
          <VoidScene />
          {enablePostProcessing && <PostProcessing />}
        </Suspense>
      </Canvas>
    </div>
  );
}
