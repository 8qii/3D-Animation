'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/store/experienceStore';

const PARTICLE_COUNT = 140;

const wakeVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAttentionStrength;
  uniform float uHiddenDiscovery;

  attribute float aBirth;
  attribute float aLifetime;
  attribute vec3 aVelocity;
  attribute float aSize;

  varying float vLife;
  varying vec3 vColor;

  void main() {
    float age = uTime - aBirth;
    float progress = clamp(age / aLifetime, 0.0, 1.0);
    vLife = 1.0 - progress;

    if (age < 0.0 || age > aLifetime) {
      gl_Position = vec4(9999.0, 9999.0, 9999.0, 1.0);
      return;
    }

    // Gravitational wake expansion and outward curl
    vec3 currentPos = position + aVelocity * age * 0.45;
    float curlAngle = age * 3.5;
    currentPos.x += sin(curlAngle) * 0.03 * progress;
    currentPos.y += cos(curlAngle) * 0.03 * progress;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuates over lifetime with subtle initial expansion
    float scaleProgress = sin(progress * 3.14159);
    gl_PointSize = (aSize * (0.8 + scaleProgress * 1.4) * (1.0 + uAttentionStrength * 0.6 + uHiddenDiscovery * 1.5)) * (200.0 / -mvPosition.z) * uPixelRatio;

    // Chromatic trail colors: Cyan electric spark -> Amber memory remnant -> Blue-white plasma under discovery
    vec3 cyanSpark = vec3(0.22, 0.82, 1.00);
    vec3 amberRemnant = vec3(1.00, 0.68, 0.22);
    vec3 discoveryWhite = vec3(0.85, 0.95, 1.00);

    vec3 baseColor = mix(cyanSpark, amberRemnant, progress * 0.85);
    vColor = mix(baseColor, discoveryWhite, uHiddenDiscovery);
  }
`;

const wakeFragmentShader = /* glsl */ `
  precision highp float;

  varying float vLife;
  varying vec3 vColor;

  void main() {
    // Soft circular photon mote with Gaussian glow
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float core = exp(-dist * dist * 18.0);
    float glow = exp(-dist * dist * 4.5);
    float alpha = (core * 0.85 + glow * 0.45) * pow(vLife, 1.6);

    gl_FragColor = vec4(vColor * (1.2 + core * 1.5), alpha * 0.85);
  }
`;

function createPrng(initialSeed: number) {
  let s = initialSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function ObserverWakeField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const headIdx = useRef(0);
  const lastSpawnTime = useRef(0);
  const lastPos = useRef(new THREE.Vector3(0, 0, 0));

  const geometry = useMemo(() => {
    const rng = createPrng(7721);
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const b = new Float32Array(PARTICLE_COUNT);
    const l = new Float32Array(PARTICLE_COUNT);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const s = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      b[i] = -999.0; // Inactive
      l[i] = 0.8 + rng() * 0.6;
      s[i] = 1.6 + rng() * 2.2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aBirth', new THREE.BufferAttribute(b, 1));
    geom.setAttribute('aLifetime', new THREE.BufferAttribute(l, 1));
    geom.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(s, 1));

    return geom;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio) : 1 },
      uAttentionStrength: { value: 0 },
      uHiddenDiscovery: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const birthAttr = geom.getAttribute('aBirth') as THREE.BufferAttribute;
    const lifeAttr = geom.getAttribute('aLifetime') as THREE.BufferAttribute;
    const velAttr = geom.getAttribute('aVelocity') as THREE.BufferAttribute;

    const positions = posAttr.array as Float32Array;
    const births = birthAttr.array as Float32Array;
    const lifetimes = lifeAttr.array as Float32Array;
    const velocities = velAttr.array as Float32Array;

    const time = state.clock.getElapsedTime();
    const store = useExperienceStore.getState();
    const mouseWorld = store.mouseWorld;
    const attentionStrength = store.attentionStrength;
    const hiddenDiscovery = store.hiddenDiscoveryProgress;



    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uAttentionStrength.value = attentionStrength;
      materialRef.current.uniforms.uHiddenDiscovery.value = hiddenDiscovery;
    }

    const currentPos = new THREE.Vector3(mouseWorld[0], mouseWorld[1], mouseWorld[2]);
    const moveDist = currentPos.distanceTo(lastPos.current);

    // Spawn new photon wake motes when pointer moves or pulses gently in place
    const isMoving = moveDist > 0.02;
    const timeSinceLast = time - lastSpawnTime.current;

    if ((isMoving && timeSinceLast > 0.015) || timeSinceLast > 0.08) {
      lastSpawnTime.current = time;

      const idx = headIdx.current;
      headIdx.current = (headIdx.current + 1) % PARTICLE_COUNT;

      // Position with micro dispersion
      const spread = 0.035;
      positions[idx * 3] = currentPos.x + (Math.random() - 0.5) * spread;
      positions[idx * 3 + 1] = currentPos.y + (Math.random() - 0.5) * spread;
      positions[idx * 3 + 2] = currentPos.z + (Math.random() - 0.5) * spread;

      // Velocity opposes motion (gravitational wake) with gentle thermal divergence
      const moveVec = currentPos.clone().sub(lastPos.current).normalize();
      const wakeVel = moveVec.multiplyScalar(-0.15);
      wakeVel.x += (Math.random() - 0.5) * 0.12;
      wakeVel.y += (Math.random() - 0.5) * 0.12;
      wakeVel.z += (Math.random() - 0.5) * 0.12;

      velocities[idx * 3] = wakeVel.x;
      velocities[idx * 3 + 1] = wakeVel.y;
      velocities[idx * 3 + 2] = wakeVel.z;

      births[idx] = time;
      lifetimes[idx] = 0.9 + Math.random() * 0.6;

      lastPos.current.copy(currentPos);

      // Flag geometry attributes for GPU update
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const birthAttr = geometry.getAttribute('aBirth') as THREE.BufferAttribute;
      const velAttr = geometry.getAttribute('aVelocity') as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      birthAttr.needsUpdate = true;
      velAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={9}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={wakeVertexShader}
        fragmentShader={wakeFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
