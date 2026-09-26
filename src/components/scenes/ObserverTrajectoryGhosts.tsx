'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { ghostRibbonVertexShader } from '@/three/shaders/ghostRibbon.vert';
import { ghostRibbonFragmentShader } from '@/three/shaders/ghostRibbon.frag';
import { damp } from '@/utils/helpers';

const POINTS_PER_TRAJECTORY = 180;
const TRAJECTORY_COUNT = 3;

function createPrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function ObserverTrajectoryGhosts() {
  const lineRefs = useRef<(THREE.Line | null)[]>([]);
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const proximityResonanceRef = useRef(0);

  const setRecognitionResonance = useExperienceStore((state) => state.setRecognitionResonance);

  // Generate 3 harmonic trajectory loops orbiting around the monolith
  const trajectories = useMemo(() => {
    const rng = createPrng(31415);
    const loops = [];

    for (let loopIdx = 0; loopIdx < TRAJECTORY_COUNT; loopIdx++) {
      const positions = new Float32Array(POINTS_PER_TRAJECTORY * 3);
      const progresses = new Float32Array(POINTS_PER_TRAJECTORY);
      const offsets = new Float32Array(POINTS_PER_TRAJECTORY * 3);

      const radiusX = 1.75 + loopIdx * 0.22;
      const radiusY = 1.55 + loopIdx * 0.18;
      const radiusZ = 1.85 + loopIdx * 0.20;

      const tiltX = (loopIdx - 1) * 0.45 + (rng() - 0.5) * 0.2;
      const tiltZ = (loopIdx - 1) * 0.35 + (rng() - 0.5) * 0.2;

      for (let i = 0; i < POINTS_PER_TRAJECTORY; i++) {
        const t = (i / POINTS_PER_TRAJECTORY) * Math.PI * 2;
        progresses[i] = i / POINTS_PER_TRAJECTORY;

        // 3D Lissajous orbital knot
        let x = Math.sin(t * (1 + loopIdx * 0.5)) * radiusX;
        let y = Math.cos(t * (2 - loopIdx * 0.3)) * radiusY;
        let z = Math.sin(t * 2 + loopIdx) * radiusZ;

        // Apply tilt
        const rotY = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rotZ = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        y = rotY;
        z = rotZ;

        const rotX = x * Math.cos(tiltZ) - z * Math.sin(tiltZ);
        z = x * Math.sin(tiltZ) + z * Math.cos(tiltZ);
        x = rotX;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        offsets[i * 3] = (rng() - 0.5) * 0.04;
        offsets[i * 3 + 1] = (rng() - 0.5) * 0.04;
        offsets[i * 3 + 2] = (rng() - 0.5) * 0.04;
      }

      loops.push({ positions, progresses, offsets });
    }

    return loops;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGhostIntensity: { value: 0 },
      uArchetypeMode: { value: 0 },
      uObserverPos: { value: new THREE.Vector3(0, 0, 0) },
      uObserverAttention: { value: 0 },
      uProximityResonance: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const archive = store.observerArchive;
    const materialLock = store.materialLockProgress;
    const attention = store.attentionLevel;
    const archetype = store.observerArchetype;
    const mouseWorld = store.mouseWorld;

    const sessionCount = archive?.sessionCount || 1;
    const isReturning = sessionCount > 1;

    // Ghost intensity: visible when materialLock starts, amplified for returning observers
    const baseIntensity = isReturning
      ? Math.min(1.0, 0.35 + (sessionCount - 1) * 0.25)
      : attention > 0.6
      ? 0.25 * attention
      : 0.0;
    const effectiveIntensity = baseIntensity * materialLock;

    // Check closest proximity between observer mouseWorld and ghost trajectories
    const obsVec = new THREE.Vector3(mouseWorld[0], mouseWorld[1], mouseWorld[2]);
    let minDistance = 999;

    trajectories.forEach((traj) => {
      for (let i = 0; i < POINTS_PER_TRAJECTORY; i += 6) {
        const px = traj.positions[i * 3];
        const py = traj.positions[i * 3 + 1];
        const pz = traj.positions[i * 3 + 2];
        const d = obsVec.distanceTo(new THREE.Vector3(px, py, pz));
        if (d < minDistance) minDistance = d;
      }
    });

    const isNearTrajectory = minDistance < 0.65;
    const targetProximity = isNearTrajectory ? Math.max(0, 1.0 - minDistance / 0.65) : 0;
    proximityResonanceRef.current = damp(proximityResonanceRef.current, targetProximity, 3.5, delta);
    setRecognitionResonance(proximityResonanceRef.current);

    let archMode = 0;
    if (archetype === 'THE_WITNESS') archMode = 1;
    else if (archetype === 'THE_CATALYST') archMode = 2;
    else if (archetype === 'THE_ARCHITECT') archMode = 3;

    materialRefs.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uGhostIntensity.value = effectiveIntensity;
        mat.uniforms.uArchetypeMode.value = archMode;
        mat.uniforms.uObserverPos.value.set(mouseWorld[0], mouseWorld[1], mouseWorld[2]);
        mat.uniforms.uObserverAttention.value = attention;
        mat.uniforms.uProximityResonance.value = proximityResonanceRef.current;
      }
    });

    lineRefs.current.forEach((line) => {
      if (line) {
        line.visible = effectiveIntensity > 0.01;
      }
    });
  });

  return (
    <group name="observer-trajectory-ghosts">
      {trajectories.map((traj, idx) => (
        <lineLoop
          key={`trajectory-ghost-${idx}`}
          ref={(el) => {
            lineRefs.current[idx] = el;
          }}
          renderOrder={10}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[traj.positions, 3]} />
            <bufferAttribute attach="attributes-aProgress" args={[traj.progresses, 1]} />
            <bufferAttribute attach="attributes-aOffset" args={[traj.offsets, 3]} />
          </bufferGeometry>
          <shaderMaterial
            ref={(el) => {
              materialRefs.current[idx] = el;
            }}
            vertexShader={ghostRibbonVertexShader}
            fragmentShader={ghostRibbonFragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      ))}
    </group>
  );
}
