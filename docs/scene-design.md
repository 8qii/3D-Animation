# CINEMATIC SCENE DESIGN & EXHIBITION SPECIFICATION
### Act I: The Void — Polish Pass & Optical Exhibition Architecture

---

## 1. ACT I EXHIBITION ARCHITECTURE: THE VOID

Act I is conceived as a digital museum installation—an infinite cathedral of unmeasured quantum vacuum where light, particles, and atmosphere breathe in contemplative synchrony with the human observer.

---

## 2. MULTI-DEPTH PARTICLE LAYERING SYSTEM

To escape the flat, uniform appearance common to basic WebGL particle fields, Act I employs a **three-tier depth hierarchy** spanning from physical camera optics to infinite astronomical space:

```
[ Camera Sensor ] ──► [ Layer 1: Foreground Lens Dust ]   (z = +5.2 to +6.8)
                  ──► [ Layer 2: Mid-Field Quantum Motes ] (z = -4.0 to +4.0) [Focal Plane]
                  ──► [ Layer 3: Deep-Space Particles ]   (z = -18.0 to -3.0)
```

### Layer 1: Foreground Lens Dust (Macro Optic Layer)
- **Instance Count**: 90 micro-particles.
- **Z-Domain**: $z \in [5.2, 6.8]$ (less than $1.8\text{ units}$ from the virtual front element).
- **Visual Character**: Large, hyper-defocused circular bokeh discs ($0.08 - 0.22\text{ units}$ in screen space) with delicate edge-density rings mimicking physical lens glass dust.
- **Kinematics**: Drifts lazily and independently of cursor gravity, preserving the physical illusion of glass imperfections fixed near the observer's ocular frame.

### Layer 2: Mid-Field Quantum Motes (The Sentient Field)
- **Instance Count**: 1,200 reactive particles.
- **Z-Domain**: $z \in [-4.0, +4.0]$ centered around the focal plane ($z = 0.0$).
- **Visual Character**: Crisp, luminous starlight motes that dynamically shift between `IDLE` (cyan/indigo), `OBSERVED` (electric cyan/white), and `AWAKENED` (solar amber).
- **Kinematics**: Actively governed by the **Observer Gravity Field** ($R \approx 4.2\text{ units}$) and kinetic scroll energy acceleration.

### Layer 3: Deep-Space Celestial Dust (Astronomical Horizon)
- **Instance Count**: 1,800 distant starlight points.
- **Z-Domain**: $z \in [-18.0, -3.0]$ spanning across $x, y \in [-16.0, 16.0]$.
- **Visual Character**: Sub-pixel starlight glimmer with quadratic depth attenuation ($1 / d^2$).
- **Kinematics**: Immune to local cursor perturbation; drifts with slow, ancient cosmic rotational momentum ($v \approx 0.008\text{ units/s}$).

---

## 3. ATMOSPHERIC DEPTH & VOLUMETRIC SCATTERING

1. **Subtle Volumetric Light Shafts (`volumetricGlow`)**:
   - A planar volumetric light shaft at $z = -0.6$ simulates photons from the central fluctuation scattering through cold vacuum fog.
   - Low opacity ($0.04 - 0.12$) and subtle radial ray striations give the impression of volumetric light shafts piercing cathedral gloom.
2. **Exponential Scene Depth Fog (`fogExp2`)**:
   - Depth fog density $\rho = 0.038$ using void black (`#030712`).
   - Seamlessly blends deep-space particles and atmospheric planes into total blackness without harsh clipping planes.
3. **16-Bit Dithered Atmospheric Horizon**:
   - Custom dither algorithm in `voidAtmosphere.frag.ts` eliminates 8-bit banding across wide-gamut monitors.

---

## 4. OPTICAL REALISM PROFILE

To prevent the cold, sterile appearance of raw digital rendering, Act I incorporates physical cinematography mechanics:

- **Cinematic Lens Breathing (45mm Prime Emulation)**:
  - In real optical cinema lenses, respiration and distance adjustments induce subtle field-of-view breathing.
  - The camera FOV dynamically breathes:
    $$\text{FOV}(t) = 45.0^\circ + \sin(t \cdot 0.314159) \times 0.25^\circ - E_{\text{scroll}} \times 0.65^\circ$$
- **Subtle 35mm Celluloid Film Grain**:
  - Integrated via post-processing overlay (`opacity = 0.035`, `blendFunction = OVERLAY`).
  - Imparts organic analog texture and prevents tonal quantization in deep shadows.
- **Micro Anamorphic Chromatic Aberration**:
  - Radial dispersion (`offset = 0.0006`) with radial modulation ($0.32$), reproducing peripheral chromatic fringing characteristic of vintage anamorphic glass.
- **Vignetting Imperfection**:
  - Soft radial density falloff ($0.16$ offset, $0.86$ darkness) focusing the eye on the sacred core.

---

## 5. MOBILE TOUCH INTERACTION ERGONOMICS

The observer interaction model extends seamlessly to mobile devices:

- **Direct Touch As Gravitational Point**:
  - `onTouchStart` instantly normalizes touch coordinates to $[-1, 1]$ and triggers an immediate attention level spike to $0.65$ (the vacuum awakens upon physical touch).
- **Kinetic Drag Energy Pumping**:
  - `onTouchMove` measures finger velocity across the glass, dynamically converting drag momentum into kinetic scroll energy ($E_{\text{scroll}}$).
- **Viscous Release**:
  - On `onTouchEnd`, kinetic energy smoothly decays via exponential cooling ($\tau = 1.8\text{s}$) back into resting stillness.

---

## 6. HARMONIC TIMING & METABOLIC PULSE

Act I operates on three nested temporal frequencies:

1. **Cosmic Breath ($0.05\text{ Hz} \equiv 20.0\text{s}$ fundamental)**:
   - Synchronizes camera height ($\Delta y = 0.045$), atmospheric indigo expansion, particle Brownian amplitude, and bloom dilation.
2. **Life Pulse ($0.25\text{ Hz} \equiv 4.0\text{s}$ secondary)**:
   - A subtle double-beat micro-pulse layered over the central fluctuation's emissive core, imbuing the singularity with biological warmth.
3. **Interaction Response ($\lambda = 2.8 - 3.2$)**:
   - Silky exponential damping that feels heavy, ancient, and viscous, eliminating jittery mouse or touch movements.
