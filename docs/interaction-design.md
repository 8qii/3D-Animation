# INTERACTION DESIGN SPECIFICATION // THE OBSERVER EFFECT
### Transforming The Void into a Sentient, Responsive Physical Medium

---

> *"In quantum mechanics, a physical system does not possess definite properties prior to observation. In Genesis, the digital canvas is not an inert backdrop; it is an unmeasured quantum vacuum that actively senses, evaluates, and reacts to the presence of the human observer."*

---

## 1. THE OBSERVER PHILOSOPHY

Most 3D websites treat interaction mechanically: the cursor is a mouse pointer, and the wheel is a page scrubber. **Genesis** rejects this model.

In Genesis:
- **The Cursor is an Electromagnetic Perturbation**: The observer's cursor does not hover above the screen; it dips into the virtual vacuum, radiating a localized gravitational field.
- **Stillness is Intimacy**: The universe ignores frantic, erratic movements. When the visitor slows their breathing and rests their gaze near the center, the universe senses *focused consciousness* and blooms in response.
- **Scroll is Kinetic Energy**: Scrolling is not mere pagination. Each scroll movement injects kinetic excitation into the resting vacuum, accelerating Brownian motion and flaring the quantum core.

---

## 2. OBSERVER INTERACTION ARCHITECTURE

```mermaid
flowchart TD
    PointerInput([Pointer Coordinates & Velocity]) --> Raycaster[3D Camera Unprojector]
    Raycaster -->|World Coordinates (xw, yw, 0)| GravityField[Cursor Gravity & Swirl Vector]

    PointerDwell([Dwell Time & Velocity Delta]) --> AttentionTracker[Attention Estimator]
    AttentionTracker -->|Attention Level A in [0..1]| ShaderUniforms[Shader Uniform Pipeline]

    ScrollDelta([Wheel Delta & Inertia]) --> EnergyAccumulator[Kinetic Energy Accumulator]
    EnergyAccumulator -->|Excitation Energy E in [0..1]| ShaderUniforms

    ShaderUniforms --> ParticleSystem[GPU Particles: IDLE / OBSERVED / AWAKENED]
    ShaderUniforms --> FluctuationCore[Central Quantum Fluctuation]
    ShaderUniforms --> AtmosphericHaze[Cathedral Fog & Vignette]
    ShaderUniforms --> PostProcessing[Dynamic Bloom & Glare]
```

---

## 3. MATHEMATICAL FORMULATION

### A. 3D World Unprojection
Given normalized device coordinates $(x_{ndc}, y_{ndc}) \in [-1, 1]$, the world intersection coordinate on the focal plane $z = 0$ is derived via the inverse view-projection matrix:

$$\mathbf{p}_{\text{ray}} = \text{unproject}(x_{ndc}, y_{ndc}, 0)$$
$$\mathbf{d} = \text{normalize}(\mathbf{p}_{\text{ray}} - \mathbf{c}_{\text{pos}})$$
$$t_{\text{focal}} = \frac{-\mathbf{c}_{\text{pos}}.z}{\mathbf{d}.z}$$
$$\mathbf{p}_{\text{world}} = \mathbf{c}_{\text{pos}} + t_{\text{focal}} \cdot \mathbf{d}$$

### B. Cursor Gravitational Influence Field
Each particle at world position $\mathbf{p}_i$ calculates its displacement vector relative to $\mathbf{p}_{\text{world}}$:

$$\mathbf{r}_i = \mathbf{p}_{\text{world}} - \mathbf{p}_i$$
$$d_i = \|\mathbf{r}_i\|$$

Within radius $R = 4.0$, a blended attractive and tangential swirl force is exerted:

$$\mathbf{F}_{\text{radial}} = \frac{\mathbf{r}_i}{d_i + \epsilon} \cdot \exp\left(-\frac{d_i^2}{2\sigma^2}\right) \cdot A$$
$$\mathbf{F}_{\text{swirl}} = \left( -\frac{\mathbf{r}_{i,y}}{d_i}, \frac{\mathbf{r}_{i,x}}{d_i}, 0 \right) \cdot \exp\left(-\frac{d_i^2}{2\sigma^2}\right) \cdot A \cdot 0.6$$
$$\Delta \mathbf{p}_i = (\mathbf{F}_{\text{radial}} \cdot 0.8 + \mathbf{F}_{\text{swirl}}) \cdot (1.0 + E \cdot 1.5)$$

Where:
- $A \in [0.0, 1.0]$ is the **Attention Level**.
- $E \in [0.0, 1.0]$ is the **Scroll Kinetic Energy**.
- $\sigma = 1.6\text{ units}$ (effective field dispersion).

---

## 4. REACTIVE PARTICLE CONSCIOUSNESS STATES

The 1,400+ GPU particles operate across three continuous states mapped in GLSL:

```
[ STATE 0: IDLE ]
      │
      │  d_i < R  OR  A > 0.25 (Observer Attention Detected)
      ▼
[ STATE 1: OBSERVED ]
      │
      │  E > 0.35 (Kinetic Scroll Energy Injected)
      ▼
[ STATE 2: AWAKENED ]
```

### State 0: IDLE (The Resting Vacuum)
- **Velocity**: Slow Brownian-like random walk ($v \approx 0.04\text{ units/s}$).
- **Palette**: Deep starlight cyan (`#38bdf8`) mixing into subdued violet (`#6366f1`).
- **Luminescence**: Low alpha ($0.15 \le \alpha \le 0.40$), gentle 0.4 Hz scintillation.
- **Bokeh Profile**: Standard $2.0\text{px}$ Gaussian disc with soft edges.

### State 1: OBSERVED (Conscious Alignment)
- **Trigger**: Particle falls within the cursor gravity well ($d_i < 3.5$) or the observer remains still near the center ($A > 0.3$).
- **Behavior**:
  - Particles curve toward the cursor in orbital streamlines.
  - Twinkle frequency accelerates to $1.8\text{ Hz}$.
  - Palette shifts toward luminous electric cyan (`#00f0ff`) and crisp silver white (`#f1f5f9`).
  - Alpha increases to $0.65 \le \alpha \le 0.95$.

### State 2: AWAKENED (Kinetic Excitation)
- **Trigger**: Active wheel scrolling pumps kinetic energy ($E > 0.35$).
- **Behavior**:
  - Particles expand their bokeh discs by up to $180\%$, revealing internal optical ring diffraction.
  - Brownian velocity increases up to $2.8\times$.
  - Solar amber flares (`#f59e0b` to `#fbbf24`) flash across particle cores, signaling thermal excitation.

---

## 5. THE SYNCHRONIZED BREATHING UNIVERSE

To prevent disparate elements from feeling disconnected, a master harmonic clock governs all visual subsystems:

$$\omega_0 = 2\pi \cdot 0.05\text{ rad/s} \quad (T = 20.0\text{ seconds})$$
$$\theta_{\text{breath}}(t) = \sin(\omega_0 \cdot t) \cdot 0.5 + 0.5 \in [0.0, 1.0]$$

| Subsystem | Baseline State | Inhalation Peak ($\theta = 1.0$) | Harmonic Role |
| :--- | :--- | :--- | :--- |
| **Quantum Fluctuation** | Radius $r = 0.28$, alpha $0.70$ | Radius $r = 0.42$, alpha $1.00$ | The rhythmic heart of the void |
| **Atmospheric Fog** | Pure void `#020409` | Cathedral indigo `#090e24` | Volumetric thoracic expansion |
| **GPU Particles** | Scintillation base $0.8$ | Scintillation peak $1.25$ | Metabolic cell activity |
| **Camera Respiration** | Baseline $y = 0.0$ | Vertical rise $y = +0.045$ | Human somatic sympathy |
| **Post-Processing Bloom** | Threshold $0.25$, intensity $1.0$ | Intensity $1.35$ | Atmospheric glow breathing |

---

## 6. SCROLL AS KINETIC ENERGY INPUT

Scrolling represents **thermodynamic energy injection** rather than static position incrementation.

### Energy Accumulator Model
Let $\Delta s$ be the scroll displacement over frame interval $\Delta t$:

$$\Delta E = \min\left(1.0, \frac{|\Delta s|}{\Delta t} \cdot 0.0025\right)$$
$$E(t) = \min(1.0, E(t - \Delta t) + \Delta E)$$

### Energy Decay (Newton's Law of Cooling)
When active scrolling ceases, energy decays continuously back to zero:

$$\frac{dE}{dt} = -\frac{1}{\tau} E \implies E(t) = E_0 \cdot e^{-t / \tau}$$

Where $\tau = 1.8\text{ seconds}$ is the relaxation half-life.

### Observable Effects of High Energy ($E \to 1.0$):
1. **Core Overdrive**: The central quantum fluctuation doubles its radial halo and flares into blinding super-radiant white (`#ffffff`).
2. **Dust Acceleration**: Microscopic dust motes race through the void, trailing starlight filaments.
3. **Atmospheric Illumination**: The distant cathedral fog expands, illuminating the outer quadrant of the viewport.
4. **Bloom Spike**: Bloom intensity scales up to $2.2$, creating cinematic lens flare bleeding across the black void.
