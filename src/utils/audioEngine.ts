/**
 * Procedural Web Audio API Sound Engine for Genesis Experience
 * Pure synthesis with zero external audio assets:
 * - 38Hz to 48Hz Sub-Bass Quantum Infrasound Drone with Sub-Octave Saturation
 * - High-Q Modal Crystal Resonance Filter Bank (D-Minor: 587Hz / 880Hz)
 * - Real-Time Dynamic Stereo Spatialization tracking observer viewport coordinates
 * - Singularity Harmonic Chime Clusters with 7.0s exponential decay tails
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private panner: StereoPannerNode | null = null;

  // Sub-Bass
  private droneOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  // Modal Crystal Resonance
  private crystalResonator1: BiquadFilterNode | null = null;
  private crystalResonator2: BiquadFilterNode | null = null;
  private crystalGain: GainNode | null = null;

  // Phase 8.5 Monolith Internal Tension & Glass Instability
  private tensionOsc: OscillatorNode | null = null;
  private tensionSubOsc: OscillatorNode | null = null;
  private tensionFilter: BiquadFilterNode | null = null;
  private tensionGain: GainNode | null = null;

  private isInitialized = false;
  private chimeTriggered = false;
  private isSilent = false;
  private resolutionTriggered = false;
  private fractureSnapTriggered = false;

  private initContext() {
    if (this.ctx || typeof window === 'undefined') return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Spatial Stereo Panner
    if (typeof this.ctx.createStereoPanner === 'function') {
      this.panner = this.ctx.createStereoPanner();
      this.panner.pan.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.panner);
      this.panner.connect(this.ctx.destination);
    } else {
      this.masterGain.connect(this.ctx.destination);
    }

    const now = this.ctx.currentTime;

    // 1. Sub-Bass Primary Drone Generator (38Hz fundamental)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(38.0, now);

    // Sub-harmonic undertone (19Hz / 0.5x fundamental)
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'triangle';
    this.subOsc.frequency.setValueAtTime(19.0, now);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(400.0, now);
    this.droneFilter.Q.setValueAtTime(3.2, now);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.35, now);

    this.droneOsc.connect(this.droneFilter);
    this.subOsc.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start();
    this.subOsc.start();

    // 2. Modal Crystal Resonance System (D5 = 587.33Hz, A5 = 880.0Hz)
    this.crystalResonator1 = this.ctx.createBiquadFilter();
    this.crystalResonator1.type = 'bandpass';
    this.crystalResonator1.frequency.setValueAtTime(587.33, now);
    this.crystalResonator1.Q.setValueAtTime(18.0, now);

    this.crystalResonator2 = this.ctx.createBiquadFilter();
    this.crystalResonator2.type = 'bandpass';
    this.crystalResonator2.frequency.setValueAtTime(880.00, now);
    this.crystalResonator2.Q.setValueAtTime(22.0, now);

    this.crystalGain = this.ctx.createGain();
    this.crystalGain.gain.setValueAtTime(0.001, now);

    this.droneOsc.connect(this.crystalResonator1);
    this.droneOsc.connect(this.crystalResonator2);
    this.crystalResonator1.connect(this.crystalGain);
    this.crystalResonator2.connect(this.crystalGain);
    this.crystalGain.connect(this.masterGain);

    // 3. Monolith Tension & Friction Generator (Singing glass stress flutter)
    this.tensionOsc = this.ctx.createOscillator();
    this.tensionOsc.type = 'sawtooth';
    this.tensionOsc.frequency.setValueAtTime(293.66, now); // D4

    this.tensionSubOsc = this.ctx.createOscillator();
    this.tensionSubOsc.type = 'sine';
    this.tensionSubOsc.frequency.setValueAtTime(29.0, now); // Low tension sub-beat

    this.tensionFilter = this.ctx.createBiquadFilter();
    this.tensionFilter.type = 'bandpass';
    this.tensionFilter.frequency.setValueAtTime(2150.0, now); // Glass resonance shear
    this.tensionFilter.Q.setValueAtTime(14.0, now);

    this.tensionGain = this.ctx.createGain();
    this.tensionGain.gain.setValueAtTime(0.0001, now);

    this.tensionOsc.connect(this.tensionFilter);
    this.tensionFilter.connect(this.tensionGain);
    this.tensionSubOsc.connect(this.tensionGain);
    this.tensionGain.connect(this.masterGain);

    this.tensionOsc.start();
    this.tensionSubOsc.start();

    this.isInitialized = true;
  }

  public setMuted(muted: boolean) {
    if (!this.isInitialized) {
      if (!muted) this.initContext();
      else return;
    }

    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }

    const targetGain = muted ? 0.0 : 0.65;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
  }

  /**
   * Continuous parameter modulation for Act II Singularity
   */
  public updateTransition(
    transitionProgress: number,
    scrollEnergy: number,
    pointerX = 0,
    attention = 0,
    act2Progress = 0
  ) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.subOsc) return;

    const now = this.ctx.currentTime;
    const combinedProgress = Math.max(transitionProgress, act2Progress);

    // 1. Spatial Positioning: Smooth stereo panning following observer cursor
    if (this.panner) {
      const targetPan = Math.max(-0.85, Math.min(0.85, pointerX * 0.75));
      this.panner.pan.setTargetAtTime(targetPan, now, 0.12);
    }

    // 2. Sub-Bass Progression: Rises from 38 Hz to 48 Hz with intense presence
    const targetFreq = 38.0 + combinedProgress * 10.0 + scrollEnergy * 4.0;
    this.droneOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    this.subOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.1);

    // Resonant low-pass filter sweeps open from 400 Hz to 1,400 Hz
    const targetCutoff = 400.0 + combinedProgress * 850.0 + scrollEnergy * 500.0;
    this.droneFilter.frequency.setTargetAtTime(targetCutoff, now, 0.1);

    // 3. Modal Crystal Resonance: Sings in response to observer attention and geometry stabilization
    if (this.crystalGain) {
      const resonanceLevel = (attention * 0.18 + act2Progress * 0.15 + scrollEnergy * 0.12);
      this.crystalGain.gain.setTargetAtTime(resonanceLevel, now, 0.15);
    }
  }

  /**
   * Phase 8.5 Monolith Internal Tension Audio Modulation:
   * Low frequency sub-tension beating, singing glass friction, and pitch flutter.
   */
  public updateTension(tension: number) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.tensionGain || !this.tensionFilter || !this.tensionOsc) return;
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const clampedTension = Math.max(0.0, Math.min(1.0, tension));

    // 1. Low frequency tension beating (38Hz -> 47Hz, sub beat 28Hz -> 34Hz)
    const baseFreq = 38.0 + clampedTension * 9.0;
    this.droneOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    if (this.tensionSubOsc) {
      this.tensionSubOsc.frequency.setTargetAtTime(28.0 + clampedTension * 6.0, now, 0.08);
    }

    // Heavy lowpass resonance Q-factor increase under internal pressure
    const targetQ = 3.2 + clampedTension * 5.5;
    this.droneFilter.Q.setTargetAtTime(targetQ, now, 0.1);

    // 2. Glass Resonance Instability: micro-vibrato on crystal modal resonators
    if (this.crystalResonator1 && this.crystalResonator2) {
      const flutterFreq1 = 587.33 + Math.sin(now * 12.0) * (clampedTension * 18.0);
      const flutterFreq2 = 880.00 + Math.cos(now * 15.0) * (clampedTension * 26.0);
      this.crystalResonator1.frequency.setTargetAtTime(flutterFreq1, now, 0.05);
      this.crystalResonator2.frequency.setTargetAtTime(flutterFreq2, now, 0.05);
    }

    // 3. High-friction singing glass stress shimmer
    const shearFreq = 1800.0 + clampedTension * 1400.0 + Math.sin(now * 8.0) * (clampedTension * 250.0);
    this.tensionFilter.frequency.setTargetAtTime(shearFreq, now, 0.05);

    // Tension gain ramps smoothly as internal stress builds
    const targetGain = clampedTension > 0.05 ? clampedTension * 0.16 : 0.0001;
    this.tensionGain.gain.setTargetAtTime(targetGain, now, 0.1);

    // 4. Prepare silence before fracture:
    // If tension reaches near maximum (> 0.94), begin acoustic choke
    if (clampedTension >= 0.94) {
      const preFractureChoke = (1.0 - (clampedTension - 0.94) / 0.06);
      this.masterGain?.gain.setTargetAtTime(Math.max(0.08, 0.65 * preFractureChoke), now, 0.15);
    }
  }

  /**
   * Triggers the harmonic D-Minor crystal bell strike upon singularity ignition
   */
  public triggerSingularityChime(pan = 0) {
    if (!this.ctx || !this.masterGain || this.chimeTriggered) return;
    if (this.ctx.state === 'suspended') return;

    this.chimeTriggered = true;
    const now = this.ctx.currentTime;

    // Harmonic chord cluster: D4, F4, A4, D5, F5, A5
    const frequencies = [293.66, 349.23, 440.0, 587.33, 698.46, 880.0];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Micro-detuning for shimmering crystalline acoustic dispersion
      osc.detune.setValueAtTime((idx - 2.5) * 5.0, now);

      // Attack and expansive 7.0s exponential decay tail
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.14 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.2 + idx * 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 7.5);
    });
  }

  public resetChimeTrigger() {
    this.chimeTriggered = false;
  }

  /**
   * Cinematic Silence Event:
   * Aggressively ducks the universe into absolute silence before the final materialization,
   * coupled with a deep vacuum inhalation sweep.
   */
  public triggerCinematicSilence() {
    if (!this.ctx || !this.masterGain || this.isSilent) return;
    if (this.ctx.state === 'suspended') return;

    this.isSilent = true;
    const now = this.ctx.currentTime;

    // 1. Steep 350ms duck into dead silence
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    // 2. Vacuum Inhalation Infrasonic Sweep (85Hz down to 24Hz)
    const suckOsc = this.ctx.createOscillator();
    const suckFilter = this.ctx.createBiquadFilter();
    const suckGain = this.ctx.createGain();

    suckOsc.type = 'sine';
    suckOsc.frequency.setValueAtTime(85.0, now);
    suckOsc.frequency.exponentialRampToValueAtTime(24.0, now + 0.65);

    suckFilter.type = 'lowpass';
    suckFilter.frequency.setValueAtTime(300.0, now);
    suckFilter.frequency.exponentialRampToValueAtTime(60.0, now + 0.65);

    suckGain.gain.setValueAtTime(0.0001, now);
    suckGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    suckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    suckOsc.connect(suckFilter);
    suckFilter.connect(suckGain);
    suckGain.connect(this.ctx.destination);

    suckOsc.start(now);
    suckOsc.stop(now + 0.7);
  }

  public resetSilence(isMuted = false) {
    if (!this.isSilent || !this.ctx || !this.masterGain) return;
    this.isSilent = false;
    const now = this.ctx.currentTime;
    const target = isMuted ? 0.0 : 0.65;
    this.masterGain.gain.setTargetAtTime(target, now, 0.25);
  }

  /**
   * Act III Material Lock Audio Awakening:
   * Triggers after the silence event.
   * Plays a deep D-Minor 9th harmonic chord resolution and procedural bowed glass cello texture.
   */
  public triggerGlassCelloResolution() {
    if (!this.ctx || !this.masterGain || this.resolutionTriggered) return;
    if (this.ctx.state === 'suspended') return;

    this.resolutionTriggered = true;
    this.isSilent = false;
    const now = this.ctx.currentTime;

    // 1. Restore master gain with swelling acoustic presence
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.linearRampToValueAtTime(0.70, now + 0.5);

    // 2. Deep Harmonic Chord: D-Minor 9th Cluster (D2, A2, F3, A3, C4, E4)
    const chordFrequencies = [73.42, 110.0, 174.61, 220.0, 261.63, 329.63];
    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx < 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 2.5) * 3.5, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 8.0);
    });

    // 3. Procedural Bowed Glass Cello Texture (Resonant friction)
    const celloFilter = this.ctx.createBiquadFilter();
    celloFilter.type = 'bandpass';
    celloFilter.frequency.setValueAtTime(293.66, now); // D4 fundamental
    celloFilter.Q.setValueAtTime(6.0, now);

    const celloGain = this.ctx.createGain();
    celloGain.gain.setValueAtTime(0.0001, now);
    celloGain.gain.linearRampToValueAtTime(0.18, now + 0.7);
    celloGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);

    const celloOsc1 = this.ctx.createOscillator();
    celloOsc1.type = 'sawtooth';
    celloOsc1.frequency.setValueAtTime(146.83, now); // D3

    const celloOsc2 = this.ctx.createOscillator();
    celloOsc2.type = 'triangle';
    celloOsc2.frequency.setValueAtTime(147.35, now); // Micro detune for friction shimmer

    celloOsc1.connect(celloFilter);
    celloOsc2.connect(celloFilter);
    celloFilter.connect(celloGain);
    celloGain.connect(this.masterGain);

    celloOsc1.start(now);
    celloOsc2.start(now);
    celloOsc1.stop(now + 9.0);
    celloOsc2.stop(now + 9.0);
  }

  public resetResolution() {
    this.resolutionTriggered = false;
  }

  /**
   * Phase 8.75 Pre-Dispersion Audio State:
   * Removes harmonic stability, introduces unstable glass harmonics, low-frequency pressure,
   * and smoothly drops into near absolute silence at final stillness.
   */
  public preDispersionState(isPreDispersion: boolean, stillnessFactor = 0) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;

    if (isPreDispersion) {
      // 1. Remove harmonic stability with irregular detune drift
      if (this.droneOsc && this.subOsc) {
        const driftDetune = Math.sin(now * 1.8) * 25.0 + Math.cos(now * 0.7) * 15.0;
        this.droneOsc.detune.setTargetAtTime(driftDetune, now, 0.1);
      }

      // 2. Unstable glass harmonics
      if (this.crystalResonator1 && this.crystalResonator2) {
        const glassHarmonic1 = 587.33 + Math.sin(now * 2.4) * 45.0;
        const glassHarmonic2 = 880.00 + Math.cos(now * 3.1) * 60.0;
        this.crystalResonator1.frequency.setTargetAtTime(glassHarmonic1, now, 0.08);
        this.crystalResonator2.frequency.setTargetAtTime(glassHarmonic2, now, 0.08);
      }

      // 3. Final Stillness: At stillnessFactor >= 0.92, fade to near absolute silence
      if (stillnessFactor >= 0.90) {
        const quietFactor = Math.max(0.0001, (1.0 - (stillnessFactor - 0.90) / 0.10) * 0.65);
        this.masterGain.gain.setTargetAtTime(quietFactor, now, 0.18);
      }
    }
  }

  /**
   * Phase 9.0 Act IV Fracture Snap Transient:
   * A violent, hyper-focused crystalline snap that abruptly shatters the silence of stillness.
   * Crystalline high-frequency impulse (6.8kHz - 9.2kHz) with cleavage crack and sub-bass impact.
   */
  public triggerFractureSnap() {
    if (!this.ctx || !this.masterGain || this.fractureSnapTriggered) return;
    if (this.ctx.state === 'suspended') return;

    this.fractureSnapTriggered = true;
    this.isSilent = false;
    const now = this.ctx.currentTime;

    // Instantly cancel silence and bring master gain up to full power
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.75, now);

    // 1. Hyper-focused high-Q crystalline cleavage snap transient (6.8kHz - 9.2kHz)
    const snapOsc = this.ctx.createOscillator();
    const snapFilter = this.ctx.createBiquadFilter();
    const snapGain = this.ctx.createGain();

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(7400.0, now);
    snapOsc.frequency.exponentialRampToValueAtTime(2400.0, now + 0.12);

    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(6800.0, now);
    snapFilter.Q.setValueAtTime(28.0, now);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.85, now + 0.004);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterGain);

    snapOsc.start(now);
    snapOsc.stop(now + 0.20);

    // 2. High-frequency brittle noise crack (cleavage impulse)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(4500.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseNode.start(now);

    // 3. Low-frequency cleavage impact thud (64Hz down to 22Hz)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(64.0, now);
    thudOsc.frequency.exponentialRampToValueAtTime(22.0, now + 0.35);

    thudGain.gain.setValueAtTime(0.65, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    thudOsc.start(now);
    thudOsc.stop(now + 0.45);
  }

  public resetFractureSnap() {
    this.fractureSnapTriggered = false;
  }

  /**
   * Phase 9.0 Act IV Fracture Instability:
   * Continuous modulation during fracture initiation:
   * Tearing sub-bass overdrive, screaming singing-glass flutter, and spatial turbulence.
   */
  public updateFractureInstability(fracture: number) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.tensionGain || !this.tensionFilter) return;
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const clampedFracture = Math.max(0.0, Math.min(1.0, fracture));
    if (clampedFracture <= 0.001) return;

    // 1. Tearing Sub-Bass Drone: Drop frequency into sub-infrasound with high-resonance growl
    const droneFreq = 38.0 - clampedFracture * 10.0;
    this.droneOsc.frequency.setTargetAtTime(droneFreq, now, 0.06);

    const filterCutoff = 400.0 + clampedFracture * 1600.0;
    this.droneFilter.frequency.setTargetAtTime(filterCutoff, now, 0.06);
    this.droneFilter.Q.setTargetAtTime(6.5 + clampedFracture * 8.0, now, 0.06);

    // 2. Chaotic singing glass flutter (intense modal instability)
    if (this.crystalResonator1 && this.crystalResonator2) {
      const flutter1 = 587.33 + Math.sin(now * 26.0) * (clampedFracture * 140.0);
      const flutter2 = 880.00 + Math.cos(now * 32.0) * (clampedFracture * 180.0);
      this.crystalResonator1.frequency.setTargetAtTime(flutter1, now, 0.04);
      this.crystalResonator2.frequency.setTargetAtTime(flutter2, now, 0.04);
    }

    // 3. Tension & Shearing Gain surge
    const shearFreq = 2200.0 + clampedFracture * 2800.0 + Math.sin(now * 18.0) * 400.0;
    this.tensionFilter.frequency.setTargetAtTime(shearFreq, now, 0.04);
    this.tensionGain.gain.setTargetAtTime(0.12 + clampedFracture * 0.28, now, 0.06);

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.70 + clampedFracture * 0.15, now, 0.06);
    }
  }

  /**
   * Clean transition hook for Act IV: The Dispersion
   */
  private dispersionReadyCallback: (() => void) | null = null;

  public onDispersionReady(callback?: () => void) {
    if (callback) {
      this.dispersionReadyCallback = callback;
    } else if (this.dispersionReadyCallback) {
      this.dispersionReadyCallback();
    }
  }

  public destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.isInitialized = false;
    }
  }
}

export const soundEngine = new SoundEngine();
