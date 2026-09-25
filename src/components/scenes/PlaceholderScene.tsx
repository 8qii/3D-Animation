'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrystalMaterial } from '@/three/materials/CrystalMaterial';
import { particlesVertexShader } from '@/three/shaders/particles.vert';
import { particlesFragmentShader } from '@/three/shaders/particles.frag';
import { useSceneManager } from '@/hooks/useSceneManager';

const PARTICLE_COUNT = 1800;

// Deterministic PRNG to generate particle buffers once outside render for pure idempotency
function generateParticleData(count: number) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const speeds = new Float32Array(count);
  const randoms = new Float32Array(count);

  let seed = 1337;
  const pseudoRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const radius = 1.2 + pseudoRandom() * 4.5;
    const theta = pseudoRandom() * Math.PI * 2;
    const phi = Math.acos(2 * pseudoRandom() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    scales[i] = 0.5 + pseudoRandom() * 1.5;
    speeds[i] = 0.5 + pseudoRandom() * 1.5;
    randoms[i] = pseudoRandom();
  }

  return { positions, scales, speeds, randoms };
}

const STATIC_PARTICLES = generateParticleData(PARTICLE_COUNT);

export function PlaceholderScene() {
  const crystalMeshRef = useRef<THREE.Mesh>(null);
  const outerWireframeRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const { sceneIndex } = useSceneManager();

  // Custom Crystal Material instance
  const crystalMaterial = useMemo(() => {
    return new CrystalMaterial({
      colorA: '#090d16',
      colorB: '#0ea5e9',
      glowColor: '#a855f7',
      intensity: 2.2,
      distortion: 0.08,
    });
  }, []);

  // Frame animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update custom shader uniforms via material ref/instance
    crystalMaterial.update(time);
    if (particleMaterialRef.current) {
      particleMaterialRef.current.uniforms.uTime.value = time;
    }

    // Organic rotation of the crystal monolith
    if (crystalMeshRef.current) {
      crystalMeshRef.current.rotation.y += delta * 0.25;
      crystalMeshRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
    }

    // Counter-rotation of outer orbital cage
    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.y -= delta * 0.15;
      outerWireframeRef.current.rotation.z += delta * 0.1;
    }

    // Pulsing inner energetic core
    if (innerCoreRef.current) {
      const scale = 1 + Math.sin(time * 2.5) * 0.08;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }

    // Particle constellation rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;
    }

    // Dynamic scene-based transformation
    if (groupRef.current) {
      const targetY = sceneIndex === 2 ? 0.8 : sceneIndex === 1 ? -0.2 : 0;
      const targetScale = sceneIndex === 1 ? 1.15 : sceneIndex === 2 ? 1.3 : 1.0;

      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        targetY,
        2.5,
        delta
      );

      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.damp(currentScale, targetScale, 2.0, delta);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <group ref={groupRef} name="atmospheric-scene">
      {/* Central Faceted Crystal Monolith */}
      <mesh ref={crystalMeshRef} material={crystalMaterial} castShadow receiveShadow>
        <icosahedronGeometry args={[1.4, 2]} />
      </mesh>

      {/* Outer Delicate Wireframe Halo */}
      <mesh ref={outerWireframeRef}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Glowing Singularity Core */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating Procedural Swirling Particle Field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[STATIC_PARTICLES.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aScale"
            args={[STATIC_PARTICLES.scales, 1]}
          />
          <bufferAttribute
            attach="attributes-aSpeed"
            args={[STATIC_PARTICLES.speeds, 1]}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            args={[STATIC_PARTICLES.randoms, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMaterialRef}
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
