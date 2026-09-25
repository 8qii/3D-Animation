'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { PostProcessing } from './PostProcessing';
import { PlaceholderScene } from '../scenes/PlaceholderScene';
import { useExperienceStore } from '@/store/experienceStore';
import { getNormalizedPointer } from '@/utils/helpers';

interface ExperienceProps {
  className?: string;
  enablePostProcessing?: boolean;
}

export function Experience({ className = '', enablePostProcessing = true }: ExperienceProps) {
  const setPointer = useExperienceStore((state) => state.setPointer);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move handler with normalized coordinates [-1..1]
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { innerWidth, innerHeight } = window;
      const normalized = getNormalizedPointer(e.clientX, e.clientY, innerWidth, innerHeight);
      setPointer(normalized.x, normalized.y);
    },
    [setPointer]
  );

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      // Force cleanup Three.js cache if canvas unmounts
      THREE.Cache.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
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
          position: [0, 0, 6],
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#030712']} />

        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault fov={45} position={[0, 0, 6]} />
          <Lights />
          <CameraRig />
          <PlaceholderScene />
          {enablePostProcessing && <PostProcessing />}
        </Suspense>
      </Canvas>
    </div>
  );
}
