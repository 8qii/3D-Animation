import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';

/**
 * Centralized Asset Preloader & Cache Manager
 * Prepares the pipeline for 3D GLB assets, HDR environment maps, and textures.
 */
export const assetLoader = {
  /**
   * Preload a GLTF/GLB model into Drei cache.
   */
  preloadModel: (url: string) => {
    try {
      useGLTF.preload(url);
    } catch (e) {
      console.warn(`[AssetLoader] Failed to preload model ${url}:`, e);
    }
  },

  /**
   * Preload a texture into Drei cache.
   */
  preloadTexture: (url: string) => {
    try {
      useTexture.preload(url);
    } catch (e) {
      console.warn(`[AssetLoader] Failed to preload texture ${url}:`, e);
    }
  },

  /**
   * Clear Three.js texture cache and dispose geometries/materials cleanly.
   */
  cleanDisposal: (object: THREE.Object3D) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
  },
};
