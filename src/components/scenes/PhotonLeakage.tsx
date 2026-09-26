'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { photonLeakageVertexShader } from '@/three/shaders/photonLeakage.vert';
import { photonLeakageFragmentShader } from '@/three/shaders/photonLeakage.frag';
import { lightSheetsVertexShader } from '@/three/shaders/lightSheets.vert';
import { lightSheetsFragmentShader } from '@/three/shaders/lightSheets.frag';

const ESCAPING_PHOTON_COUNT = 420;

function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface LightSheetProps {
  quaternion: THREE.Quaternion;
  geometry: THREE.BufferGeometry;
}

function LightSheetMesh({ quaternion, geometry }: LightSheetProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFractureProgress: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const fracture = useExperienceStore.getState().fractureProgress;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uFractureProgress.value = fracture;
    }
  });

  return (
    <mesh geometry={geometry} quaternion={quaternion}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={lightSheetsVertexShader}
        fragmentShader={lightSheetsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function PhotonLeakage() {
  const groupRef = useRef<THREE.Group>(null);
  const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // 6 Golden-Ratio Fault Plane Normals
  const { planeNormals, planeQuaternions } = useMemo(() => {
    const PHI = 1.6180339887;
    const normals = [
      new THREE.Vector3(1, PHI, 0).normalize(),
      new THREE.Vector3(1, -PHI, 0).normalize(),
      new THREE.Vector3(0, 1, PHI).normalize(),
      new THREE.Vector3(0, 1, -PHI).normalize(),
      new THREE.Vector3(PHI, 0, 1).normalize(),
      new THREE.Vector3(-PHI, 0, 1).normalize(),
    ];

    const up = new THREE.Vector3(0, 0, 1);
    const quats = normals.map((n) => {
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(up, n);
      return q;
    });

    return { planeNormals: normals, planeQuaternions: quats };
  }, []);

  // Escaping Photons Particle Buffers
  const { positions, velocities, seeds, speeds, sizes } = useMemo(() => {
    const rng = createPrng(9421);
    const pos = new Float32Array(ESCAPING_PHOTON_COUNT * 3);
    const vel = new Float32Array(ESCAPING_PHOTON_COUNT * 3);
    const sd = new Float32Array(ESCAPING_PHOTON_COUNT);
    const sp = new Float32Array(ESCAPING_PHOTON_COUNT);
    const sz = new Float32Array(ESCAPING_PHOTON_COUNT);

    const tempV = new THREE.Vector3();
    const tempT1 = new THREE.Vector3();
    const tempT2 = new THREE.Vector3();

    for (let i = 0; i < ESCAPING_PHOTON_COUNT; i++) {
      const normalIndex = i % 6;
      const normal = planeNormals[normalIndex];

      // Form orthonormal basis on the fault plane
      if (Math.abs(normal.z) < 0.9) {
        tempT1.crossVectors(normal, new THREE.Vector3(0, 0, 1)).normalize();
      } else {
        tempT1.crossVectors(normal, new THREE.Vector3(0, 1, 0)).normalize();
      }
      tempT2.crossVectors(normal, tempT1).normalize();

      const angle = rng() * Math.PI * 2;
      const radialDir = new THREE.Vector3()
        .addScaledVector(tempT1, Math.cos(angle))
        .addScaledVector(tempT2, Math.sin(angle));

      // Velocity vectors stream outwards along fault plane with slight micro-fissure variation
      tempV.copy(radialDir).addScaledVector(normal, (rng() - 0.5) * 0.12).normalize();

      const idx3 = i * 3;
      // Seed positions along fissure rim (~1.2 - 1.45)
      pos[idx3] = radialDir.x * 0.4;
      pos[idx3 + 1] = radialDir.y * 0.4;
      pos[idx3 + 2] = radialDir.z * 0.4;

      vel[idx3] = tempV.x;
      vel[idx3 + 1] = tempV.y;
      vel[idx3 + 2] = tempV.z;

      sd[i] = rng();
      sp[i] = 0.5 + rng() * 1.2;
      sz[i] = 1.4 + rng() * 2.2;
    }

    return { positions: pos, velocities: vel, seeds: sd, speeds: sp, sizes: sz };
  }, [planeNormals]);

  // Uniforms
  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFractureProgress: { value: 0 },
    }),
    []
  );

  const sheetGeometry = useMemo(() => new THREE.RingGeometry(0.3, 3.6, 48), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const fracture = useExperienceStore.getState().fractureProgress;

    if (groupRef.current) {
      groupRef.current.visible = fracture > 0.001;
    }

    if (particleMaterialRef.current) {
      particleMaterialRef.current.uniforms.uTime.value = time;
      particleMaterialRef.current.uniforms.uFractureProgress.value = fracture;
    }
  });

  return (
    <group ref={groupRef} name="photon-leakage-system" renderOrder={8}>
      {/* 1. Escaping High-Energy Micro-Photons */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aVelocity" args={[velocities, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMaterialRef}
          vertexShader={photonLeakageVertexShader}
          fragmentShader={photonLeakageFragmentShader}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Collimated Golden-Ratio Planar Light Sheets */}
      {planeQuaternions.map((quat, idx) => (
        <LightSheetMesh key={`sheet-${idx}`} geometry={sheetGeometry} quaternion={quat} />
      ))}
    </group>
  );
}
