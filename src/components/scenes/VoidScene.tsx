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
  const fluctuationMatRef = useRef<THREE.ShaderMaterial>(null);
  const dustMatRef = useRef<THREE.ShaderMaterial>(null);
  const particleTimeAccumulator = useRef(0);

  const particleSpeedMultiplier = useExperienceStore(
    (state) => state.particleSpeedMultiplier
  );

  // Fluctuations Uniforms
  const fluctuationUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
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
    };
  }, []);

  // Frame update loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (fluctuationMatRef.current) {
      fluctuationMatRef.current.uniforms.uTime.value = time;
    }

    // Accumulate particle time modulated by debug speed multiplier
    particleTimeAccumulator.current += delta * particleSpeedMultiplier;

    if (dustMatRef.current) {
      dustMatRef.current.uniforms.uTime.value = particleTimeAccumulator.current;
    }
  });

  return (
    <group name="act-01-the-void">
      {/* 1. Deep Indigo Dithered Atmospheric Horizon */}
      <mesh renderOrder={-1000}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader={voidAtmosphereVertexShader}
          fragmentShader={voidAtmosphereFragmentShader}
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
