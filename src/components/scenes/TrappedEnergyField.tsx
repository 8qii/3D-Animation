'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';

const PARTICLE_COUNT = 320;

const trappedVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uTension;
  uniform float uStillness;
  uniform float uPixelRatio;

  attribute vec3 aSeed;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float tension = clamp(uTension, 0.0, 1.0);
    // Phase 8.75 Final Stillness: Particle movement: 100% -> 5%
    float motionScale = mix(1.0, 0.05, clamp(uStillness, 0.0, 1.0));
    float t = uTime * motionScale;

    // 1. Magnetic Lorentz Orbital Confinement
    // Rotation around diagonal axis
    float speed = (1.2 + tension * 4.5) * (0.4 + aSeed.x * 0.8);
    float angle = t * speed + aSeed.y * 6.28318;
    
    // Base toroidal / spherical orbit inside the crystal
    float radius = mix(0.18, 1.05, aSeed.z) * (1.0 - tension * 0.15); // Compresses inward under tension
    
    vec3 orbitPos = vec3(
      cos(angle + aSeed.z * 3.14) * radius,
      sin(angle * 1.3 + aSeed.x * 3.14) * radius * 0.85,
      sin(angle + aSeed.y * 3.14) * radius
    );

    // 2. High-Energy Brownian Micro-Agitation
    vec3 jitter = vec3(
      sin(t * (32.0 + tension * 40.0) + aSeed.x * 100.0),
      cos(t * (36.0 + tension * 40.0) + aSeed.y * 100.0),
      sin(t * (40.0 + tension * 40.0) + aSeed.z * 100.0)
    ) * (0.015 + tension * 0.08) * motionScale;

    vec3 finalPos = orbitPos + jitter;

    // Strict geometric boundary containment (inside icosahedron radius 1.25)
    float currentRadius = length(finalPos);
    if (currentRadius > 1.20) {
      finalPos = normalize(finalPos) * 1.20;
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size scales with tension and distance attenuation
    float baseSize = aSize * (1.0 + tension * 1.8);
    gl_PointSize = baseSize * uPixelRatio * (28.0 / -mvPosition.z);

    // Color transition: from golden amber to incandescent solar white/cyan under extreme tension
    vec3 colAmber = vec3(0.98, 0.65, 0.18);
    vec3 colCyan  = vec3(0.38, 0.85, 1.00);
    vec3 colWhite = vec3(1.00, 0.98, 0.92);

    float colorMix = sin(uTime * 3.0 + aSeed.x * 12.0) * 0.5 + 0.5;
    vec3 baseCol = mix(colAmber, colCyan, colorMix * 0.5);
    vColor = mix(baseCol, colWhite, tension * 0.65);

    // Alpha surges with tension
    vAlpha = (0.25 + tension * 0.70) * (0.6 + aSeed.y * 0.4);
  }
`;

const trappedFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular Gaussian point particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float core = exp(-dist * dist * 18.0);
    float halo = exp(-dist * dist * 6.0) * 0.4;
    float intensity = core + halo;

    gl_FragColor = vec4(vColor * (1.2 + core * 1.5), vAlpha * intensity);
  }
`;

function createPrng(initialSeed: number) {
  let s = initialSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function TrappedEnergyField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, sizes } = useMemo(() => {
    const rng = createPrng(7721);
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const sd = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx3 = i * 3;
      // Initial seeds uniformly distributed in unit cube
      sd[idx3] = rng();
      sd[idx3 + 1] = rng();
      sd[idx3 + 2] = rng();

      // Dummy initial positions (calculated dynamically in vertex shader)
      pos[idx3] = 0;
      pos[idx3 + 1] = 0;
      pos[idx3 + 2] = 0;

      sz[i] = 1.2 + rng() * 2.2;
    }

    return { positions: pos, seeds: sd, sizes: sz };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTension: { value: 0 },
      uStillness: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const tension = useExperienceStore.getState().tensionProgress;
    const stillness = useExperienceStore.getState().stillnessFactor;
    const materialLock = useExperienceStore.getState().materialLockProgress;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uTension.value = tension;
      materialRef.current.uniforms.uStillness.value = stillness;
    }

    if (pointsRef.current) {
      // Visible once material lock begins and intensifies during tension
      pointsRef.current.visible = materialLock > 0.2;
    }
  });

  return (
    <points ref={pointsRef} renderOrder={7}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={trappedVertexShader}
        fragmentShader={trappedFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
