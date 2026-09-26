'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';

export function ObserverDnaEngraving() {
  const groupRef = useRef<THREE.Group>(null);
  const helixPointsRef = useRef<THREE.Points>(null);
  const ringsRef = useRef<THREE.Group>(null);

  const { helixGeometry, ringGeometries } = useMemo(() => {
    // 1. Double Helical DNA Node Points (120 points)
    const count = 120;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColorA = new THREE.Color('#38bdf8'); // Cyan
    const baseColorB = new THREE.Color('#fde047'); // Gold

    for (let i = 0; i < count; i++) {
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const t = (i / count) * Math.PI * 6.0;
      const r = 1.05 + Math.sin(t * 0.5) * 0.15;
      const x = Math.cos(t + strand) * r;
      const y = Math.sin(t + strand) * r;
      const z = (i / count - 0.5) * 0.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = strand === 0 ? baseColorA : baseColorB;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const hGeom = new THREE.BufferGeometry();
    hGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    hGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 2. Four Sacred Codon Ring Radii (VOID, SING, MATT, DISP)
    const codonRadii = [0.88, 1.10, 1.34, 1.618];
    const rGeoms = codonRadii.map((rad) => new THREE.RingGeometry(rad, rad + 0.012, 64));

    return { helixGeometry: hGeom, ringGeometries: rGeoms };
  }, []);

  useFrame((state, delta) => {
    const store = useExperienceStore.getState();
    const ceremonyActive = store.ceremonyActive;
    const engravingProg = store.dnaEngravingProgress;
    const ceremonyProg = store.ceremonyProgress;
    const isVisible = ceremonyActive || engravingProg > 0.01 || ceremonyProg > 0.01;

    if (groupRef.current) {
      groupRef.current.visible = isVisible;
      // Soft breathing alignment
      const scale = (0.85 + engravingProg * 0.25) * (1.0 + Math.sin(state.clock.elapsedTime * 2.0) * 0.02);
      groupRef.current.scale.set(scale, scale, scale);
    }

    if (helixPointsRef.current) {
      helixPointsRef.current.rotation.z += delta * 0.45;
      const mat = helixPointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(0.0, 0.85, engravingProg);
      }
    }

    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        child.rotation.z += delta * (0.2 + idx * 0.08) * dir;
      });
    }
  });

  return (
    <group ref={groupRef} name="observer-dna-engraving" position={[0, 0, 0]}>
      {/* 1. Double Helical DNA Sacred Codon Nodes */}
      <points ref={helixPointsRef} geometry={helixGeometry} renderOrder={10}>
        <pointsMaterial
          size={0.045}
          vertexColors={true}
          transparent={true}
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Concentric Codon Planetary Engraving Halos */}
      <group ref={ringsRef}>
        {ringGeometries.map((geom, idx) => (
          <mesh key={idx} geometry={geom} renderOrder={9}>
            <meshBasicMaterial
              color={idx === 3 ? '#fde047' : '#38bdf8'}
              transparent={true}
              opacity={0.35 + idx * 0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
