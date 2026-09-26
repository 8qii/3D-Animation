'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

const STORAGE_KEY = 'aetheria_observer_memory';

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
  const setAttentionVector = useExperienceStore((state) => state.setAttentionVector);
  const setAttentionStrength = useExperienceStore((state) => state.setAttentionStrength);
  const triggerHiddenDiscovery = useExperienceStore((state) => state.triggerHiddenDiscovery);
  const hiddenDiscoveryActive = useExperienceStore((state) => state.hiddenDiscoveryActive);
  const setHiddenDiscoveryProgress = useExperienceStore((state) => state.setHiddenDiscoveryProgress);
  const setIsReturningObserver = useExperienceStore((state) => state.setIsReturningObserver);
  const setHasSynchronizedBefore = useExperienceStore((state) => state.setHasSynchronizedBefore);
  const setDiscoveryLevel = useExperienceStore((state) => state.setDiscoveryLevel);
  const setGyroOffset = useExperienceStore((state) => state.setGyroOffset);

  // Pre-allocated geometries and vectors
  const focalPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const crystalSphere = useRef(new THREE.Sphere(new THREE.Vector3(0, 0.1, 0), 1.9));
  const worldPoint = useRef(new THREE.Vector3(0, 0, 0));
  const sphereIntersectPoint = useRef(new THREE.Vector3(0, 0, 0));
  const lastWorldPoint = useRef(new THREE.Vector3(0, 0, 0));
  const attentionVec = useRef(new THREE.Vector3(0, 0, -1));

  // Attention & state tracking dynamics
  const attentionRef = useRef(0.2);
  const hoverDurationRef = useRef(0);
  const stillnessScoreRef = useRef(0);
  const idleTimerRef = useRef(0);
  const discoveryTriggered = useRef(false);

  // 1. Observer Memory Persistence (localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setIsReturningObserver(true);
        if (data.hasSynchronized) setHasSynchronizedBefore(true);
        if (data.discoveryLevel) setDiscoveryLevel(data.discoveryLevel);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...data,
            visits: (data.visits || 1) + 1,
            lastVisit: Date.now(),
          })
        );
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            visits: 1,
            firstVisit: Date.now(),
            hasSynchronized: false,
            discoveryLevel: 0,
          })
        );
      }
    } catch {
      // Graceful fallback if storage disabled
    }
  }, [setIsReturningObserver, setHasSynchronizedBefore, setDiscoveryLevel]);

  // 2. Mobile Gyroscope Layer (Optional Subtle Shift ±5°)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Gamma: Left/Right tilt [-90, 90] -> ±5° (0.0873 rad)
        const radX = THREE.MathUtils.degToRad(e.gamma);
        const clampedX = Math.max(-0.0873, Math.min(0.0873, radX * 0.45));

        // Beta: Forward/Back tilt [-180, 180] centered at 45° viewing posture -> ±5°
        const radY = THREE.MathUtils.degToRad(e.beta - 45);
        const clampedY = Math.max(-0.0873, Math.min(0.0873, radY * 0.35));

        setGyroOffset({ x: clampedX, y: clampedY });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [setGyroOffset]);

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
        // Persist synchronization achievement in localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const data = JSON.parse(raw);
            if (!data.hasSynchronized) {
              data.hasSynchronized = true;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              setHasSynchronizedBefore(true);
            }
          }
        } catch {}
      }
      setObserverState(nextState);

      // 4. Attention Vector System (camera direction + active gaze point)
      attentionVec.current.subVectors(activePoint, camera.position).normalize();
      setAttentionVector([attentionVec.current.x, attentionVec.current.y, attentionVec.current.z]);
      const strength = attentionRef.current * (0.5 + rawProximity * 0.5);
      setAttentionStrength(strength);

      // 5. Hidden Discovery Event: stillness > 0.80 && hover duration > 10.0s
      if (
        !discoveryTriggered.current &&
        stillnessScoreRef.current > 0.80 &&
        hoverDurationRef.current > 10.0
      ) {
        discoveryTriggered.current = true;
        triggerHiddenDiscovery();
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const data = JSON.parse(raw);
            data.discoveryLevel = Math.max(data.discoveryLevel || 0, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setDiscoveryLevel(data.discoveryLevel);
          }
        } catch {}
      }
    } else {
      idleTimerRef.current += delta;
      attentionRef.current = damp(attentionRef.current, 0.0, 1.5, delta);
      hoverDurationRef.current = Math.max(0, hoverDurationRef.current - delta * 2.0);
      setObserverHoverDuration(hoverDurationRef.current);
      setObserverProximity(0);
      setAttentionStrength(0);

      if (idleTimerRef.current > 4.0) {
        setObserverState('DORMANT');
      }
    }

    setAttentionLevel(attentionRef.current);

    // Smooth hidden discovery pulse if active
    if (hiddenDiscoveryActive) {
      const store = useExperienceStore.getState();
      const currentProg = store.hiddenDiscoveryProgress;
      // Fade progress down smoothly over 15 seconds after reveal surge
      if (currentProg > 0.01) {
        setHiddenDiscoveryProgress(Math.max(0, currentProg - delta * 0.065));
      }
    }

    // 6. Decay touch ripple if active
    const touchRipple = useExperienceStore.getState().touchRipple;
    if (touchRipple.active) {
      const nextIntensity = Math.max(0, touchRipple.intensity - delta * 0.75);
      setTouchRippleIntensity(nextIntensity);
    }
  });

  return null;
}


