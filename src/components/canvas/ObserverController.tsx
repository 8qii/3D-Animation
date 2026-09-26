'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

export function ObserverController() {
  const { raycaster, camera, pointer } = useThree();

  const setMouseWorld = useExperienceStore((state) => state.setMouseWorld);
  const setAttentionLevel = useExperienceStore((state) => state.setAttentionLevel);
  const setBreathPhase = useExperienceStore((state) => state.setBreathPhase);
  const setObserverState = useExperienceStore((state) => state.setObserverState);
  const setObserverProximity = useExperienceStore((state) => state.setObserverProximity);
  const setObserverHoverDuration = useExperienceStore((state) => state.setObserverHoverDuration);
  const setObserverStillnessScore = useExperienceStore((state) => state.setObserverStillnessScore);
  const setTouchRippleIntensity = useExperienceStore((state) => state.setTouchRippleIntensity);

  // Pre-allocated geometries and vectors
  const focalPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const crystalSphere = useRef(new THREE.Sphere(new THREE.Vector3(0, 0.1, 0), 1.9));
  const worldPoint = useRef(new THREE.Vector3(0, 0, 0));
  const sphereIntersectPoint = useRef(new THREE.Vector3(0, 0, 0));
  const lastWorldPoint = useRef(new THREE.Vector3(0, 0, 0));

  // Attention & state tracking dynamics
  const attentionRef = useRef(0.2);
  const hoverDurationRef = useRef(0);
  const stillnessScoreRef = useRef(0);
  const idleTimerRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Synchronized Universal Breathing Phase (0.05 Hz = 20-second fundamental cycle)
    const breathOscillation = Math.sin(time * 0.314159) * 0.5 + 0.5; // [0, 1]
    setBreathPhase(breathOscillation);

    // 2. 3D World Unprojection on focal plane z = 0
    raycaster.setFromCamera(pointer, camera);
    const hitPlane = raycaster.ray.intersectPlane(focalPlane.current, worldPoint.current);
    const hitSphere = raycaster.ray.intersectSphere(crystalSphere.current, sphereIntersectPoint.current);

    // Point on or near the crystal
    const activePoint = hitSphere ? sphereIntersectPoint.current : worldPoint.current;

    if (hitPlane || hitSphere) {
      setMouseWorld(activePoint.x, activePoint.y, activePoint.z);

      // Measure motion speed in 3D world space
      const distanceMoved = activePoint.distanceTo(lastWorldPoint.current);
      lastWorldPoint.current.copy(activePoint);

      const pointerSpeed = distanceMoved / Math.max(0.0001, delta);

      // Stillness metric: 1.0 when perfectly still, decaying as speed exceeds 1.5
      const instantStillness = Math.max(0, Math.min(1.0, 1.0 - pointerSpeed / 2.0));
      stillnessScoreRef.current = damp(stillnessScoreRef.current, instantStillness, 3.0, delta);
      setObserverStillnessScore(stillnessScoreRef.current);

      // Proximity to crystal center (0, 0.1, 0)
      const distFromCenter = activePoint.distanceTo(crystalSphere.current.center);
      // Normalized proximity: 1.0 at center/surface, 0 at radius 4.5
      const rawProximity = Math.max(0, Math.min(1.0, 1.0 - (distFromCenter - 0.8) / 3.7));
      setObserverProximity(rawProximity);

      const isHovering = distFromCenter < 2.5 || hitSphere !== null;

      if (isHovering) {
        hoverDurationRef.current += delta;
      } else {
        hoverDurationRef.current = Math.max(0, hoverDurationRef.current - delta * 1.5);
      }
      setObserverHoverDuration(hoverDurationRef.current);

      // Attention dynamics
      if (isHovering && stillnessScoreRef.current > 0.4) {
        const targetAttention = Math.min(1.0, 0.4 + hoverDurationRef.current * 0.2 + stillnessScoreRef.current * 0.4);
        attentionRef.current = damp(attentionRef.current, targetAttention, 2.0, delta);
      } else {
        const targetAttention = isHovering ? 0.45 : 0.15;
        attentionRef.current = damp(attentionRef.current, targetAttention, 3.5, delta);
      }

      // Reset idle timer
      idleTimerRef.current = 0;

      // 3. Observer Recognition State Progression
      let nextState: 'DORMANT' | 'OBSERVER_DETECTED' | 'OBSERVER_SYNCHRONIZED' | 'GENESIS_RESPONSE_ACTIVE' = 'OBSERVER_DETECTED';

      if (hoverDurationRef.current > 4.5 && stillnessScoreRef.current > 0.65) {
        nextState = 'GENESIS_RESPONSE_ACTIVE';
      } else if (hoverDurationRef.current > 1.8 && stillnessScoreRef.current > 0.4) {
        nextState = 'OBSERVER_SYNCHRONIZED';
      }
      setObserverState(nextState);
    } else {
      idleTimerRef.current += delta;
      attentionRef.current = damp(attentionRef.current, 0.0, 1.5, delta);
      hoverDurationRef.current = Math.max(0, hoverDurationRef.current - delta * 2.0);
      setObserverHoverDuration(hoverDurationRef.current);
      setObserverProximity(0);

      if (idleTimerRef.current > 4.0) {
        setObserverState('DORMANT');
      }
    }

    setAttentionLevel(attentionRef.current);

    // 4. Decay touch ripple if active
    const touchRipple = useExperienceStore.getState().touchRipple;
    if (touchRipple.active) {
      const nextIntensity = Math.max(0, touchRipple.intensity - delta * 0.75);
      setTouchRippleIntensity(nextIntensity);
    }
  });

  return null;
}

