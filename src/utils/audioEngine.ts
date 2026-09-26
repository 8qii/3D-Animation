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

  private isInitialized = false;
  private chimeTriggered = false;
  private isSilent = false;

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

  public destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.isInitialized = false;
    }
  }
}

export const soundEngine = new SoundEngine();
