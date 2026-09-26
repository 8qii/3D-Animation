/**
 * Procedural Web Audio API Sound Engine for Genesis Experience
 * Pure synthesis with zero external audio assets:
 * - 38Hz to 45Hz Infrasound Quantum Drone
 * - Dynamic Biquad Resonant Low-Pass Filter
 * - D-Minor Harmonic Bell Chime Cluster with exponential reverb decay
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private isInitialized = false;
  private chimeTriggered = false;

  private initContext() {
    if (this.ctx || typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. Infrasound Quantum Drone Generator (38Hz fundamental)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(38.0, this.ctx.currentTime);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(400.0, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.droneOsc.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start();
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
   * Modulates the quantum drone frequency and filter cutoff smoothly with transition progress [0..1]
   */
  public updateTransition(transitionProgress: number, scrollEnergy: number) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter) return;

    const currentTime = this.ctx.currentTime;

    // Pitch bend from 38 Hz up to 45 Hz as singularity contracts
    const targetFreq = 38.0 + transitionProgress * 7.0 + scrollEnergy * 4.0;
    this.droneOsc.frequency.setTargetAtTime(targetFreq, currentTime, 0.1);

    // Filter sweeps open from 400 Hz to 1,200 Hz
    const targetCutoff = 400.0 + transitionProgress * 800.0 + scrollEnergy * 600.0;
    this.droneFilter.frequency.setTargetAtTime(targetCutoff, currentTime, 0.1);
  }

  /**
   * Triggers the harmonic D-Minor crystal bell strike upon singularity ignition
   */
  public triggerSingularityChime() {
    if (!this.ctx || !this.masterGain || this.chimeTriggered) return;
    if (this.ctx.state === 'suspended') return;

    this.chimeTriggered = true;
    const now = this.ctx.currentTime;

    // Harmonic chord cluster: D4 (293.66 Hz), F4 (349.23 Hz), A4 (440.00 Hz), D5 (587.33 Hz)
    const frequencies = [293.66, 349.23, 440.0, 587.33, 880.0];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Micro-detune for acoustic shimmer
      osc.detune.setValueAtTime((idx - 2) * 4.5, now);

      // Attack and long 6.0s exponential decay tail
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5 + idx * 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 6.5);
    });
  }

  public resetChimeTrigger() {
    this.chimeTriggered = false;
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
