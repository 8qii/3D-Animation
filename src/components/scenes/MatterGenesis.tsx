'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  generateMatterNodes,
  generateMatterWireframe,
  generateMatterFacets,
} from '@/three/geometry/matterGenesisMath';
import { matterVerticesVertexShader } from '@/three/shaders/matterVertices.vert';
import { matterVerticesFragmentShader } from '@/three/shaders/matterVertices.frag';
import { matterWireframeVertexShader } from '@/three/shaders/matterWireframe.vert';
import { matterWireframeFragmentShader } from '@/three/shaders/matterWireframe.frag';
import { matterSurfaceVertexShader } from '@/three/shaders/matterSurface.vert';
import { matterSurfaceFragmentShader } from '@/three/shaders/matterSurface.frag';
import { InternalCaustics } from './InternalCaustics';
import { useExperienceStore } from '@/store/experienceStore';
import { clamp } from '@/utils/helpers';

export function MatterGenesis() {
  const groupRef = useRef<THREE.Group>(null);

  const nodeMatRef = useRef<THREE.ShaderMaterial>(null);
  const wireframeMatRef = useRef<THREE.ShaderMaterial>(null);
  const surfaceMatRef = useRef<THREE.ShaderMaterial>(null);

  const [causticProgress, setCausticProgress] = useState(0);

  // Pre-generate geometry buffers
  const nodes = useMemo(() => generateMatterNodes(1.45), []);
  const wireframe = useMemo(() => generateMatterWireframe(1.45), []);
  const facets = useMemo(() => generateMatterFacets(1.45), []);

  // Node Shader Uniforms
  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVertexProgress: { value: 0 },
      uExcitation: { value: 0 },
      uPixelRatio: {
        value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
      },
    }),
    []
  );

  // Wireframe Shader Uniforms
  const wireframeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVertexProgress: { value: 0 },
      uEdgeProgress: { value: 0 },
      uExcitation: { value: 0 },
    }),
    []
  );

  // Surface Shader Uniforms
  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVertexProgress: { value: 0 },
      uSurfaceProgress: { value: 0 },
      uExcitation: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();

    // Determine matter genesis progress from Act II timeline or scroll
    const isPreview = store.isPreviewMode;
    const previewTime = store.previewTime;
    const act2Progress = store.act2Progress;

    let matter = 0.0;
    if (isPreview) {
      // In 40s preview: Matter Genesis emerges from 20s to 40s
      if (previewTime >= 20.0) {
        matter = clamp((previewTime - 20.0) / 18.0, 0.0, 1.0);
      }
    } else {
      // In scroll: S in [0.30, 0.40]
      if (act2Progress >= 0.45) {
        matter = clamp((act2Progress - 0.45) / 0.50, 0.0, 1.0);
      }
    }

    // Stage 1: Sequential Vertex Awakening (0.0 -> 0.50)
    const vertexProgress = clamp(matter / 0.50, 0.0, 1.0);
    // Stage 2: Edge Formation Choreography (0.30 -> 0.85)
    const edgeProgress = clamp((matter - 0.30) / 0.55, 0.0, 1.0);
    // Stage 3: Surface Translucent Emergence (0.65 -> 1.00)
    const surfaceProgress = clamp((matter - 0.65) / 0.35, 0.0, 1.0);

    setCausticProgress(surfaceProgress);

    if (groupRef.current) {
      groupRef.current.visible = matter > 0.005;
      // Coordinate DNA: slow majestic tumble revealing all 3 orthogonal golden rectangles
      groupRef.current.rotation.x = time * 0.12;
      groupRef.current.rotation.y = time * 0.16;
      groupRef.current.rotation.z = time * 0.08;
    }

    if (nodeMatRef.current) {
      nodeMatRef.current.uniforms.uTime.value = time;
      nodeMatRef.current.uniforms.uVertexProgress.value = vertexProgress;
      nodeMatRef.current.uniforms.uExcitation.value = store.scrollEnergy;
    }

    if (wireframeMatRef.current) {
      wireframeMatRef.current.uniforms.uTime.value = time;
      wireframeMatRef.current.uniforms.uVertexProgress.value = vertexProgress;
      wireframeMatRef.current.uniforms.uEdgeProgress.value = edgeProgress;
      wireframeMatRef.current.uniforms.uExcitation.value = store.scrollEnergy;
    }

    if (surfaceMatRef.current) {
      surfaceMatRef.current.uniforms.uTime.value = time;
      surfaceMatRef.current.uniforms.uVertexProgress.value = vertexProgress;
      surfaceMatRef.current.uniforms.uSurfaceProgress.value = surfaceProgress;
      surfaceMatRef.current.uniforms.uExcitation.value = store.scrollEnergy;
    }
  });

  return (
    <group ref={groupRef} name="matter-genesis-framework" position={[0, 0, 0]}>
      {/* 0. Internal Crystal Caustic Light Paths & Density Web */}
      <InternalCaustics progress={causticProgress} />

      {/* 1. Translucent 20-Facet Obsidian Surface Precursor */}
      <mesh renderOrder={3}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[facets.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aNormal"
            args={[facets.normals, 3]}
          />
          <bufferAttribute
            attach="attributes-aBarycentric"
            args={[facets.barycentric, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={surfaceMatRef}
          vertexShader={matterSurfaceVertexShader}
          fragmentShader={matterSurfaceFragmentShader}
          uniforms={surfaceUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. 30 Animated Wireframe Edges Connecting Vertices */}
      <lineSegments renderOrder={4}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[wireframe.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aTarget"
            args={[wireframe.targets, 3]}
          />
          <bufferAttribute
            attach="attributes-aEdgeProgress"
            args={[wireframe.edgeProgress, 1]}
          />
          <bufferAttribute
            attach="attributes-aEdgeIndex"
            args={[wireframe.edgeIndices, 1]}
          />
          <bufferAttribute
            attach="attributes-aActivationThreshold"
            args={[wireframe.activationThresholds, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={wireframeMatRef}
          vertexShader={matterWireframeVertexShader}
          fragmentShader={matterWireframeFragmentShader}
          uniforms={wireframeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. 12 Golden Ratio Quantum Nodes with Sequential Awakening */}
      <instancedMesh
        args={[undefined, undefined, nodes.count]}
        renderOrder={5}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-aTarget"
            args={[nodes.targetPositions, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aVertexIndex"
            args={[nodes.vertexIndices, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={nodeMatRef}
          vertexShader={matterVerticesVertexShader}
          fragmentShader={matterVerticesFragmentShader}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
