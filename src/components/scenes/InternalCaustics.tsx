'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateAntipodalChords } from '@/three/geometry/matterGenesisMath';
import { internalCausticsVertexShader } from '@/three/shaders/internalCaustics.vert';
import { internalCausticsFragmentShader } from '@/three/shaders/internalCaustics.frag';
import { useExperienceStore } from '@/store/experienceStore';

interface InternalCausticsProps {
  progress: number;
}

export function InternalCaustics({ progress }: InternalCausticsProps) {
  const lineMatRef = useRef<THREE.ShaderMaterial>(null);
  const chords = useMemo(() => generateAntipodalChords(1.42), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uExcitation: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollEnergy = useExperienceStore.getState().scrollEnergy;

    if (lineMatRef.current) {
      lineMatRef.current.uniforms.uTime.value = time;
      lineMatRef.current.uniforms.uProgress.value = progress;
      lineMatRef.current.uniforms.uExcitation.value = scrollEnergy;
    }
  });

  return (
    <group name="internal-refractive-caustics">
      {/* 6 Antipodal Light Chords Linking Opposite Vertices */}
      <lineSegments renderOrder={2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[chords.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aChordIndex"
            args={[chords.chordIndices, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={lineMatRef}
          vertexShader={internalCausticsVertexShader}
          fragmentShader={internalCausticsFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
