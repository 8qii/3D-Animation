# Cinematic 3D Interactive Web Experience

A high-end, production-ready interactive 3D web experience built with **Next.js (App Router)**, **React Three Fiber (R3F)**, **Three.js**, **GLSL Shaders**, **GSAP**, and **Lenis Smooth Scroll**.

Designed from the ground up to achieve an award-winning aesthetic, cinematic camera choreography, procedural particle dynamics, and robust post-processing.

---

## 🌟 Project Vision

To craft an immersive digital journey that blends cutting-edge WebGL graphics with seamless web interactions. The experience guides the user through multi-scene narrative milestones, where camera movement, lighting, custom shader materials, and real-time audio react intuitively to scroll progress and user input.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, TS) | Production SSR/SSG shell, dynamic client hydration, routing |
| **3D Engine** | Three.js & React Three Fiber (R3F) | WebGL scenegraph, render pipeline, declarative scene architecture |
| **3D Helpers** | @react-three/drei | Camera abstractions, loader cache, mathematical helpers |
| **Post-Processing** | @react-three/postprocessing | Bloom, Depth of Field, Chromatic Aberration, Vignette, Tone Mapping |
| **Animation** | GSAP (GreenSock) | Precision timeline sequencing, morphing, and easing |
| **Smooth Scroll** | Lenis | Hardware-accelerated virtual smooth scrolling synced with render loop |
| **State Management** | Zustand | Decoupled high-performance state (scroll, active scene, pointer, telemetry) |
| **Styling** | Tailwind CSS v4 | High-performance atomic CSS HUD and responsive overlays |
| **Tooling** | ESLint & Prettier | Code quality and standard formatting |

---

## 📂 Folder Architecture

```
src/
├── app/
│   ├── page.tsx               # Main client entry combining 3D Canvas & HUD overlay
│   ├── layout.tsx             # Root layout, HTML shell, and typography configuration
│   └── globals.css            # Tailwind CSS, Lenis scroll behavior, and dark theme
│
├── components/
│   ├── canvas/
│   │   ├── Experience.tsx     # Primary R3F Canvas wrapper with DPR, performance optimizations
│   │   ├── CameraRig.tsx      # Smooth camera lerping, pointer parallax & scroll binding
│   │   ├── Lights.tsx         # Multi-point cinematic lighting (key, fill, rim, ambient)
│   │   └── PostProcessing.tsx # Post-processing stack (Bloom, DoF, Vignette, Chromatic Aberration)
│   │
│   ├── scenes/
│   │   └── PlaceholderScene.tsx # Abstract crystal monolith with procedural particles & dynamic morph
│   │
│   └── ui/
│       └── LoadingScreen.tsx  # Fullscreen cinematic loader with progress counter & fade-out
│
├── three/
│   ├── shaders/
│   │   ├── crystal.vert.ts    # Procedural simplex noise vertex displacement & Fresnel
│   │   ├── crystal.frag.ts    # Faceted shimmer, chromatic gradient & rim emission
│   │   ├── particles.vert.ts  # Swirling orbital particle dynamics with distance attenuation
│   │   └── particles.frag.ts  # Soft circular glow particle shader
│   ├── materials/
│   │   └── CrystalMaterial.ts # Dedicated Three.js ShaderMaterial wrapper
│   └── loaders/
│       └── assetLoader.ts     # Preloading helpers & clean disposal mechanics for GLB/textures
│
├── hooks/
│   ├── useScrollProgress.ts   # Lenis smooth scroll synchronization with Zustand store
│   └── useSceneManager.ts     # Multi-scene timeline transitions & intra-scene progress
│
├── store/
│   └── experienceStore.ts     # Central Zustand store (scenes, loading, scroll, pointer, audio)
│
└── utils/
    └── helpers.ts             # Math utilities (damp, lerp, clamp, mapRange, getNormalizedPointer)

public/
├── models/                    # Placeholder for future Blender GLTF/GLB models
├── textures/                  # Placeholder for environment maps & noise textures
└── sounds/                    # Placeholder for ambient soundscapes & transition FX

docs/
├── architecture.md            # In-depth architectural guide and render loop design
├── roadmap.md                 # Multi-phase development roadmap
└── scene-design.md            # Creative direction, composition, and lighting specs
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18+ or v20+ / v22+
- **npm**, **pnpm**, or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 3D-Animation

# Install dependencies
npm install
```

### Development Commands

```bash
# Start Next.js development server
npm run dev

# Run TypeScript typecheck & ESLint
npm run lint

# Format code with Prettier
npm run format

# Create production build
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the cinematic experience.

---

## 🗺 Future Roadmap

- [ ] **Phase 2: Blender Asset Integration**: Import high-poly GLTF/GLB models with custom Draco compression.
- [ ] **Phase 3: GSAP Cinematic Camera Sequences**: Curate complex Bezier camera splines for scene-to-scene traversal.
- [ ] **Phase 4: Advanced Shaders**: Add raymarching, volumetric fog, and subsurface scattering (SSS).
- [ ] **Phase 5: Sound Design**: Web Audio API spatial audio, ambient drone soundscapes, and interaction triggers.
- [ ] **Phase 6: Mobile & Low-Power Optimization**: Dynamic DPR scaling, post-processing tier downgrading on low-end GPUs.
