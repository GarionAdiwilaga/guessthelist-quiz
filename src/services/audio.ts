import { CustomAudioConfig } from '../types/quiz';

interface AudioSettings {
  soundEnabled: boolean;
  soundVolume: number;
  customAudio: CustomAudioConfig;
}

class AudioService {
  private settings: AudioSettings = {
    soundEnabled: true,
    soundVolume: 0.8,
    customAudio: {
      useCustomSound: false,
      correctAudioDataUrl: null,
      wrongAudioDataUrl: null
    }
  };

  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(partial: Partial<AudioSettings>): void {
    if (partial.soundEnabled !== undefined) {
      this.settings.soundEnabled = partial.soundEnabled;
    }
    if (partial.soundVolume !== undefined) {
      this.settings.soundVolume = Math.max(0, Math.min(partial.soundVolume, 1));
    }
    if (partial.customAudio) {
      this.settings.customAudio = {
        ...this.settings.customAudio,
        ...partial.customAudio
      };
    }
  }

  public getSettings(): AudioSettings {
    return {
      ...this.settings,
      customAudio: { ...this.settings.customAudio }
    };
  }

  public playCorrectSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    // Check custom audio
    if (this.settings.customAudio.useCustomSound && this.settings.customAudio.correctAudioDataUrl) {
      this.playCustomAudio(this.settings.customAudio.correctAudioDataUrl);
      return;
    }

    // Synthesized Chime (Family Feud correct bell: uplifting F#5 -> B5 chord)
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.settings.soundVolume * 0.7, now);
    masterGain.connect(ctx.destination);

    // Note 1: 587.33 Hz (F#5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.8, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Note 2: 987.77 Hz (B5), offset by 0.1s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.01, now + 0.1);
    gain2.gain.linearRampToValueAtTime(1.0, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.1);
    osc2.stop(now + 1.2);

    // Subtle harmonic shimmer: 1975.5 Hz
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1975.5, now + 0.1);
    gain3.gain.setValueAtTime(0.01, now + 0.1);
    gain3.gain.linearRampToValueAtTime(0.3, now + 0.14);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.1);
    osc3.stop(now + 0.8);
  }

  public playBuzzerSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    // Check custom audio
    if (this.settings.customAudio.useCustomSound && this.settings.customAudio.wrongAudioDataUrl) {
      this.playCustomAudio(this.settings.customAudio.wrongAudioDataUrl);
      return;
    }

    // Synthesized Buzzer (Family Feud harsh dissonant buzzer: 120Hz + 128Hz sawtooth with lowpass filter)
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.settings.soundVolume * 0.9, now);
    masterGain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.6);
    filter.connect(masterGain);

    // Dual dissonant sawtooth oscillators
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    osc2.frequency.setValueAtTime(129, now); // creates 9 Hz discord beat

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + 0.03);
    gainNode.gain.setValueAtTime(0.9, now + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(filter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  private playCustomAudio(dataUrl: string): void {
    if (typeof window === 'undefined') return;
    try {
      const audio = new Audio(dataUrl);
      audio.volume = this.settings.soundVolume;
      audio.play().catch((err) => {
        console.warn('Custom audio playback was prevented or failed:', err);
      });
    } catch (err) {
      console.warn('Error loading custom audio:', err);
    }
  }
}

export const audioService = new AudioService();
