'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { shatterVertexShader } from '@/three/shaders/shatter.vert';
import { shatterFragmentShader } from '@/three/shaders/shatter.frag';

interface FacetDefinition {
  id: number;
  geometry: THREE.BufferGeometry;
  centroid: THREE.Vector3;
  normal: THREE.Vector3;
  outwardDirection: THREE.Vector3;
  rotationAxis: THREE.Vector3;
  threshold: number;
  maxDistance: number;
  maxRotation: number;
}

interface SingleFacetProps {
  facet: FacetDefinition;
}

function SingleFacetMesh({ facet }: SingleFacetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFractureProgress: { value: 0 },
      uKeyLightDir: { value: new THREE.Vector3(4.0, 5.0, 3.5).normalize() },
      uRimLightDir: { value: new THREE.Vector3(-4.0, 2.5, -3.5).normalize() },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const fractureProgress = store.fractureProgress;
    const facetMemory = store.facetMemoryProgress;

    // Time Dilation Moment: facet velocity decelerates 100% -> 20%
    const facetVelocityScale = 1.0 - facetMemory * 0.80;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uFractureProgress.value = fractureProgress;
    }

    if (meshRef.current) {
      // Golden Ratio Fracture Wave:
      // Propagates from internal quantum core -> fault planes -> facet boundaries -> detachment
      let localProg = 0;
      if (fractureProgress > facet.threshold) {
        localProg = THREE.MathUtils.clamp(
          (fractureProgress - facet.threshold) / (1.0 - facet.threshold),
          0.0,
          1.0
        );
      }

      // Smoothstep physics curve with Phase 9.15 memory drift:
      // 0.0 = perfect monolith
      // 0.3 = hairline separation
      // 0.6 = facets visibly detach
      // 0.9 = complete icosahedron breakup
      // 1.0 = suspended memory drift (velocity slows to 20%)
      const ease = THREE.MathUtils.smoothstep(localProg, 0, 1);
      const memoryDrift = Math.sin(time * 0.5 + facet.id * 1.618) * 0.025 * facetMemory;
      const currentDist = (ease * facet.maxDistance + memoryDrift) * (1.0 - 0.05 * (1.0 - facetVelocityScale));

      // Position: Centroid + outward direction along normal and cleavage slip
      meshRef.current.position.copy(facet.centroid).addScaledVector(facet.outwardDirection, currentDist);

      // Rotation: Gentle, dignified angular velocity preserving golden orientation
      const currentAngle = (Math.sin(ease * Math.PI * 0.5) * facet.maxRotation) + Math.cos(time * 0.35 + facet.id) * 0.015 * facetMemory;
      meshRef.current.quaternion.setFromAxisAngle(facet.rotationAxis, currentAngle);
    }
  });

  return (
    <mesh ref={meshRef} geometry={facet.geometry} renderOrder={7}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={shatterVertexShader}
        fragmentShader={shatterFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={true}
      />
    </mesh>
  );
}

export function CrystalShatter() {
  const groupRef = useRef<THREE.Group>(null);

  // Decompose icosahedron into 20 distinct, congruent triangular facets
  const facets: FacetDefinition[] = useMemo(() => {
    const PHI = 1.6180339887;
    const faultPlanes = [
      new THREE.Vector3(1, PHI, 0).normalize(),
      new THREE.Vector3(1, -PHI, 0).normalize(),
      new THREE.Vector3(0, 1, PHI).normalize(),
      new THREE.Vector3(0, 1, -PHI).normalize(),
      new THREE.Vector3(PHI, 0, 1).normalize(),
      new THREE.Vector3(-PHI, 0, 1).normalize(),
    ];

    const baseGeom = new THREE.IcosahedronGeometry(1.45, 0).toNonIndexed();
    const posAttr = baseGeom.getAttribute('position');
    const facetList: FacetDefinition[] = [];

    // PRNG for consistent, reproducible micro-variations
    let s = 48271;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    for (let f = 0; f < 20; f++) {
      const i0 = f * 3;
      const i1 = f * 3 + 1;
      const i2 = f * 3 + 2;

      const p0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
      const p1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
      const p2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

      // Centroid and face normal
      const centroid = new THREE.Vector3()
        .add(p0)
        .add(p1)
        .add(p2)
        .divideScalar(3.0);
      const normal = centroid.clone().normalize();

      // Localize vertices around centroid (0, 0, 0)
      const lp0 = p0.clone().sub(centroid);
      const lp1 = p1.clone().sub(centroid);
      const lp2 = p2.clone().sub(centroid);

      // Construct dedicated BufferGeometry with barycentric coords for cleavage edge detection
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array([
        lp0.x, lp0.y, lp0.z,
        lp1.x, lp1.y, lp1.z,
        lp2.x, lp2.y, lp2.z,
      ]);
      const normals = new Float32Array([
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
      ]);
      const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1]);
      const barycentric = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
      ]);

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.setAttribute('aBarycentric', new THREE.BufferAttribute(barycentric, 3));

      // Determine nearest golden-ratio fault plane
      let minPlaneDist = Infinity;
      let nearestPlane = faultPlanes[0];
      for (const plane of faultPlanes) {
        const d = Math.abs(centroid.dot(plane));
        if (d < minPlaneDist) {
          minPlaneDist = d;
          nearestPlane = plane;
        }
      }

      // Fracture threshold: facets nearest to fault planes separate first
      const threshold = THREE.MathUtils.lerp(0.04, 0.28, Math.min(1.0, minPlaneDist * 2.5));

      // Outward impulse: combination of facet normal + subtle cleavage slip
      const slipDir = new THREE.Vector3().crossVectors(nearestPlane, normal).normalize();
      const outward = normal.clone().multiplyScalar(0.90).addScaledVector(slipDir, 0.10).normalize();

      // Rotation axis: perpendicular to normal and cleavage plane
      const rotAxis = new THREE.Vector3().crossVectors(normal, nearestPlane).normalize();
      if (rotAxis.lengthSq() < 0.1) {
        rotAxis.set(0, 1, 0);
      }

      const maxDist = 1.15 + rng() * 0.35;
      const maxRot = 0.22 + rng() * 0.12; // ~12° to 20° dignified tilt

      facetList.push({
        id: f,
        geometry: geom,
        centroid,
        normal,
        outwardDirection: outward,
        rotationAxis: rotAxis,
        threshold,
        maxDistance: maxDist,
        maxRotation: maxRot,
      });
    }

    baseGeom.dispose();
    return facetList;
  }, []);

  useFrame(() => {
    const fracture = useExperienceStore.getState().fractureProgress;
    if (groupRef.current) {
      groupRef.current.visible = fracture > 0.01;
    }
  });

  return (
    <group ref={groupRef} name="crystal-shatter-system">
      {facets.map((facet) => (
        <SingleFacetMesh key={`facet-${facet.id}`} facet={facet} />
      ))}
    </group>
  );
}
