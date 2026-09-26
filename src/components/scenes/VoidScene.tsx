'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { voidFluctuationVertexShader } from '@/three/shaders/voidFluctuation.vert';
import { voidFluctuationFragmentShader } from '@/three/shaders/voidFluctuation.frag';
import { voidParticlesVertexShader } from '@/three/shaders/voidParticles.vert';
import { voidParticlesFragmentShader } from '@/three/shaders/voidParticles.frag';
import { voidAtmosphereVertexShader } from '@/three/shaders/voidAtmosphere.vert';
import { voidAtmosphereFragmentShader } from '@/three/shaders/voidAtmosphere.frag';
import { useExperienceStore } from '@/store/experienceStore';

const PARTICLE_COUNT = 1400;

// Deterministic PRNG to generate particle instance attributes once outside render
function generateVoidDustData(count: number) {
  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  let seed = 9821;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    // Distributed in a deep volumetric chamber around the focal coordinate
    offsets[i * 3]     = (rng() - 0.5) * 12.0;
    offsets[i * 3 + 1] = (rng() - 0.5) * 10.0;
    offsets[i * 3 + 2] = (rng() - 0.5) * 12.0;

    scales[i] = 0.4 + rng() * 1.6;
    phases[i] = rng();
    speeds[i] = 0.6 + rng() * 0.8;
  }

  return { offsets, scales, phases, speeds };
}

const VOID_DUST = generateVoidDustData(PARTICLE_COUNT);

export function VoidScene() {
  const atmosphereMatRef = useRef<THREE.ShaderMaterial>(null);
  const fluctuationMatRef = useRef<THREE.ShaderMaterial>(null);
  const dustMatRef = useRef<THREE.ShaderMaterial>(null);
  const particleTimeAccumulator = useRef(0);

  // Atmosphere Uniforms
  const atmosphereUniforms = useMemo(() => {
    return {
      uBreathPhase: { value: 0 },
      uExcitation: { value: 0 },
    };
  }, []);

  // Fluctuations Uniforms
  const fluctuationUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uBreathPhase: { value: 0 },
      uExcitation: { value: 0 },
      uAttention: { value: 0 },
      uColorCore: { value: new THREE.Color('#e0f2fe') },
      uColorAura: { value: new THREE.Color('#38bdf8') },
    };
  }, []);

  // Dust Particles Uniforms
  const dustUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uPixelRatio: {
        value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
      },
      uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
      uAttention: { value: 0 },
      uExcitation: { value: 0 },
      uBreathPhase: { value: 0 },
    };
  }, []);

  // Frame update loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Read transient state directly to preserve 60FPS without React reconciliation
    const store = useExperienceStore.getState();
    const mouseWorld = store.mouseWorld;
    const attention = store.attentionLevel;
    const excitation = store.scrollEnergy;
    const breath = store.breathPhase;
    const speedMult = store.particleSpeedMultiplier;

    // 1. Atmosphere Shader Updates
    if (atmosphereMatRef.current) {
      atmosphereMatRef.current.uniforms.uBreathPhase.value = breath;
      atmosphereMatRef.current.uniforms.uExcitation.value = excitation;
    }

    // 2. Quantum Fluctuation Shader Updates
    if (fluctuationMatRef.current) {
      fluctuationMatRef.current.uniforms.uTime.value = time;
      fluctuationMatRef.current.uniforms.uBreathPhase.value = breath;
      fluctuationMatRef.current.uniforms.uExcitation.value = excitation;
      fluctuationMatRef.current.uniforms.uAttention.value = attention;
    }

    // 3. Accumulate Particle Time with Kinetic Scroll Excitation
    particleTimeAccumulator.current += delta * speedMult * (1.0 + excitation * 1.6);

    // 4. Reactive Particles Uniform Updates
    if (dustMatRef.current) {
      dustMatRef.current.uniforms.uTime.value = particleTimeAccumulator.current;
      dustMatRef.current.uniforms.uMouseWorld.value.set(
        mouseWorld[0],
        mouseWorld[1],
        mouseWorld[2]
      );
      dustMatRef.current.uniforms.uAttention.value = attention;
      dustMatRef.current.uniforms.uExcitation.value = excitation;
      dustMatRef.current.uniforms.uBreathPhase.value = breath;
    }
  });

  return (
    <group name="act-01-the-void">
      {/* 1. Deep Indigo Dithered Atmospheric Horizon */}
      <mesh renderOrder={-1000}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={atmosphereMatRef}
          vertexShader={voidAtmosphereVertexShader}
          fragmentShader={voidAtmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* 2. Central Quantum Light Fluctuation (Slow Breathing Illumination) */}
      <mesh position={[0, 0, 0]} renderOrder={1}>
        <planeGeometry args={[2.8, 2.8]} />
        <shaderMaterial
          ref={fluctuationMatRef}
          vertexShader={voidFluctuationVertexShader}
          fragmentShader={voidFluctuationFragmentShader}
          uniforms={fluctuationUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. GPU Instanced Brownian Dust Particles (Cathedral Motes) */}
      <instancedMesh
        args={[undefined, undefined, PARTICLE_COUNT]}
        renderOrder={2}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-aOffset"
            args={[VOID_DUST.offsets, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aScale"
            args={[VOID_DUST.scales, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aPhase"
            args={[VOID_DUST.phases, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aSpeed"
            args={[VOID_DUST.speeds, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={dustMatRef}
          vertexShader={voidParticlesVertexShader}
          fragmentShader={voidParticlesFragmentShader}
          uniforms={dustUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
