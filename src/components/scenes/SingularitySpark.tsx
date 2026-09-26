'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { singularitySparkVertexShader } from '@/three/shaders/singularitySpark.vert';
import { singularitySparkFragmentShader } from '@/three/shaders/singularitySpark.frag';
import { useExperienceStore } from '@/store/experienceStore';

export function SingularitySpark() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAttention: { value: 0 },
      uExcitation: { value: 0 },
      uBreathPhase: { value: 0 },
      uSparkProgress: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();

    // Spark progress ramps up during Act II or transition
    // During Act II: full presence; during transition: smoothly approaches
    const act2Progress = store.act2Progress;
    const transitionProgress = store.transitionProgress;
    const sparkStrength = Math.max(transitionProgress, Math.min(1.0, act2Progress * 1.5));

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uAttention.value = store.attentionLevel;
      materialRef.current.uniforms.uExcitation.value = store.scrollEnergy;
      materialRef.current.uniforms.uBreathPhase.value = store.breathPhase;
      materialRef.current.uniforms.uSparkProgress.value = sparkStrength;
    }

    // Gentle axial breathing tilt
    if (meshRef.current) {
      meshRef.current.rotation.z = time * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={2}>
      {/* 3.2 x 3.2 quad encompassing the singularity core, Einstein ring, and outer corona */}
      <planeGeometry args={[3.2, 3.2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={singularitySparkVertexShader}
        fragmentShader={singularitySparkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
