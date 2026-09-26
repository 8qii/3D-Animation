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
import { SingularityScene } from '../scenes/SingularityScene';
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
  const setCameraOffset = useExperienceStore((state) => state.setCameraOffset);
  const triggerTouchRipple = useExperienceStore((state) => state.triggerTouchRipple);
  const gpuTier = useExperienceStore((state) => state.gpuTier);

  // Compute adaptive device pixel ratio based on GPU tier
  const dpr: [number, number] = gpuTier === 'TIER_ULTRA' ? [1, 2] : gpuTier === 'TIER_BALANCED' ? [1, 1.5] : [1, 1];

  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerDown = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef(0);
  const touchHoldTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mouse move handler with normalized coordinates [-1..1]
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { innerWidth, innerHeight } = window;
      const normalized = getNormalizedPointer(e.clientX, e.clientY, innerWidth, innerHeight);
      setPointer(normalized.x, normalized.y);

      // Mouse drag rotation (±15° yaw, ±8° pitch)
      if (isPointerDown.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        // 15 deg = 0.2618 rad, 8 deg = 0.1396 rad
        const yaw = Math.max(-0.2618, Math.min(0.2618, (dx / innerWidth) * 0.8));
        const pitch = Math.max(-0.1396, Math.min(0.1396, (dy / innerHeight) * 0.45));
        setCameraOffset({ yaw, pitch });
      }
    },
    [setPointer, setCameraOffset]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button === 0) {
        isPointerDown.current = true;
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    isPointerDown.current = false;
    // Spring camera back smoothly
    setCameraOffset({ yaw: 0, pitch: 0 });
  }, [setCameraOffset]);

  // Mobile Touch as Observer Input
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
        dragStartPos.current = { x: touch.clientX, y: touch.clientY };
        touchStartTime.current = Date.now();

        const { innerWidth, innerHeight } = window;
        const normalized = getNormalizedPointer(touch.clientX, touch.clientY, innerWidth, innerHeight);
        setPointer(normalized.x, normalized.y);

        // Immediate tactile contact sparks observer attention
        setAttentionLevel(0.7);

        // Hold gesture recognition: after 400ms of stationary contact, sync observer
        if (touchHoldTimeout.current) clearTimeout(touchHoldTimeout.current);
        touchHoldTimeout.current = setTimeout(() => {
          setAttentionLevel(0.95);
        }, 400);
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

        if (lastTouchPos.current) {
          const dx = touch.clientX - lastTouchPos.current.x;
          const dy = touch.clientY - lastTouchPos.current.y;
          const dragDist = Math.sqrt(dx * dx + dy * dy);

          // If finger moves more than 10px, cancel hold gesture
          if (dragDist > 10 && touchHoldTimeout.current) {
            clearTimeout(touchHoldTimeout.current);
            touchHoldTimeout.current = null;
          }

          // Camera drag rotation
          const totalDx = touch.clientX - dragStartPos.current.x;
          const totalDy = touch.clientY - dragStartPos.current.y;
          const yaw = Math.max(-0.2618, Math.min(0.2618, (totalDx / innerWidth) * 0.8));
          const pitch = Math.max(-0.1396, Math.min(0.1396, (totalDy / innerHeight) * 0.45));
          setCameraOffset({ yaw, pitch });

          // Measure velocity to inject kinetic energy into the vacuum
          addScrollEnergy(Math.min(0.35, dragDist * 0.008));
        }

        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [setPointer, setCameraOffset, addScrollEnergy]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchHoldTimeout.current) {
      clearTimeout(touchHoldTimeout.current);
      touchHoldTimeout.current = null;
    }

    const holdDuration = Date.now() - touchStartTime.current;
    const currentMouseWorld = useExperienceStore.getState().mouseWorld;

    // Release after touch generates an energetic gravitational ripple
    if (holdDuration > 250) {
      triggerTouchRipple(currentMouseWorld, 1.0);
    } else {
      triggerTouchRipple(currentMouseWorld, 0.4);
    }

    lastTouchPos.current = null;
    setCameraOffset({ yaw: 0, pitch: 0 });
  }, [setCameraOffset, triggerTouchRipple]);


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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 w-full h-full pointer-events-auto bg-[#030712] ${className}`}
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={dpr}
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
          <SingularityScene />
          {enablePostProcessing && <PostProcessing />}
        </Suspense>
      </Canvas>
    </div>
  );
}
