'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';
import { facetMemoryVertexShader } from '@/three/shaders/facetMemory.vert';
import { facetMemoryFragmentShader } from '@/three/shaders/facetMemory.frag';
import { photonLeakageVertexShader } from '@/three/shaders/photonLeakage.vert';
import { photonLeakageFragmentShader } from '@/three/shaders/photonLeakage.frag';

interface FaceMeta {
  centroid: THREE.Vector3;
  outwardDirection: THREE.Vector3;
  threshold: number;
  maxDistance: number;
}

interface AdjacencyPair {
  faceA: number;
  faceB: number;
  seed: number;
}

const PHOTON_STREAM_COUNT = 90;

export function FacetMemoryField() {
  const groupRef = useRef<THREE.Group>(null);
  const lineMeshRef = useRef<THREE.LineSegments>(null);
  const lineGeomRef = useRef<THREE.BufferGeometry>(null);
  const lineMatRef = useRef<THREE.ShaderMaterial>(null);

  const streamMeshRef = useRef<THREE.Points>(null);
  const streamGeomRef = useRef<THREE.BufferGeometry>(null);
  const streamMatRef = useRef<THREE.ShaderMaterial>(null);

  // 1. Calculate icosahedron faces and the 30 unique adjacency pairs
  const { faces, adjacencyPairs } = useMemo(() => {
    const PHI = 1.6180339887;
    const faultPlanes = [
      new THREE.Vector3(1, PHI, 0).normalize(),
      new THREE.Vector3(1, -PHI, 0).normalize(),
      new THREE.Vector3(0, 1, PHI).normalize(),
      new THREE.Vector3(0, 1, -PHI).normalize(),
      new THREE.Vector3(PHI, 0, 1).normalize(),
      new THREE.Vector3(-PHI, 0, 1).normalize(),
    ];

    const baseGeom = new THREE.IcosahedronGeometry(1.45, 0);
    const posAttr = baseGeom.getAttribute('position');
    const indexAttr = baseGeom.getIndex();

    const faceList: FaceMeta[] = [];
    const faceVertexIndices: [number, number, number][] = [];

    // Extract faces from index
    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i += 3) {
        const i0 = indexAttr.getX(i);
        const i1 = indexAttr.getX(i + 1);
        const i2 = indexAttr.getX(i + 2);

        faceVertexIndices.push([i0, i1, i2]);

        const p0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
        const p1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
        const p2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

        const centroid = new THREE.Vector3().add(p0).add(p1).add(p2).divideScalar(3.0);
        const normal = centroid.clone().normalize();

        let minPlaneDist = Infinity;
        let nearestPlane = faultPlanes[0];
        for (const plane of faultPlanes) {
          const d = Math.abs(centroid.dot(plane));
          if (d < minPlaneDist) {
            minPlaneDist = d;
            nearestPlane = plane;
          }
        }

        const threshold = THREE.MathUtils.lerp(0.04, 0.28, Math.min(1.0, minPlaneDist * 2.5));
        const slipDir = new THREE.Vector3().crossVectors(nearestPlane, normal).normalize();
        const outward = normal.clone().multiplyScalar(0.90).addScaledVector(slipDir, 0.10).normalize();

        faceList.push({
          centroid,
          outwardDirection: outward,
          threshold,
          maxDistance: 1.25,
        });
      }
    }

    // Find the 30 adjacent face pairs sharing an edge (2 shared vertex indices)
    const pairs: AdjacencyPair[] = [];
    for (let a = 0; a < faceVertexIndices.length; a++) {
      for (let b = a + 1; b < faceVertexIndices.length; b++) {
        const fA = faceVertexIndices[a];
        const fB = faceVertexIndices[b];

        let sharedCount = 0;
        if (fB.includes(fA[0])) sharedCount++;
        if (fB.includes(fA[1])) sharedCount++;
        if (fB.includes(fA[2])) sharedCount++;

        if (sharedCount === 2) {
          pairs.push({
            faceA: a,
            faceB: b,
            seed: (a * 7 + b * 13) % 100 / 100,
          });
        }
      }
    }

    baseGeom.dispose();
    return { faces: faceList, adjacencyPairs: pairs };
  }, []);

  // 2. Pre-allocate line buffers (30 pairs * 2 vertices = 60 vertices)
  const { linePositions, lineCoords, lineSeeds } = useMemo(() => {
    const pairCount = adjacencyPairs.length;
    const pos = new Float32Array(pairCount * 2 * 3);
    const coords = new Float32Array(pairCount * 2);
    const seeds = new Float32Array(pairCount * 2);

    for (let i = 0; i < pairCount; i++) {
      coords[i * 2] = 0.0;
      coords[i * 2 + 1] = 1.0;
      seeds[i * 2] = adjacencyPairs[i].seed;
      seeds[i * 2 + 1] = adjacencyPairs[i].seed;
    }

    return { linePositions: pos, lineCoords: coords, lineSeeds: seeds };
  }, [adjacencyPairs]);

  // 3. Pre-allocate inter-facet photon stream particles
  const { streamPositions, streamVelocities, streamSeeds, streamSpeeds, streamSizes } = useMemo(() => {
    const pos = new Float32Array(PHOTON_STREAM_COUNT * 3);
    const vel = new Float32Array(PHOTON_STREAM_COUNT * 3);
    const sd = new Float32Array(PHOTON_STREAM_COUNT);
    const sp = new Float32Array(PHOTON_STREAM_COUNT);
    const sz = new Float32Array(PHOTON_STREAM_COUNT);

    let s = 19283;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    for (let i = 0; i < PHOTON_STREAM_COUNT; i++) {
      sd[i] = rng();
      sp[i] = 0.8 + rng() * 1.2;
      sz[i] = 1.5 + rng() * 2.0;

      // Dummy initial velocity vector
      vel[i * 3] = (rng() - 0.5) * 2;
      vel[i * 3 + 1] = (rng() - 0.5) * 2;
      vel[i * 3 + 2] = (rng() - 0.5) * 2;
    }

    return {
      streamPositions: pos,
      streamVelocities: vel,
      streamSeeds: sd,
      streamSpeeds: sp,
      streamSizes: sz,
    };
  }, []);

  const lineUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFacetMemoryProgress: { value: 0 },
      uCollapseProgress: { value: 0 },
    }),
    []
  );

  const streamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFractureProgress: { value: 0 },
      uCollapseProgress: { value: 0 },
    }),
    []
  );

  // Dynamic frame loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const fracture = store.fractureProgress;
    const facetMemory = store.facetMemoryProgress;
    const collapse = store.collapseProgress;

    const isActive = fracture > 0.05 || facetMemory > 0.001 || collapse > 0.001;
    if (groupRef.current) {
      groupRef.current.visible = isActive;
    }

    if (!isActive) return;

    if (lineMatRef.current) {
      lineMatRef.current.uniforms.uTime.value = time;
      lineMatRef.current.uniforms.uFacetMemoryProgress.value = facetMemory;
      lineMatRef.current.uniforms.uCollapseProgress.value = collapse;
    }

    if (streamMatRef.current) {
      streamMatRef.current.uniforms.uTime.value = time;
      // Dilation slows photon stream velocity: 100% -> 30%, freezes at 90% collapse
      const freezeFactor = collapse >= 0.90 ? Math.max(0, 1.0 - (collapse - 0.90) / 0.10) : 1.0;
      const dilation = (1.0 - facetMemory * 0.70) * freezeFactor;
      streamMatRef.current.uniforms.uFractureProgress.value = facetMemory * dilation;
      if (streamMatRef.current.uniforms.uCollapseProgress) {
        streamMatRef.current.uniforms.uCollapseProgress.value = collapse;
      }
    }

    // Dynamic calculation of the 20 separated facet centroids
    const currentPositions: THREE.Vector3[] = [];
    for (let f = 0; f < faces.length; f++) {
      const face = faces[f];
      let localProg = 0;
      if (fracture > face.threshold) {
        localProg = THREE.MathUtils.clamp(
          (fracture - face.threshold) / (1.0 - face.threshold),
          0.0,
          1.0
        );
      }
      const ease = THREE.MathUtils.smoothstep(localProg, 0, 1);
      const dist = ease * face.maxDistance;
      const pos = face.centroid.clone().addScaledVector(face.outwardDirection, dist);
      currentPositions.push(pos);
    }

    // Update 30 line connections in BufferGeometry
    if (lineGeomRef.current) {
      const posAttr = lineGeomRef.current.getAttribute('position') as THREE.BufferAttribute;
      if (posAttr) {
        for (let i = 0; i < adjacencyPairs.length; i++) {
          const pair = adjacencyPairs[i];
          const pA = currentPositions[pair.faceA];
          const pB = currentPositions[pair.faceB];

          const v0 = i * 6;
          const v1 = i * 6 + 3;

          posAttr.array[v0] = pA.x;
          posAttr.array[v0 + 1] = pA.y;
          posAttr.array[v0 + 2] = pA.z;

          posAttr.array[v1] = pB.x;
          posAttr.array[v1 + 1] = pB.y;
          posAttr.array[v1 + 2] = pB.z;
        }
        posAttr.needsUpdate = true;
      }
    }

    // Update photon streams between facets:
    // When collapse is active, stream direction reverses toward center core (0,0,0)
    if (streamGeomRef.current && (facetMemory > 0.01 || collapse > 0.01)) {
      const posAttr = streamGeomRef.current.getAttribute('position') as THREE.BufferAttribute;
      if (posAttr) {
        const freezeFactor = collapse >= 0.90 ? Math.max(0, 1.0 - (collapse - 0.90) / 0.10) : 1.0;
        for (let i = 0; i < PHOTON_STREAM_COUNT; i++) {
          const pairIndex = i % adjacencyPairs.length;
          const pair = adjacencyPairs[pairIndex];
          const pA = currentPositions[pair.faceA];
          const pB = currentPositions[pair.faceB];

          const speed = streamSpeeds[i] * freezeFactor;
          const seed = streamSeeds[i];

          if (collapse > 0.001) {
            // Reversing stream direction toward quantum core (0,0,0)
            const midPoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
            // Cycle flows backward from facet midpoint into (0,0,0)
            const collapseCycle = (1.0 - (time * 0.8 * speed + seed) % 1.0);
            const targetPos = midPoint.multiplyScalar(collapseCycle * (1.0 - collapse * 0.85));

            posAttr.array[i * 3] = targetPos.x;
            posAttr.array[i * 3 + 1] = targetPos.y;
            posAttr.array[i * 3 + 2] = targetPos.z;
          } else {
            // Normal inter-facet stream
            const cycle = (time * 0.4 * speed + seed) % 1.0;
            const px = THREE.MathUtils.lerp(pA.x, pB.x, cycle);
            const py = THREE.MathUtils.lerp(pA.y, pB.y, cycle);
            const pz = THREE.MathUtils.lerp(pA.z, pB.z, cycle);

            posAttr.array[i * 3] = px;
            posAttr.array[i * 3 + 1] = py;
            posAttr.array[i * 3 + 2] = pz;
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef} name="facet-memory-field" renderOrder={7}>
      {/* 1. 30 Mathematical Memory Entanglement Threads */}
      <lineSegments ref={lineMeshRef}>
        <bufferGeometry ref={lineGeomRef}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-aLineCoord" args={[lineCoords, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[lineSeeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={lineMatRef}
          vertexShader={facetMemoryVertexShader}
          fragmentShader={facetMemoryFragmentShader}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Internal Inter-Facet Photon Streams */}
      <points ref={streamMeshRef}>
        <bufferGeometry ref={streamGeomRef}>
          <bufferAttribute attach="attributes-position" args={[streamPositions, 3]} />
          <bufferAttribute attach="attributes-aVelocity" args={[streamVelocities, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[streamSeeds, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[streamSpeeds, 1]} />
          <bufferAttribute attach="attributes-aSize" args={[streamSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={streamMatRef}
          vertexShader={photonLeakageVertexShader}
          fragmentShader={photonLeakageFragmentShader}
          uniforms={streamUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
