# Project Roadmap & Milestones

This document establishes the strategic implementation plan for evolving the 3D cinematic interactive experience from its foundational architecture into a showcase production.

---

## Phase 1: Environment & Engine Foundation (Current)
- [x] Next.js App Router & TypeScript project initialization
- [x] Three.js, React Three Fiber (R3F), and Drei integration
- [x] Lenis smooth scroll engine synchronization
- [x] Post-processing pipeline (Bloom, DoF, Chromatic Aberration, Vignette)
- [x] Procedural custom GLSL shaders (Crystal monolith & floating particle field)
- [x] Zustand state architecture for decoupled frame loops
- [x] Fullscreen cinematic loader with progress tracking
- [x] Production documentation and project structure

---

## Phase 2: Blender Assets & Environment Modeling
- [ ] Model high-fidelity 3D assets in Blender (faceted core, architectural fragments, monolith rings)
- [ ] Optimize GLB pipelines:
  - Draco geometry compression
  - KTX2 / Basis Universal texture compression
  - Meshopt LOD (Level of Detail) generation
- [ ] Create HDR environment maps and reflection probes
- [ ] Integrate asset loader cache with progressive download stages

---

## Phase 3: Multi-Scene Cinematic Camera Choreography
- [ ] Design non-linear camera flight paths using GSAP `ScrollTrigger` and Bezier curves
- [ ] Implement camera transitions:
  - **Scene 01 (Genesis)**: Close-up macro awakening of the crystal core
  - **Scene 02 (Structure)**: Sweeping lateral orbit revealing geometric expansion
  - **Scene 03 (Ascension)**: Vertical ascending perspective into particle cosmos
- [ ] Dynamic Field of View (FOV) zooms during high-velocity camera moves

---

## Phase 4: Advanced Shaders & Visual FX
- [ ] Custom volumetric lighting and God-rays shader
- [ ] Audio-reactive frequency displacement on crystal vertices
- [ ] Curl noise vector field simulation for 10,000+ GPU particles via GPGPU / WebGL compute
- [ ] Screen-space reflections (SSR) and glass transmission absorption

---

## Phase 5: Spatial Sound Design
- [ ] Implement Web Audio API ambient sound engine
- [ ] Spatial audio emitters mapped to 3D object coordinates in R3F
- [ ] Dynamic frequency low-pass filters responding to scroll velocity
- [ ] Interactive UI micro-sounds on hover and scene transitions

---

## Phase 6: Production Polish & Cross-Device Optimization
- [ ] Hardware capability detection (GPU tiering: mobile / low / mid / ultra)
- [ ] Adaptive DPR scaling (auto-throttle when framerate dips below 55 FPS)
- [ ] Touch gestures and gyro accelerometer support for mobile devices
- [ ] Accessibility: reduced motion media queries disabling heavy camera shakes
- [ ] SEO, OpenGraph media, and performance audits (Lighthouse 95+)
