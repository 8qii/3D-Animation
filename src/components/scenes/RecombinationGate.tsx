'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { recombinationGateVertexShader } from '@/three/shaders/recombinationGate.vert';
import { recombinationGateFragmentShader } from '@/three/shaders/recombinationGate.frag';

export function RecombinationGate() {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const outerTorusRef = useRef<THREE.Mesh>(null);
  const syncFlashRef = useRef(0);
  const prevSyncRef = useRef(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGateAperture: { value: 0 },
      uGateActivation: { value: 0 },
      uPersonalFreq: { value: 432 },
      uSyncFlash: { value: 0 },
      uArchetypeColor: { value: new THREE.Vector3(0.3, 0.85, 1.0) },
      uUniverseSynchronized: { value: 0 },
      uBreathPhase: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const act5GateArmed = store.act5GateArmed;
    const act5Active = store.act5Active;
    const singularity = store.singularityThresholdProgress;
    const aperture = store.gateApertureProgress;
    const activation = store.gateActivationProgress;
    const isSync = store.universeSynchronized;
    const personalFreq = store.personalFrequency || 432;
    const archetype = store.observerArchetype;
    const breathPhase = store.breathPhase;

    // Trigger sync flash impulse on synchronization
    if (isSync && !prevSyncRef.current) {
      syncFlashRef.current = 1.0;
    }
    prevSyncRef.current = isSync;
    if (syncFlashRef.current > 0.001) {
      syncFlashRef.current = Math.max(0, syncFlashRef.current - delta * 0.85);
    }

    // Archetype color styling
    let targetColor = new THREE.Vector3(0.35, 0.85, 1.0);
    if (archetype === 'THE_WITNESS') {
      targetColor = new THREE.Vector3(0.25, 0.65, 1.0);
    } else if (archetype === 'THE_CATALYST') {
      targetColor = new THREE.Vector3(1.0, 0.28, 0.75);
    } else if (archetype === 'THE_ARCHITECT') {
      targetColor = new THREE.Vector3(1.0, 0.88, 0.35);
    }

    if (ringMaterialRef.current) {
      ringMaterialRef.current.uniforms.uTime.value = time;
      ringMaterialRef.current.uniforms.uGateAperture.value = aperture;
      ringMaterialRef.current.uniforms.uGateActivation.value = activation;
      ringMaterialRef.current.uniforms.uPersonalFreq.value = personalFreq;
      ringMaterialRef.current.uniforms.uSyncFlash.value = syncFlashRef.current;
      ringMaterialRef.current.uniforms.uArchetypeColor.value.copy(targetColor);
      ringMaterialRef.current.uniforms.uUniverseSynchronized.value = isSync ? 1.0 : 0.0;
      ringMaterialRef.current.uniforms.uBreathPhase.value = breathPhase;
    }

    if (groupRef.current) {
      // Visible once singularity threshold starts or Act V gate is armed / active
      const isVisible = singularity > 0.05 || act5GateArmed || act5Active;
      groupRef.current.visible = isVisible;

      // Subtle breath dilation
      const breathScale = 1.0 + Math.sin(time * 1.5) * 0.025;
      const targetScale = (0.75 + aperture * 0.45 + activation * 0.2) * breathScale;
      groupRef.current.scale.set(targetScale, targetScale, targetScale);

      // Face camera softly while maintaining sacred alignment
      groupRef.current.quaternion.copy(state.camera.quaternion);
    }

    if (torusRef.current) {
      torusRef.current.rotation.z += delta * (0.35 + activation * 1.2);
    }
    if (outerTorusRef.current) {
      outerTorusRef.current.rotation.z -= delta * (0.22 + activation * 0.8);
    }
  });

  return (
    <group ref={groupRef} name="aetheria-recombination-gate" position={[0, 0, 0]}>
      {/* 1. Primary Aperture & Gravitational Lensing Disk */}
      <mesh renderOrder={9}>
        <planeGeometry args={[2.8, 2.8, 48, 48]} />
        <shaderMaterial
          ref={ringMaterialRef}
          vertexShader={recombinationGateVertexShader}
          fragmentShader={recombinationGateFragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Inner Golden-Ratio Helical Guide Ring (1.0 x Phi) */}
      <mesh ref={torusRef} renderOrder={8}>
        <torusGeometry args={[0.92, 0.014, 16, 80]} />
        <meshBasicMaterial
          color="#fde047"
          transparent={true}
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Outer Sacred Geometric Boundary Ring (1.618 x Phi) */}
      <mesh ref={outerTorusRef} renderOrder={8}>
        <torusGeometry args={[1.48, 0.009, 16, 96]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent={true}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
