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
import { lensDustVertexShader } from '@/three/shaders/lensDust.vert';
import { lensDustFragmentShader } from '@/three/shaders/lensDust.frag';
import { deepSpaceVertexShader } from '@/three/shaders/deepSpaceParticles.vert';
import { deepSpaceFragmentShader } from '@/three/shaders/deepSpaceParticles.frag';
import { volumetricGlowVertexShader } from '@/three/shaders/volumetricGlow.vert';
import { volumetricGlowFragmentShader } from '@/three/shaders/volumetricGlow.frag';
import { vectorGridVertexShader } from '@/three/shaders/vectorGrid.vert';
import { vectorGridFragmentShader } from '@/three/shaders/vectorGrid.frag';
import { useExperienceStore } from '@/store/experienceStore';

const MID_PARTICLE_COUNT = 1200;
const LENS_DUST_COUNT = 90;
const DEEP_SPACE_COUNT = 1800;

function createPrng(initialSeed: number) {
  let s = initialSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateLensDust(count: number) {
  const rng = createPrng(1103);
  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    offsets[i * 3]     = (rng() - 0.5) * 6.5;
    offsets[i * 3 + 1] = (rng() - 0.5) * 4.8;
    offsets[i * 3 + 2] = 5.2 + rng() * 1.6;

    scales[i] = 0.6 + rng() * 1.4;
    phases[i] = rng();
    speeds[i] = 0.5 + rng() * 0.7;
  }
  return { offsets, scales, phases, speeds };
}

function generateMidDust(count: number) {
  const rng = createPrng(9821);
  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    offsets[i * 3]     = (rng() - 0.5) * 11.0;
    offsets[i * 3 + 1] = (rng() - 0.5) * 9.0;
    offsets[i * 3 + 2] = (rng() - 0.5) * 8.0;

    scales[i] = 0.4 + rng() * 1.5;
    phases[i] = rng();
    speeds[i] = 0.6 + rng() * 0.8;
  }
  return { offsets, scales, phases, speeds };
}

function generateDeepSpace(count: number) {
  const rng = createPrng(4433);
  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    offsets[i * 3]     = (rng() - 0.5) * 32.0;
    offsets[i * 3 + 1] = (rng() - 0.5) * 26.0;
    offsets[i * 3 + 2] = -3.0 - rng() * 16.0;

    scales[i] = 0.5 + rng() * 1.2;
    phases[i] = rng();
    speeds[i] = 0.4 + rng() * 0.6;
  }
  return { offsets, scales, phases, speeds };
}

const STATIC_LENS_DUST = generateLensDust(LENS_DUST_COUNT);
const STATIC_MID_DUST = generateMidDust(MID_PARTICLE_COUNT);
const STATIC_DEEP_SPACE = generateDeepSpace(DEEP_SPACE_COUNT);

export function VoidScene() {
  const atmosphereMatRef = useRef<THREE.ShaderMaterial>(null);
  const volumetricGlowMatRef = useRef<THREE.ShaderMaterial>(null);
  const deepSpaceMatRef = useRef<THREE.ShaderMaterial>(null);
  const fluctuationMatRef = useRef<THREE.ShaderMaterial>(null);
  const midDustMatRef = useRef<THREE.ShaderMaterial>(null);
  const lensDustMatRef = useRef<THREE.ShaderMaterial>(null);
  const vectorGridMatRef = useRef<THREE.ShaderMaterial>(null);

  const particleTimeAccumulator = useRef(0);

  // Atmosphere Uniforms
  const atmosphereUniforms = useMemo(() => ({
    uBreathPhase: { value: 0 },
    uExcitation: { value: 0 },
  }), []);

  // Volumetric Glow Uniforms
  const volumetricUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBreathPhase: { value: 0 },
    uExcitation: { value: 0 },
  }), []);

  // Deep Space Particles Uniforms
  const deepSpaceUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: {
      value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    },
  }), []);

  // Central Fluctuation Uniforms
  const fluctuationUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBreathPhase: { value: 0 },
    uExcitation: { value: 0 },
    uAttention: { value: 0 },
    uTransition: { value: 0 },
    uColorCore: { value: new THREE.Color('#e0f2fe') },
    uColorAura: { value: new THREE.Color('#38bdf8') },
  }), []);

  // Mid Dust Reactive Particles Uniforms
  const midDustUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: {
      value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    },
    uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
    uAttention: { value: 0 },
    uExcitation: { value: 0 },
    uBreathPhase: { value: 0 },
    uTransition: { value: 0 },
    uOrderProgress: { value: 0 },
  }), []);

  // Foreground Lens Dust Uniforms
  const lensDustUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: {
      value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    },
  }), []);

  // Vector Blueprint Grid Uniforms
  const vectorGridUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uGridReveal: { value: 0 },
  }), []);

  // Frame animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    const store = useExperienceStore.getState();
    const mouseWorld = store.mouseWorld;
    const attention = store.attentionLevel;
    const excitation = store.scrollEnergy;
    const breath = store.breathPhase;
    const speedMult = store.particleSpeedMultiplier;
    const transition = store.transitionProgress;

    // 1. Atmosphere Shader
    if (atmosphereMatRef.current) {
      atmosphereMatRef.current.uniforms.uBreathPhase.value = breath;
      atmosphereMatRef.current.uniforms.uExcitation.value = excitation;
    }

    // 2. Volumetric Glow
    if (volumetricGlowMatRef.current) {
      volumetricGlowMatRef.current.uniforms.uTime.value = time;
      volumetricGlowMatRef.current.uniforms.uBreathPhase.value = breath;
      volumetricGlowMatRef.current.uniforms.uExcitation.value = excitation;
    }

    // 3. Deep Space Stars
    if (deepSpaceMatRef.current) {
      deepSpaceMatRef.current.uniforms.uTime.value = time * 0.5;
    }

    // 4. Central Quantum Fluctuation (Transition Contraction & Solar Amber Shift)
    if (fluctuationMatRef.current) {
      fluctuationMatRef.current.uniforms.uTime.value = time;
      fluctuationMatRef.current.uniforms.uBreathPhase.value = breath;
      fluctuationMatRef.current.uniforms.uExcitation.value = excitation;
      fluctuationMatRef.current.uniforms.uAttention.value = attention;
      fluctuationMatRef.current.uniforms.uTransition.value = transition;
    }

    // 5. Kinetic Particle Time Accumulator
    particleTimeAccumulator.current += delta * speedMult * (1.0 + excitation * 1.6);

    // 6. Mid-Field Reactive Particles
    if (midDustMatRef.current) {
      midDustMatRef.current.uniforms.uTime.value = particleTimeAccumulator.current;
      midDustMatRef.current.uniforms.uMouseWorld.value.set(
        mouseWorld[0],
        mouseWorld[1],
        mouseWorld[2]
      );
      midDustMatRef.current.uniforms.uAttention.value = attention;
      midDustMatRef.current.uniforms.uExcitation.value = excitation;
      midDustMatRef.current.uniforms.uBreathPhase.value = breath;
      midDustMatRef.current.uniforms.uTransition.value = transition;

      // Energy-to-Structure ordering factor
      const act2Progress = store.act2Progress;
      const isPreview = store.isPreviewMode;
      const previewTime = store.previewTime;
      let order = 0.0;
      if (isPreview) {
        if (previewTime >= 20.0) {
          order = Math.min(1.0, (previewTime - 20.0) / 15.0);
        }
      } else {
        if (act2Progress >= 0.45) {
          order = Math.min(1.0, (act2Progress - 0.45) / 0.45);
        }
      }
      midDustMatRef.current.uniforms.uOrderProgress.value = order;
    }

    // 7. Foreground Lens Dust
    if (lensDustMatRef.current) {
      lensDustMatRef.current.uniforms.uTime.value = time;
    }

    // 8. Vector Blueprint Cartesian Grid
    if (vectorGridMatRef.current) {
      vectorGridMatRef.current.uniforms.uTime.value = time;
      vectorGridMatRef.current.uniforms.uGridReveal.value = transition;
    }
  });

  return (
    <group name="act-01-the-void">
      {/* 1. Deep Indigo Atmospheric Horizon Quad */}
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

      {/* 2. Layer 3: Deep-Space Background Particles */}
      <instancedMesh
        args={[undefined, undefined, DEEP_SPACE_COUNT]}
        renderOrder={-500}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-aOffset"
            args={[STATIC_DEEP_SPACE.offsets, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aScale"
            args={[STATIC_DEEP_SPACE.scales, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aPhase"
            args={[STATIC_DEEP_SPACE.phases, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aSpeed"
            args={[STATIC_DEEP_SPACE.speeds, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={deepSpaceMatRef}
          vertexShader={deepSpaceVertexShader}
          fragmentShader={deepSpaceFragmentShader}
          uniforms={deepSpaceUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* 3. Subtle Volumetric Atmosphere Light Shafts */}
      <mesh position={[0, 0, -0.6]} renderOrder={0}>
        <planeGeometry args={[7.5, 7.5]} />
        <shaderMaterial
          ref={volumetricGlowMatRef}
          vertexShader={volumetricGlowVertexShader}
          fragmentShader={volumetricGlowFragmentShader}
          uniforms={volumetricUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Cartesian Vector Blueprint Grid (Emerges as Singularity Forms) */}
      <mesh position={[0, 0, -0.05]} renderOrder={0.5}>
        <planeGeometry args={[6.0, 6.0]} />
        <shaderMaterial
          ref={vectorGridMatRef}
          vertexShader={vectorGridVertexShader}
          fragmentShader={vectorGridFragmentShader}
          uniforms={vectorGridUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Central Quantum Light Fluctuation (Morphs to Singularity) */}
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

      {/* 6. Layer 2: Mid-Field Reactive Quantum Particles */}
      <instancedMesh
        args={[undefined, undefined, MID_PARTICLE_COUNT]}
        renderOrder={2}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-aOffset"
            args={[STATIC_MID_DUST.offsets, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aScale"
            args={[STATIC_MID_DUST.scales, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aPhase"
            args={[STATIC_MID_DUST.phases, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aSpeed"
            args={[STATIC_MID_DUST.speeds, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={midDustMatRef}
          vertexShader={voidParticlesVertexShader}
          fragmentShader={voidParticlesFragmentShader}
          uniforms={midDustUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* 7. Layer 1: Foreground Defocused Lens Dust */}
      <instancedMesh
        args={[undefined, undefined, LENS_DUST_COUNT]}
        renderOrder={3}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-aOffset"
            args={[STATIC_LENS_DUST.offsets, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aScale"
            args={[STATIC_LENS_DUST.scales, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aPhase"
            args={[STATIC_LENS_DUST.phases, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aSpeed"
            args={[STATIC_LENS_DUST.speeds, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={lensDustMatRef}
          vertexShader={lensDustVertexShader}
          fragmentShader={lensDustFragmentShader}
          uniforms={lensDustUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
