'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { damp } from '@/utils/helpers';

const STORAGE_KEY = 'aetheria_observer_memory';
const EVOLUTION_STORAGE_KEY = 'aetheria_observer_evolution';

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

  // Phase 9.19 Observer Evolution Engine & Quality Hooks
  const setObserverArchetype = useExperienceStore((state) => state.setObserverArchetype);
  const updateArchetypeScores = useExperienceStore((state) => state.updateArchetypeScores);
  const setHiddenEnding = useExperienceStore((state) => state.setHiddenEnding);
  const setCursorGravitationalForce = useExperienceStore((state) => state.setCursorGravitationalForce);
  const setGpuTier = useExperienceStore((state) => state.setGpuTier);

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

  // Evolution & scoring accumulators
  const scoreFlushTimer = useRef(0);
  const accumScores = useRef({ witness: 0, catalyst: 0, architect: 0 });
  const gravForceRef = useRef(0);

  // Adaptive Quality rolling FPS trackers
  const fpsTimer = useRef(0);
  const frameCount = useRef(0);
  const lowFpsDuration = useRef(0);
  const highFpsDuration = useRef(0);

  // 1. Observer Memory & Evolution Persistence (localStorage)
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

      // Load Evolution Memory
      const evoRaw = localStorage.getItem(EVOLUTION_STORAGE_KEY);
      if (evoRaw) {
        const evoData = JSON.parse(evoRaw);
        if (evoData.scores) updateArchetypeScores(evoData.scores);
        if (evoData.archetype) setObserverArchetype(evoData.archetype);
        if (evoData.hiddenEnding) setHiddenEnding(evoData.hiddenEnding);
      }
    } catch {
      // Graceful fallback if storage disabled
    }
  }, [setIsReturningObserver, setHasSynchronizedBefore, setDiscoveryLevel, updateArchetypeScores, setObserverArchetype, setHiddenEnding]);

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

    let pointerSpeed = 0;
    let distFromCenter = 999;
    let rawProximity = 0;
    let isHovering = false;

    if (hitPlane || hitSphere) {
      setMouseWorld(activePoint.x, activePoint.y, activePoint.z);

      // Measure motion speed in 3D world space
      const distanceMoved = activePoint.distanceTo(lastWorldPoint.current);
      lastWorldPoint.current.copy(activePoint);

      pointerSpeed = distanceMoved / Math.max(0.0001, delta);

      // Stillness metric: 1.0 when perfectly still, decaying as speed exceeds 1.5
      const instantStillness = Math.max(0, Math.min(1.0, 1.0 - pointerSpeed / 2.0));
      stillnessScoreRef.current = damp(stillnessScoreRef.current, instantStillness, 3.0, delta);
      setObserverStillnessScore(stillnessScoreRef.current);

      // Proximity to crystal center (0, 0.1, 0)
      distFromCenter = activePoint.distanceTo(crystalSphere.current.center);
      // Normalized proximity: 1.0 at center/surface, 0 at radius 4.5
      rawProximity = Math.max(0, Math.min(1.0, 1.0 - (distFromCenter - 0.8) / 3.7));
      setObserverProximity(rawProximity);

      isHovering = distFromCenter < 2.5 || hitSphere !== null;

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

      // 6. Archetype Scoring Accumulation
      if (isHovering && stillnessScoreRef.current > 0.65) {
        // High stillness -> THE_WITNESS
        accumScores.current.witness += delta * 1.6;
      } else if (pointerSpeed > 1.8) {
        // High kinetic excitation -> THE_CATALYST
        accumScores.current.catalyst += delta * 1.8;
      } else if (isHovering && pointerSpeed >= 0.1 && pointerSpeed <= 1.4) {
        // Deliberate geometric inspection -> THE_ARCHITECT
        accumScores.current.architect += delta * 1.5;
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

    // 7. Flush Archetype Evolution & Determine Dominant Persona
    scoreFlushTimer.current += delta;
    if (scoreFlushTimer.current > 0.3) {
      scoreFlushTimer.current = 0;
      const { witness, catalyst, architect } = accumScores.current;
      if (witness > 0 || catalyst > 0 || architect > 0) {
        updateArchetypeScores({ witness, catalyst, architect });
        accumScores.current = { witness: 0, catalyst: 0, architect: 0 };

        const currentScores = useExperienceStore.getState().archetypeScores;
        const totalScore = currentScores.witness + currentScores.catalyst + currentScores.architect;

        if (totalScore >= 5) {
          let dominant: 'THE_INITIATE' | 'THE_WITNESS' | 'THE_CATALYST' | 'THE_ARCHITECT' = 'THE_INITIATE';
          if (currentScores.witness >= currentScores.catalyst && currentScores.witness >= currentScores.architect) {
            dominant = 'THE_WITNESS';
          } else if (currentScores.catalyst >= currentScores.witness && currentScores.catalyst >= currentScores.architect) {
            dominant = 'THE_CATALYST';
          } else {
            dominant = 'THE_ARCHITECT';
          }

          if (dominant !== useExperienceStore.getState().observerArchetype) {
            setObserverArchetype(dominant);
          }

          // Determine hidden ending branch
          let targetEnding: 'TRANSCENDENCE' | 'SUPERNOVA' | 'ASCENSION' | null = null;
          if (dominant === 'THE_WITNESS') targetEnding = 'TRANSCENDENCE';
          else if (dominant === 'THE_CATALYST') targetEnding = 'SUPERNOVA';
          else if (dominant === 'THE_ARCHITECT') targetEnding = 'ASCENSION';

          if (targetEnding !== useExperienceStore.getState().hiddenEnding) {
            setHiddenEnding(targetEnding);
          }

          try {
            localStorage.setItem(
              EVOLUTION_STORAGE_KEY,
              JSON.stringify({
                archetype: dominant,
                scores: currentScores,
                hiddenEnding: targetEnding,
                updatedAt: Date.now(),
              })
            );
          } catch {}
        }
      }
    }

    // 8. Gravitational Cursor Distortion Calculation
    let targetGravForce = 0;
    if (isHovering) {
      const currentArch = useExperienceStore.getState().observerArchetype;
      if (currentArch === 'THE_CATALYST') {
        targetGravForce = (0.4 + Math.min(1.0, pointerSpeed / 3.5) * 0.5) * attentionRef.current;
      } else if (currentArch === 'THE_ARCHITECT') {
        targetGravForce = 0.55 * attentionRef.current * (0.5 + rawProximity * 0.5);
      } else if (currentArch === 'THE_WITNESS') {
        targetGravForce = 0.38 * stillnessScoreRef.current * attentionRef.current;
      } else {
        targetGravForce = 0.28 * attentionRef.current;
      }
    }
    gravForceRef.current = damp(gravForceRef.current, targetGravForce, 3.5, delta);
    setCursorGravitationalForce(gravForceRef.current);

    // 9. Adaptive GPU Quality System (Rolling FPS Monitor)
    fpsTimer.current += delta;
    frameCount.current += 1;
    if (fpsTimer.current >= 0.5) {
      const currentRollingFps = frameCount.current / fpsTimer.current;
      frameCount.current = 0;
      fpsTimer.current = 0;

      const currentTier = useExperienceStore.getState().gpuTier;
      if (currentRollingFps < 38) {
        lowFpsDuration.current += 0.5;
        highFpsDuration.current = 0;
        if (lowFpsDuration.current >= 2.0) {
          lowFpsDuration.current = 0;
          if (currentTier === 'TIER_ULTRA') setGpuTier('TIER_BALANCED');
          else if (currentTier === 'TIER_BALANCED') setGpuTier('TIER_EFFICIENT');
        }
      } else if (currentRollingFps > 56) {
        highFpsDuration.current += 0.5;
        lowFpsDuration.current = 0;
        if (highFpsDuration.current >= 5.0) {
          highFpsDuration.current = 0;
          if (currentTier === 'TIER_EFFICIENT') setGpuTier('TIER_BALANCED');
          else if (currentTier === 'TIER_BALANCED') setGpuTier('TIER_ULTRA');
        }
      } else {
        lowFpsDuration.current = Math.max(0, lowFpsDuration.current - 0.25);
        highFpsDuration.current = Math.max(0, highFpsDuration.current - 0.25);
      }
    }

    // Smooth hidden discovery pulse if active
    if (hiddenDiscoveryActive) {
      const store = useExperienceStore.getState();
      const currentProg = store.hiddenDiscoveryProgress;
      // Fade progress down smoothly over 15 seconds after reveal surge
      if (currentProg > 0.01) {
        setHiddenDiscoveryProgress(Math.max(0, currentProg - delta * 0.065));
      }
    }

    // 10. Decay touch ripple if active
    const touchRipple = useExperienceStore.getState().touchRipple;
    if (touchRipple.active) {
      const nextIntensity = Math.max(0, touchRipple.intensity - delta * 0.75);
      setTouchRippleIntensity(nextIntensity);
    }
  });

  return null;
}


