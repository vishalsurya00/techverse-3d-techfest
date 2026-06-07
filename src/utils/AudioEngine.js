class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneOscs = [];
    this.droneGain = null;
    this.filter = null;
    this.isMuted = false;
    this.droneVolume = 0.15;
    this.sfxVolume = 0.25;
  }

  init() {
    if (this.ctx) return;
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create Master Gain node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    // Create filter for the ambient drone
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(5, this.ctx.currentTime);
    this.filter.connect(this.masterGain);
    
    // LFO for filter modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow sweep
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // modulate up to 120Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();
  }

  startDrone() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.droneOscs.length > 0) return; // drone already playing

    // Drone Gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.droneGain.connect(this.filter);
    
    // Smooth fade in
    this.droneGain.gain.linearRampToValueAtTime(this.droneVolume, this.ctx.currentTime + 3.0);

    // Create 3 detuned oscillators for a rich, wide analog pad
    const frequencies = [65.41, 65.75, 130.81]; // C2, slightly detuned C2, and C3
    
    frequencies.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      osc.type = index === 2 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Detune slightly for stereo/chorus feel
      if (index === 0) osc.detune.setValueAtTime(-15, this.ctx.currentTime);
      if (index === 1) osc.detune.setValueAtTime(15, this.ctx.currentTime);
      
      osc.connect(this.droneGain);
      osc.start();
      this.droneOscs.push(osc);
    });
  }

  stopDrone() {
    if (this.droneGain) {
      try {
        const currentGain = this.droneGain.gain.value;
        this.droneGain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
        this.droneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        
        const oscsToStop = [...this.droneOscs];
        this.droneOscs = [];
        
        setTimeout(() => {
          oscsToStop.forEach(osc => {
            try { osc.stop(); } catch(e) {}
          });
        }, 1200);
      } catch (err) {
        console.error("Error stopping drone", err);
      }
    }
  }

  playHover() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    // Quick drop in pitch
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playClick() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High beep
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
    osc.frequency.setValueAtTime(2400, this.ctx.currentTime + 0.04);
    
    // Sub-bass click thump
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc2.start();
    
    osc.stop(this.ctx.currentTime + 0.2);
    osc2.stop(this.ctx.currentTime + 0.2);
  }

  playWarp() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

// Singleton pattern so multiple components access the same audio instance
const audioEngineInstance = new AudioEngine();
export default audioEngineInstance;
