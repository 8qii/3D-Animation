# GENESIS // FIVE-ACT MASTER TIMELINE SPECIFICATION
### Technical, Cinematographic, Shader, Audio, and Interaction State Registry

---

## 1. TIMELINE OVERVIEW & PROGRESS SEGMENTS

The overall experience is mapped along a normalized continuous progression space $S \in [0.00, 1.00]$ driven by high-inertia virtual smooth scroll (Lenis) with GSAP timeline anchoring.

| Act | Scene Identifier | Scroll Range ($S$) | Emotional State | Narrative Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Act I** | `the-void` | `0.000` – `0.200` | Stillness & Reverence | The unmeasured quantum vacuum; dormant potential |
| **Act II** | `the-singularity` | `0.200` – `0.400` | Awakening & Tension | Point charge ignition; vector blueprint emergence |
| **Act III** | `crystallization` | `0.400` – `0.650` | Awe & Structure | Sacred icosahedral geometry; architectural tension |
| **Act IV** | `the-dispersion` | `0.650` – `0.850` | Catharsis & Liberation | Monolith fracture; 10,000+ particle Fibonacci vortex |
| **Act V** | `harmonic-remanence`| `0.850` – `1.000` | Serenity & Equilibrium | Celestial halo formation; eternal starlight equilibrium |

---

## 2. COMPREHENSIVE MULTI-ACT STATE MATRIX

```
Act I [0.0 - 0.2]       Act II [0.2 - 0.4]      Act III [0.4 - 0.65]    Act IV [0.65 - 0.85]    Act V [0.85 - 1.0]
------------------------------------------------------------------------------------------------------------------
CAMERA POS:             CAMERA POS:             CAMERA POS:             CAMERA POS:             CAMERA POS:
[0.0, 0.0, 7.0]         [0.0, 0.0, 5.5]         [3.0, 1.5, 4.5]         [0.0, 4.0, 3.5]         [0.0, 0.0, 6.0]
FOV: 45°                FOV: 42°                FOV: 38°                FOV: 52° (dynamic)      FOV: 45°
BREATHING: 0.05Hz       BREATHING: 0.08Hz       BREATHING: 0.12Hz       BREATHING: 0.25Hz       BREATHING: 0.03Hz
------------------------------------------------------------------------------------------------------------------
SHADER:                 SHADER:                 SHADER:                 SHADER:                 SHADER:
Quantum Fluctuation     Singularity Core        Faceted Obsidian Glass  Super-Radiant Flash     Translucent Core
Void Abs: 98%           Emissive: 4.5           Refraction + Fresnel    Dispersion + Bloom      Quiet Ring Halo
Brownian Dust           Vector Grid Reveal      Inner Core Vibration    Particle Shockwave      Laminar Orbital Flow
------------------------------------------------------------------------------------------------------------------
AUDIO:                  AUDIO:                  AUDIO:                  AUDIO:                  AUDIO:
Infrasound (38Hz)       Sub Octave Shift        Glass Clockwork Cello   Silent Drop -> Climax   Major 7th Synth Pad
LP Filter: 400Hz        Bell Strike (D-Min)     LP Filter: 2.4kHz       LP Filter: 18kHz        LP Filter: 3.5kHz
Reverb: 8.5s            Tail: 6.0s              Reverb: 4.2s            Peak Transient Energy   Soft Ocean Air
------------------------------------------------------------------------------------------------------------------
INTERACTION / HUD:      INTERACTION / HUD:      INTERACTION / HUD:      INTERACTION / HUD:      INTERACTION / HUD:
Pointer Parallax: 0.35  Pointer Parallax: 0.45  Pointer Orbit: 0.60     High Inertia Drift      Gentle Free Float
HUD: OBSERVATORY 0.1    HUD: QUANTUM CHARGE     HUD: GEOMETRIC SYMM     HUD: ENTROPY DETECTED   HUD: EQUILIBRIUM
```

---

## 3. ACT-BY-ACT SPECIFICATIONS

### ACT I: THE VOID (`the-void`)
*Scroll Domain: $S \in [0.000, 0.200]$*

#### 1. Camera State
- **Coordinate Anchor**: `position: [0.0, 0.0, 7.0]`, `lookAt: [0.0, 0.0, 0.0]`
- **Lens Optics**: 45mm cinematic equivalent (Horizontal FOV: 45°).
- **Physical Dynamics**:
  - Longitudinal micro-drift: $\Delta z = \sin(t \cdot 0.1) \times 0.08$
  - Subconscious human respiration: $\Delta y = \sin(t \cdot 2\pi \cdot 0.05) \times 0.04$ ($0.05\text{ Hz}$ frequency)
  - Parallax dampening: $\lambda = 2.5$, scale factor $= 0.28$ (pointer offset limited to $[-0.28, 0.28]$).

#### 2. Shader & Visual State
- **Atmospheric Medium**: 98% absolute void (`#030712`). Deep indigo background gradient (`#060814` to `#02040a`) with 16-bit dither noise to prevent color banding.
- **The Quantum Fluctuation**:
  - A singular point of energy at $(0, 0, 0)$.
  - Emissive Shader: Procedural radial Gaussian falloff with a pulsing breathing cycle ($T = 4.0\text{s}$).
  - Core Color: Infrasonic cyan-violet (`#38bdf8` mixing into `#818cf8` and `#030712`).
  - Core Radius: $0.35$ units, breathing between $0.28$ and $0.42$.
- **GPU Dust Particle Field (The Latent Field)**:
  - Particle Count: 1,200 micro-motes.
  - Motion: Brownian pseudo-random noise drift ($v \approx 0.03\text{ units/s}$), zero bulk angular velocity.
  - Sizing: Sub-pixel to $2.5\text{px}$ with distance-based attenuation ($1 / d^2$).
  - Opacity: Subtle alpha modulated by depth ($0.15 \le \alpha \le 0.55$). Soft circular Gaussian edge profile.
- **Lighting Model**: Strict absence of standard directional/point lights. 100% self-luminous emissive materials with volumetric inverse-square falloff.

#### 3. Audio State
- **Fundamental**: Continuous 38 Hz pure sine sub-bass drone with $0.05\text{ Hz}$ amplitude modulation.
- **Filtering**: Steep low-pass filter locked at $400\text{ Hz}$.
- **Transients**: Sporadic microscopic glass hydrophone clicks (once every $6\text{–}12\text{ seconds}$).
- **Reverb**: Cathedral impulse response with $8.5\text{s}$ decay time, wet/dry ratio $0.35$.

#### 4. Interaction & Typography State
- **Scroll Response**: Heavy viscous drag; slow initial response encouraging contemplative stillness.
- **Pointer Parallax**: Very gentle nodal camera pivot ($< 2.5^\circ$).
- **Minimal HUD**:
  - Top Left: `AETHERIA // OBSERVATORY 0.1` (Monospace, tracking `0.3em`, 35% opacity).
  - Bottom Center: `TOUCH THE VOID // INITIATE SCROLL` (Monospace, tracking `0.25em`, rhythmic 3s opacity pulse).
  - Telemetry: `STATUS: QUANTUM VACUUM // ENTROPY: 0.0001`.

---

### ACT II: THE SINGULARITY (`the-singularity`)
*Scroll Domain: $S \in [0.200, 0.400]$*

#### 1. Camera State
- **Coordinate Transition**: Smooth push from $[0.0, 0.0, 7.0] \to [0.0, 0.0, 5.5]$.
- **Lens Optics**: FOV tightens from 45° to 42° to accentuate focal concentration.
- **Breathing Frequency**: Increases to $0.08\text{ Hz}$ ($\Delta y = 0.06$).

#### 2. Shader & Visual State
- **Singularity Core**:
  - Energy contracts from diffuse Gaussian glow into a dense, high-intensity plasma core ($r = 0.18$).
  - Color Shift: Introduction of solar amber flare (`#f59e0b`) at the singularity center surrounded by ionized cyan (`#38bdf8`).
  - Bloom Intensity: Spikes from $0.8 \to 2.4$.
- **Vector Blueprint (Cartesian Grid)**:
  - Faint, glowing laser-fine lattice lines branch outward from the singularity along $X, Y, Z$ axes.
  - Line thickness: $1\text{px}$ screen-space invariant.

#### 3. Audio State
- **Pitch Shift**: Sub-bass rises by a minor third ($38\text{ Hz} \to 45\text{ Hz}$).
- **Key Event**: Crystal bell strike in D-Minor (fundamental $293.66\text{ Hz}$) with high odd harmonics and a $6.0\text{s}$ decay tail.
- **Filtering**: Low-pass opens from $400\text{ Hz} \to 1.2\text{ kHz}$.

#### 4. Interaction & Typography State
- **HUD Update**:
  - Top Left: `AETHERIA // OBSERVATORY 0.2`
  - Bottom Center: `SINGULARITY DETECTED // VECTOR EXPANSION`
  - Telemetry: `COORDINATE LOCK: 0.000 // CHARGE: 100%`.

---

### ACT III: CRYSTALLIZATION (`crystallization`)
*Scroll Domain: $S \in [0.400, 0.650]$*

#### 1. Camera State
- **Coordinate Transition**: Sweeping diagonal orbit: $[0.0, 0.0, 5.5] \to [3.0, 1.5, 4.5]$.
- **Target Tracking**: Smooth dampened lookAt to $[0.0, 0.2, 0.0]$.
- **Lens Optics**: 38° FOV (portrait architectural compression).

#### 2. Shader & Visual State
- **Monolith Formation**:
  - Twenty golden-ratio icosahedral planes materialize.
  - Material: Polished dark obsidian glass with real-time Fresnel rim lighting and chromatic dispersion ($d\lambda/dn$).
- **Orbital Wireframe Halo**:
  - Counter-rotating astronomical ring system around the crystal ($r = 1.85$).
- **Particle Dynamics**:
  - Transition from Brownian random drift into organized concentric orbital shells.

#### 3. Audio State
- **Mechanical Rhythm**: Clockwork ticking and rhythmic glass cello pulses ($72\text{ BPM}$).
- **Spatial Positioning**: Audio source tracks crystal center; panning shifts right ($+35\%$) as camera orbits left.

#### 4. Interaction & Typography State
- **HUD Update**:
  - Header: `SCENE 02 // STRUCTURE`
  - Subtitle: `QUANTUM GEOMETRY & DISPERSION`
  - Telemetry: `PHASE: ORDER // GEOMETRIC SYMMETRY: 1.618`.

---

### ACT IV: THE DISPERSION (`the-dispersion`)
*Scroll Domain: $S \in [0.650, 0.850]$*

#### 1. Camera State
- **Coordinate Transition**: Upward ascending crane shot to $[0.0, 4.0, 3.5]$, pitch tilted $-32^\circ$ looking downward.
- **Dynamic Lens**: FOV expands dynamically from 38° to 52° to capture peripheral particle spread.

#### 2. Shader & Visual State
- **Structural Fissure & Flash**:
  - Crystal facets detach and drift outward along vertex normals.
  - Flash of super-radiant white bloom (`#f8fafc`) at $S = 0.680$.
- **Fibonacci Particle Explosion**:
  - 10,000+ GPU points erupt in an outward swirling spiral driven by curl noise.
  - Depth of field bokeh circles in foreground.

#### 3. Audio State
- **The Void Drop**: $400\text{ms}$ of dead silence immediately prior to explosive dispersion.
- **Climax Transient**: Massive acoustic bloom followed by stereo granular shimmer and multi-tap delay.
- **Filtering**: Low-pass filter fully open ($18\text{ kHz}$).

#### 4. Interaction & Typography State
- **HUD Update**:
  - Header: `SCENE 03 // ENTROPY`
  - Telemetry: `ENTROPY EVENT DETECTED // FIELD DISPERSION ACTIVE`.

---

### ACT V: HARMONIC REMANENCE (`harmonic-remanence`)
*Scroll Domain: $S \in [0.850, 1.000]$*

#### 1. Camera State
- **Coordinate Transition**: Slow, graceful pull-back to $[0.0, 0.0, 6.0]$, level zero-tilt horizon.
- **Breathing Frequency**: Calms to $0.03\text{ Hz}$ ($\Delta y = 0.02$).

#### 2. Shader & Visual State
- **Celestial Ring Formation**:
  - Swirling particles settle into a planar cosmic disk (Saturn-like starlight ring).
  - Center: A quiet, translucent crystalline sphere glowing with soft solar warmth (`#fef3c7`).
- **Post-Processing**: Bloom intensity stabilizes at $1.0$, vignette softly frames the equilibrium.

#### 3. Audio State
- **Harmonic Resolution**: Lush analog synthesizer pads in major seventh chords (Dmaj9, F#min7).
- **Sub-Bass**: Resolves into a peaceful 40 Hz foundation under a gentle breeze soundscape.

#### 4. Interaction & Typography State
- **HUD Update**:
  - Header: `GENESIS // EQUILIBRIUM`
  - Bottom Center: `OBSERVER SYNCHRONIZED // THE CYCLE IS COMPLETE`.
