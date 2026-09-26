/**
 * Procedural Web Audio API Sound Engine for Genesis Experience
 * Pure synthesis with zero external audio assets:
 * - 38Hz to 48Hz Sub-Bass Quantum Infrasound Drone with Sub-Octave Saturation
 * - High-Q Modal Crystal Resonance Filter Bank (D-Minor: 587Hz / 880Hz)
 * - Real-Time Dynamic Stereo Spatialization tracking observer viewport coordinates
 * - Singularity Harmonic Chime Clusters with 7.0s exponential decay tails
 */

// Helper linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

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

  // Phase 9.18.5 Observer Human-Presence Resonance Layer
  private presenceOsc: OscillatorNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private presenceGain: GainNode | null = null;

  // Phase 9.20.5 Adaptive Audio Memory Resonance Layer
  private memoryResonanceOsc: OscillatorNode | null = null;
  private memoryResonanceFilter: BiquadFilterNode | null = null;
  private memoryResonanceGain: GainNode | null = null;
  private lastChimeTime = 0;

  // Phase 9.21 Conscious Recognition Layer
  private consciousOsc: OscillatorNode | null = null;
  private consciousSubOsc: OscillatorNode | null = null;
  private consciousFilter: BiquadFilterNode | null = null;
  private consciousGain: GainNode | null = null;
  private intentionChimeTriggered = false;
  private gateOpenTriggered = false;
  private ceremonyTriggered = false;

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
    this.droneGain.gain.setValueAtTime(0.18, now);

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

    // 4. Observer Human-Presence Resonance Layer (warm vocal formant fifth at 220Hz -> 330Hz, bandpassed at 780Hz)
    this.presenceOsc = this.ctx.createOscillator();
    this.presenceOsc.type = 'sine';
    this.presenceOsc.frequency.setValueAtTime(220.0, now);

    this.presenceFilter = this.ctx.createBiquadFilter();
    this.presenceFilter.type = 'bandpass';
    this.presenceFilter.frequency.setValueAtTime(780.0, now);
    this.presenceFilter.Q.setValueAtTime(6.0, now);

    this.presenceGain = this.ctx.createGain();
    this.presenceGain.gain.setValueAtTime(0.0001, now);

    this.presenceOsc.connect(this.presenceFilter);
    this.presenceFilter.connect(this.presenceGain);
    this.presenceGain.connect(this.masterGain);

    this.presenceOsc.start();

    // Phase 9.20.5 Adaptive Audio Memory Resonance System
    this.memoryResonanceOsc = this.ctx.createOscillator();
    this.memoryResonanceOsc.type = 'sine';
    this.memoryResonanceOsc.frequency.setValueAtTime(587.33, now);

    this.memoryResonanceFilter = this.ctx.createBiquadFilter();
    this.memoryResonanceFilter.type = 'bandpass';
    this.memoryResonanceFilter.frequency.setValueAtTime(880.0, now);
    this.memoryResonanceFilter.Q.setValueAtTime(14.0, now);

    this.memoryResonanceGain = this.ctx.createGain();
    this.memoryResonanceGain.gain.setValueAtTime(0.0001, now);

    this.memoryResonanceOsc.connect(this.memoryResonanceFilter);
    this.memoryResonanceFilter.connect(this.memoryResonanceGain);
    this.memoryResonanceGain.connect(this.masterGain);

    this.memoryResonanceOsc.start();

    // Phase 9.21 Personal Observer Conscious Resonance Synthesizer
    this.consciousOsc = this.ctx.createOscillator();
    this.consciousOsc.type = 'sine';
    this.consciousOsc.frequency.setValueAtTime(432.0, now);

    this.consciousSubOsc = this.ctx.createOscillator();
    this.consciousSubOsc.type = 'sine';
    this.consciousSubOsc.frequency.setValueAtTime(216.0, now);

    this.consciousFilter = this.ctx.createBiquadFilter();
    this.consciousFilter.type = 'bandpass';
    this.consciousFilter.frequency.setValueAtTime(432.0, now);
    this.consciousFilter.Q.setValueAtTime(18.0, now);

    this.consciousGain = this.ctx.createGain();
    this.consciousGain.gain.setValueAtTime(0.0001, now);

    this.consciousOsc.connect(this.consciousFilter);
    this.consciousSubOsc.connect(this.consciousFilter);
    this.consciousFilter.connect(this.consciousGain);
    this.consciousGain.connect(this.masterGain);

    this.consciousOsc.start();
    this.consciousSubOsc.start();

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

    const targetGain = muted ? 0.0 : 0.48;
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
   * Phase 9.1 & 9.15 Act IV Shatter & Facet Memory Audio Evolution:
   * - Widening stereo field across viewport.
   * - Phase 9.15: Removes debris resonance, introduces harmonic suspension,
   *   deep cosmic inhale (vacuum frequency sweep), and rising energy pressure.
   */
  public updateFractureInstability(fracture: number, pointerX = 0, facetMemory = 0, collapse = 0, threshold = 0) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.tensionGain || !this.tensionFilter) return;
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const clampedFracture = Math.max(0.0, Math.min(1.0, fracture));
    const clampedMemory = Math.max(0.0, Math.min(1.0, facetMemory));
    const clampedCollapse = Math.max(0.0, Math.min(1.0, collapse));
    const clampedThreshold = Math.max(0.0, Math.min(1.0, threshold));
    if (clampedFracture <= 0.001 && clampedMemory <= 0.001 && clampedCollapse <= 0.001 && clampedThreshold <= 0.001) return;

    // 1. Widening Stereo Field: Acoustic space expands from centered to ultra-wide
    if (this.panner) {
      const panBreadth = (0.35 + (clampedFracture * 0.35 + clampedMemory * 0.25)) * (1.0 - clampedCollapse * 0.75) * (1.0 - clampedThreshold); // Centers strictly on singularity
      const spatialDrift = Math.sin(now * (0.45 * (1.0 - clampedMemory * 0.6))) * 0.25 * (1.0 - clampedCollapse) * (1.0 - clampedThreshold);
      const targetPan = Math.max(-0.85, Math.min(0.85, pointerX * panBreadth + spatialDrift));
      this.panner.pan.setTargetAtTime(targetPan, now, 0.08);
    }

    // 2. Deep Harmonic Expansion & Infrasound Sub Collapse:
    // Memory drift: 38Hz -> 24Hz vacuum draw
    // Memory collapse: 24Hz -> 18Hz sub-bass pressure
    // Singularity threshold: 18Hz collapses down to 14Hz
    const baseDrone = 38.0 - clampedFracture * 8.0; // 38Hz -> 30Hz
    const inhaleDrone = lerp(baseDrone, 24.0, clampedMemory); // Vacuum draw down to 24Hz
    const collapseDrone = lerp(inhaleDrone, 18.0, clampedCollapse); // 24Hz -> 18Hz
    const finalSubDrone = lerp(collapseDrone, 14.0, clampedThreshold); // 18Hz -> 14Hz sub collapse
    this.droneOsc.frequency.setTargetAtTime(finalSubDrone, now, 0.06);

    if (this.subOsc) {
      const subDrone = finalSubDrone * 0.5; // 7Hz deep infrasound
      this.subOsc.frequency.setTargetAtTime(subDrone, now, 0.06);
    }

    // Lowpass filter sweeps inward into heavy resonant containment, then narrows intensely (final vacuum inhale)
    const openFilter = 450.0 + clampedFracture * 2200.0;
    const inhaleFilter = lerp(openFilter, 220.0, clampedMemory * 0.85);
    const collapseFilter = lerp(inhaleFilter, 120.0, clampedCollapse);
    const thresholdFilter = lerp(collapseFilter, 60.0, clampedThreshold); // 120Hz -> 60Hz final vacuum inhale
    this.droneFilter.frequency.setTargetAtTime(thresholdFilter, now, 0.08);
    this.droneFilter.Q.setTargetAtTime(5.5 + clampedFracture * 4.0 + clampedMemory * 7.5 + clampedCollapse * 8.0 + clampedThreshold * 12.0, now, 0.08);

    // 3. High Harmonic Tension:
    if (this.crystalResonator1 && this.crystalResonator2) {
      const debrisFlutter1 = 1200.0 + Math.sin(now * 18.0) * (clampedFracture * 180.0) + Math.cos(now * 6.5) * 80.0;
      const debrisFlutter2 = 2400.0 + Math.cos(now * 24.0) * (clampedFracture * 220.0) + Math.sin(now * 9.0) * 120.0;

      // Pure suspended harmonics
      const suspendedFreq1 = 587.33 + Math.sin(now * 1.2) * 4.0;
      const suspendedFreq2 = 880.00 + Math.cos(now * 1.5) * 6.0;

      // Collapse & Threshold climb into maximum crystalline tension
      const collapseFreq1 = 1174.66; // D6 overtone
      const collapseFreq2 = 1760.00; // A6 overtone
      const thresholdFreq1 = 2349.32; // D7 extreme tension
      const thresholdFreq2 = 3520.00; // A7 extreme tension

      const targetFreq1 = lerp(lerp(lerp(debrisFlutter1, suspendedFreq1, clampedMemory), collapseFreq1, clampedCollapse), thresholdFreq1, clampedThreshold);
      const targetFreq2 = lerp(lerp(lerp(debrisFlutter2, suspendedFreq2, clampedMemory), collapseFreq2, clampedCollapse), thresholdFreq2, clampedThreshold);

      this.crystalResonator1.frequency.setTargetAtTime(targetFreq1, now, 0.06);
      this.crystalResonator2.frequency.setTargetAtTime(targetFreq2, now, 0.06);

      // Higher Q creates singing-bowl overtone ring
      this.crystalResonator1.Q.setTargetAtTime(18.0 + clampedMemory * 16.0 + clampedCollapse * 12.0 + clampedThreshold * 15.0, now, 0.08);
      this.crystalResonator2.Q.setTargetAtTime(22.0 + clampedMemory * 18.0 + clampedCollapse * 14.0 + clampedThreshold * 15.0, now, 0.08);
    }

    if (this.crystalGain) {
      const debrisLevel = 0.12 + clampedFracture * 0.32;
      const suspensionLevel = 0.28;
      const baseCrystalGain = lerp(debrisLevel, suspensionLevel, clampedMemory);
      // Drops toward complete silence at threshold completion (>= 0.85)
      const silenceDrop = clampedThreshold >= 0.85 ? Math.max(0.0, 1.0 - (clampedThreshold - 0.85) / 0.15) : 1.0;
      const effectiveCrystalGain = lerp(baseCrystalGain, 0.40, clampedCollapse) * silenceDrop;
      this.crystalGain.gain.setTargetAtTime(effectiveCrystalGain, now, 0.08);
    }

    // 4. Tension, Shearing & Rising Energy Pressure -> Complete Silence:
    const shearFreq = 2200.0 + clampedFracture * 2800.0 + Math.sin(now * 18.0) * 400.0;
    const suspendedShear = 3200.0;
    const collapseShear = 4800.0;
    const thresholdShear = 6400.0;
    this.tensionFilter.frequency.setTargetAtTime(
      lerp(lerp(lerp(shearFreq, suspendedShear, clampedMemory), collapseShear, clampedCollapse), thresholdShear, clampedThreshold),
      now,
      0.06
    );

    const activeTensionGain = (0.12 + clampedFracture * 0.28) * (1.0 - clampedMemory * 0.65) * (1.0 - clampedCollapse * 0.7) * (1.0 - clampedThreshold);
    this.tensionGain.gain.setTargetAtTime(activeTensionGain, now, 0.06);

    // Master gain: rises under containment pressure, then plunges into COMPLETE SILENCE at completion
    if (this.masterGain) {
      const risingPressure = 0.70 + clampedFracture * 0.10 + clampedMemory * 0.18 + clampedCollapse * 0.15;
      const completeSilence = 0.0001;
      let finalGain = risingPressure;
      if (clampedThreshold >= 0.80) {
        // Absolute complete silence before dispersion
        finalGain = lerp(risingPressure, completeSilence, (clampedThreshold - 0.80) / 0.20);
      } else if (clampedCollapse >= 0.90) {
        finalGain = lerp(risingPressure, 0.02, (clampedCollapse - 0.90) / 0.10);
      }
      this.masterGain.gain.setTargetAtTime(finalGain, now, 0.06);
    }
  }

  /**
   * Phase 9.18.5 Observer Consciousness Resonance:
   * Modulates harmonic brightness via proximity, spatializes stereo field via cursor X,
   * and introduces a warm vocal formant presence layer on synchronization and discovery.
   */
  public updateObserverPresence(
    pointerX: number,
    proximity: number,
    isSynchronized: boolean,
    hiddenDiscovery = false
  ) {
    if (!this.ctx || !this.isInitialized || this.isSilent) return;
    const now = this.ctx.currentTime;

    // 1. Stereo Field Spatialization
    if (this.panner) {
      const targetPan = Math.max(-0.85, Math.min(0.85, pointerX * 0.75));
      this.panner.pan.setTargetAtTime(targetPan, now, 0.08);
    }

    // 2. Observer Distance / Proximity controls harmonic brightness
    if (this.droneFilter) {
      const baseFreq = 400.0;
      const brightnessFreq = lerp(baseFreq, 1600.0, proximity);
      this.droneFilter.frequency.setTargetAtTime(brightnessFreq, now, 0.12);
    }

    // 3. Synchronization human-presence resonance layer
    if (this.presenceGain && this.presenceOsc && this.presenceFilter) {
      if (hiddenDiscovery) {
        // Ethereal golden discovery harmonic bloom
        this.presenceOsc.frequency.setTargetAtTime(440.0, now, 0.15); // A4
        this.presenceFilter.frequency.setTargetAtTime(1100.0, now, 0.15);
        this.presenceGain.gain.setTargetAtTime(0.24, now, 0.2);
      } else if (isSynchronized) {
        // Subtle human-presence harmonic warmth (E4 harmonic fifth ~329.63Hz)
        this.presenceOsc.frequency.setTargetAtTime(329.63, now, 0.2);
        this.presenceFilter.frequency.setTargetAtTime(780.0, now, 0.2);
        this.presenceGain.gain.setTargetAtTime(0.12 * Math.max(0.2, proximity), now, 0.2);
      } else {
        this.presenceGain.gain.setTargetAtTime(0.0001, now, 0.35);
      }
    }
  }

  /**
   * Phase 9.20.5 Adaptive Audio Memory Response
   * Modulates harmonic overtones based on past sessions, archetype, and trajectory resonance.
   */
  public updateMemoryResonance(
    sessionCount: number,
    archetype: string,
    recognitionResonance: number
  ) {
    if (!this.ctx || !this.memoryResonanceOsc || !this.memoryResonanceFilter || !this.memoryResonanceGain) return;
    if (this.ctx.state === 'suspended' || this.isSilent) return;

    const now = this.ctx.currentTime;
    const isReturning = sessionCount > 1;

    let targetFreq = 587.33; // Default D5
    let filterFreq = 880.00; // A5

    if (archetype === 'THE_WITNESS') {
      // Pure Pythagorean fifths: D5 (587.33) -> A5 (880.0) -> E6 (1318.5)
      targetFreq = 587.33;
      filterFreq = 1318.5;
    } else if (archetype === 'THE_CATALYST') {
      // Micro-detuned kinetic vibrato (adding active harmonic flutter)
      targetFreq = 622.25 + Math.sin(now * 8.0) * 8.0; // D#5 / Eb5
      filterFreq = 1244.5;
    } else if (archetype === 'THE_ARCHITECT') {
      // Golden ratio harmonic interval: 587.33 * 1.61803 = 950.32 Hz
      targetFreq = 587.33 * 1.6180339887;
      filterFreq = targetFreq * 1.6180339887;
    }

    this.memoryResonanceOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    this.memoryResonanceFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);

    // Gain increases with recognition resonance and past session count
    const baseMemoryGain = isReturning ? Math.min(0.22, 0.05 + (sessionCount - 1) * 0.04) : 0.0;
    const resonanceBoost = recognitionResonance * 0.18;
    const totalMemoryGain = baseMemoryGain + resonanceBoost;

    this.memoryResonanceGain.gain.setTargetAtTime(totalMemoryGain, now, 0.12);

    // Trigger soft glass chime on ghost encounter surge
    if (recognitionResonance > 0.75 && now - this.lastChimeTime > 2.5) {
      this.lastChimeTime = now;
      this.playGhostEncounterChime(targetFreq);
    }
  }

  private playGhostEncounterChime(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(freq * 2.0, now);
    chimeOsc.frequency.exponentialRampToValueAtTime(freq, now + 1.2);

    chimeGain.gain.setValueAtTime(0.15, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    chimeOsc.start(now);
    chimeOsc.stop(now + 1.25);
  }

  /**
   * Phase 9.21 Conscious Recognition Audio Layer
   * Gradually introduces personal observer resonance frequency (e.g. 432Hz/528Hz/417Hz)
   * and plays intention verification harmonic chord when intention is unlocked.
   */
  public updateConsciousRecognition(
    recognitionProgress: number,
    personalFreq: number,
    _intention: string,
    verified: boolean
  ) {
    if (!this.ctx || !this.consciousOsc || !this.consciousSubOsc || !this.consciousFilter || !this.consciousGain) return;
    if (this.ctx.state === 'suspended' || this.isSilent) return;

    const now = this.ctx.currentTime;
    const targetFreq = personalFreq > 100 ? personalFreq : 432.0;

    this.consciousOsc.frequency.setTargetAtTime(targetFreq, now, 0.15);
    this.consciousSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.15);
    this.consciousFilter.frequency.setTargetAtTime(targetFreq, now, 0.15);

    // Conscious gain: emerges at progress > 0.25 (Intuiting), builds through Remembering (0.60), peaks at Awakened (0.85+)
    let targetGain = 0.0001;
    if (recognitionProgress > 0.25) {
      const p = (recognitionProgress - 0.25) / 0.75;
      targetGain = p * 0.20;
      if (verified) targetGain = Math.min(0.32, targetGain * 1.35);
    }
    this.consciousGain.gain.setTargetAtTime(targetGain, now, 0.15);

    // Intention Verification Harmonic Ascension Chords
    if (verified && !this.intentionChimeTriggered) {
      this.intentionChimeTriggered = true;
      this.playIntentionVerifiedChords(targetFreq);
    }
  }

  private playIntentionVerifiedChords(fundamental: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Sacred golden chord: 1.0, 1.25 (Major 3rd), 1.5 (Perfect 5th), 1.618 (Golden Phi)
    const ratios = [1.0, 1.25, 1.5, 1.6180339887];
    ratios.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 2.4);
    });
  }

  /**
   * Phase 9.22 Recombination Gate Opening & ACT V Handshake Resolution
   * Grand sub-bass gravitational release + ascending Solfeggio overtone unison resolution.
   */
  public playRecombinationGateOpen(personalFreq: number) {
    if (!this.ctx || !this.masterGain || this.gateOpenTriggered) return;
    this.gateOpenTriggered = true;
    const now = this.ctx.currentTime;
    const fundamental = personalFreq > 100 ? personalFreq : 432.0;

    // 1. Deep Sub-Bass Gravitational Release sweep (48Hz down to 16Hz)
    const subRelease = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subRelease.type = 'sine';
    subRelease.frequency.setValueAtTime(48.0, now);
    subRelease.frequency.exponentialRampToValueAtTime(16.0, now + 3.0);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    subRelease.connect(subGain);
    subGain.connect(this.masterGain);
    subRelease.start(now);
    subRelease.stop(now + 3.4);

    // 2. Celestial Recombination Golden Unison Chord
    const chordRatios = [0.5, 1.0, 1.25, 1.5, 1.6180339887, 2.0];
    chordRatios.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(fundamental * ratio, now);
      filter.Q.setValueAtTime(12.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18 / Math.sqrt(idx + 1), now + 0.3 + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.6);
    });
  }

  /**
   * Phase 9.23 Aetheria Recombination Ceremony Theme:
   * Sacred Singing Bowl chime + deep ceremonial 24Hz drone + cosmic breath vacuum sweep.
   */
  public playRecombinationCeremonyTheme(personalFreq: number) {
    if (!this.ctx || !this.masterGain || this.ceremonyTriggered) return;
    this.ceremonyTriggered = true;
    const now = this.ctx.currentTime;
    const fundamental = personalFreq > 100 ? personalFreq : 432.0;

    // 1. Ultra-deep 24Hz Ceremonial Drone with slow breath pulse
    const droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(24.0, now);

    droneGain.gain.setValueAtTime(0.0001, now);
    droneGain.gain.linearRampToValueAtTime(0.35, now + 1.2);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.0);

    droneOsc.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start(now);
    droneOsc.stop(now + 8.2);

    // 2. Tibetan Singing Bowl Multi-Harmonic Resonator
    const bowlHarmonics = [1.0, 2.76, 5.4, 8.93];
    bowlHarmonics.forEach((mult, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * mult, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16 / (i + 1), now + 0.4 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 7.8);
    });

    // 3. Cosmic Inhale / Vacuum Breath Noise Sweep
    const bufferSize = Math.floor(this.ctx.sampleRate * 4.0);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(4.0, now);
    noiseFilter.frequency.setValueAtTime(220.0, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1400.0, now + 2.5);
    noiseFilter.frequency.exponentialRampToValueAtTime(180.0, now + 4.0);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 2.0);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSrc.start(now);
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
