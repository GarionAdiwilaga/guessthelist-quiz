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
  private introAudio: HTMLAudioElement | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      if (!this.settings.soundEnabled) {
        this.stopIntroMusic();
      }
    }
    if (partial.soundVolume !== undefined) {
      this.settings.soundVolume = Math.max(0, Math.min(partial.soundVolume, 1));
      if (this.introAudio) {
        this.introAudio.volume = this.settings.soundVolume;
      }
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

  private playAudioFile(url: string, volumeScale = 1.0): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return Promise.resolve();

    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(this.settings.soundVolume * volumeScale, 1));
      return audio.play().catch((err) => {
        console.warn(`Audio play failed for ${url}:`, err);
      });
    } catch (err) {
      console.warn(`Audio create failed for ${url}:`, err);
      return Promise.resolve();
    }
  }

  public playCorrectSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    if (this.settings.customAudio.useCustomSound && this.settings.customAudio.correctAudioDataUrl) {
      this.playAudioFile(this.settings.customAudio.correctAudioDataUrl);
      return;
    }

    // Default audio file: /audio/correct.mp3
    this.playAudioFile('/audio/correct.mp3').catch(() => {
      this.playSynthesizedChime();
    });
  }

  public playBuzzerSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    if (this.settings.customAudio.useCustomSound && this.settings.customAudio.wrongAudioDataUrl) {
      this.playAudioFile(this.settings.customAudio.wrongAudioDataUrl);
      return;
    }

    // Default audio file: /audio/buzzer.mp3
    this.playAudioFile('/audio/buzzer.mp3').catch(() => {
      this.playSynthesizedBuzzer();
    });
  }

  public playWooshSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;
    this.playAudioFile('/audio/woosh.mp3', 0.85);
  }

  public playApplauseSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;
    this.playAudioFile('/audio/applause.wav', 0.9);
  }

  public playIntroMusic(): void {
    if (typeof window === 'undefined') return;
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    try {
      if (!this.introAudio) {
        this.introAudio = new Audio('/audio/intro.mp3');
        this.introAudio.loop = true;
      }
      this.introAudio.volume = this.settings.soundVolume;
      this.introAudio.currentTime = 0;
      this.introAudio.play().catch((err) => {
        console.warn('Intro music play failed:', err);
      });
    } catch (err) {
      console.warn('Error starting intro music:', err);
    }
  }

  public stopIntroMusic(): void {
    if (this.introAudio) {
      try {
        this.introAudio.pause();
        this.introAudio.currentTime = 0;
      } catch {
        // no-op
      }
    }
  }

  public isIntroPlaying(): boolean {
    return Boolean(this.introAudio && !this.introAudio.paused);
  }

  // Synthesized Fallbacks if audio files cannot be loaded
  private playSynthesizedChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.settings.soundVolume * 0.7, now);
    masterGain.connect(ctx.destination);

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
  }

  private playSynthesizedBuzzer(): void {
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

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + 0.03);
    gainNode.gain.setValueAtTime(0.9, now + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc1.connect(gainNode);
    gainNode.connect(filter);
    osc1.start(now);
    osc1.stop(now + 0.7);
  }
}

export const audioService = new AudioService();
