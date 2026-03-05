// Sound System for Mini Arcade
// Uses Web Audio API for low-latency sound effects

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicGain = null;
    this.sfxGain = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.isMusicPlaying = false;
    this.currentMusic = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.audioContext.destination);
      
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.audioContext.destination);
      
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // Generate synthesized sounds
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // UI Sound Effects
  playClick() {
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  playHover() {
    this.playTone(600, 0.03, 'sine', 0.1);
  }

  playSuccess() {
    // Ascending arpeggio
    this.playTone(523, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 200); // G5
  }

  playAchievement() {
    // Fanfare-like sound
    this.playTone(523, 0.15, 'sine', 0.4);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.4), 150);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.4), 300);
    setTimeout(() => this.playTone(1047, 0.3, 'sine', 0.5), 450);
  }

  playNewHighScore() {
    // Celebratory melody
    const notes = [523, 659, 784, 880, 1047, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.4), i * 100);
    });
  }

  playGameOver() {
    // Descending sad tone
    this.playTone(400, 0.2, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(300, 0.2, 'sawtooth', 0.2), 200);
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.2), 400);
  }

  playScore() {
    this.playTone(880, 0.08, 'sine', 0.2);
  }

  playLevelUp() {
    this.playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 200);
    setTimeout(() => this.playTone(880, 0.2, 'sine', 0.4), 300);
  }

  playError() {
    this.playTone(200, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(150, 0.2, 'square', 0.2), 150);
  }

  playPop() {
    this.playTone(1200, 0.05, 'sine', 0.3);
  }

  playWhoosh() {
    // Frequency sweep for whoosh effect
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Background music using oscillators (simple chiptune style)
  startBackgroundMusic() {
    if (!this.audioContext || this.isMusicPlaying) return;
    
    this.isMusicPlaying = true;
    this.playBackgroundLoop();
  }

  playBackgroundLoop() {
    if (!this.isMusicPlaying) return;
    
    // Simple ambient background tones
    const baseFreq = 110; // A2
    const notes = [1, 1.5, 2, 1.5]; // Simple pattern
    
    notes.forEach((mult, i) => {
      setTimeout(() => {
        if (!this.isMusicPlaying) return;
        this.playTone(baseFreq * mult, 0.8, 'sine', 0.05);
      }, i * 800);
    });
    
    // Loop the music
    setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playBackgroundLoop();
      }
    }, notes.length * 800);
  }

  stopBackgroundMusic() {
    this.isMusicPlaying = false;
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMusicPlaying;
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
    if (this.sfxGain) {
      this.sfxGain.gain.value = volume;
    }
  }

  // Resume audio context (required after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
export default soundManager;
