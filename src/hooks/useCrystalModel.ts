'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface CrystalGeometryResult {
  geometry: THREE.BufferGeometry;
  isProcedural: boolean;
}

/**
 * Hook for Act III Crystal Monolith Architecture.
 * Prepares procedural fallback geometry and supports dynamic GLTF mesh substitution.
 */
export function useCrystalModel(customRadius = 1.45, detail = 0): CrystalGeometryResult {
  const proceduralGeometry = useMemo(() => {
    // Regular icosahedron based on Golden Ratio
    const geom = new THREE.IcosahedronGeometry(customRadius, detail);
    geom.computeVertexNormals();
    return geom;
  }, [customRadius, detail]);

  return {
    geometry: proceduralGeometry,
    isProcedural: true,
  };
}
