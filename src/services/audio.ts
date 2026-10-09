import { CustomAudioConfig } from '../types/quiz';

interface AudioSettings {
  soundEnabled: boolean;
  soundVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmPlaying: boolean;
  bgmOffsetMs?: number;
  customAudio: CustomAudioConfig;
}

class AudioService {
  private settings: AudioSettings = {
    soundEnabled: true,
    soundVolume: 0.8,
    bgmEnabled: true,
    bgmVolume: 0.8,
    bgmPlaying: true,
    bgmOffsetMs: 0,
    customAudio: {
      useCustomSound: false,
      correctAudioDataUrl: null,
      wrongAudioDataUrl: null
    }
  };

  private ctx: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private clickBufferLoading: boolean = false;
  private introAudio: HTMLAudioElement | null = null;
  private applauseAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private isTitleScreen: boolean = true;
  private bgmFadeTimer: ReturnType<typeof setInterval> | null = null;

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
    if (partial.bgmEnabled !== undefined) {
      this.settings.bgmEnabled = partial.bgmEnabled;
    }
    if (partial.bgmVolume !== undefined) {
      this.settings.bgmVolume = Math.max(0, Math.min(partial.bgmVolume, 1));
    }
    if (partial.bgmPlaying !== undefined) {
      this.settings.bgmPlaying = partial.bgmPlaying;
    }
    if (partial.customAudio) {
      this.settings.customAudio = {
        ...this.settings.customAudio,
        ...partial.customAudio
      };
    }
    this.updateBgm();
  }

  public getSettings(): AudioSettings {
    return {
      ...this.settings,
      customAudio: { ...this.settings.customAudio }
    };
  }

  public setScreen(isTitleScreen: boolean): void {
    if (this.isTitleScreen !== isTitleScreen) {
      this.isTitleScreen = isTitleScreen;
      this.updateBgm();
    }
  }

  public getScreen(): boolean {
    return this.isTitleScreen;
  }

  private initBgmAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/audio/bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0;
    }
    return this.bgmAudio;
  }

  public calculateTargetBgmVolume(): number {
    if (!this.settings.soundEnabled || !this.settings.bgmEnabled || !this.settings.bgmPlaying) {
      return 0;
    }
    // 100% volume at Layar Judul (isTitleScreen = true), 50% volume at Game screen (isTitleScreen = false)
    const screenScale = this.isTitleScreen ? 1.0 : 0.5;
    return Math.max(0, Math.min(this.settings.bgmVolume * screenScale, 1.0));
  }

  public updateBgm(fadeDurationMs = 600): void {
    if (typeof window === 'undefined') return;
    const targetVolume = this.calculateTargetBgmVolume();
    const bgm = this.initBgmAudio();
    if (!bgm) return;

    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }

    if (targetVolume > 0 && (bgm.paused || bgm.ended)) {
      bgm.play().catch((err) => {
        console.warn('[AudioService] BGM playback deferred (waiting for interaction):', err);
      });
    }

    const startVolume = bgm.volume;
    const diff = targetVolume - startVolume;
    if (Math.abs(diff) < 0.01) {
      bgm.volume = targetVolume;
      if (targetVolume <= 0 && !bgm.paused) {
        try { bgm.pause(); } catch {}
      }
      return;
    }

    const intervalMs = 30;
    const steps = Math.max(1, Math.round(fadeDurationMs / intervalMs));
    let step = 0;

    this.bgmFadeTimer = setInterval(() => {
      step++;
      const nextVolume = Math.max(0, Math.min(1, startVolume + diff * (step / steps)));
      if (this.bgmAudio) {
        this.bgmAudio.volume = nextVolume;
      }

      if (step >= steps) {
        if (this.bgmFadeTimer) {
          clearInterval(this.bgmFadeTimer);
          this.bgmFadeTimer = null;
        }
        if (this.bgmAudio) {
          this.bgmAudio.volume = targetVolume;
          if (targetVolume <= 0 && !this.bgmAudio.paused) {
            try { this.bgmAudio.pause(); } catch {}
          }
        }
      }
    }, intervalMs);
  }

  public ensureBgmPlaying(): void {
    if (typeof window === 'undefined') return;
    const targetVolume = this.calculateTargetBgmVolume();
    if (targetVolume > 0) {
      const bgm = this.initBgmAudio();
      if (bgm && (bgm.paused || bgm.ended)) {
        bgm.play().catch((err) => {
          console.warn('[AudioService] ensureBgmPlaying deferred:', err);
        });
      }
      this.updateBgm(500);
    }
  }

  public getBgmCurrentTime(): number {
    if (!this.bgmAudio) return 0;
    return this.bgmAudio.currentTime;
  }

  public isBgmActive(): boolean {
    return Boolean(
      this.bgmAudio &&
      !this.bgmAudio.paused &&
      !this.bgmAudio.ended &&
      this.bgmAudio.currentTime > 0
    );
  }

  public getBgmOffsetMs(): number {
    return this.settings.bgmOffsetMs || 0;
  }

  public stopBgm(fadeDurationMs = 600): void {
    this.settings.bgmPlaying = false;
    this.updateBgm(fadeDurationMs);
  }

  public startBgm(fadeDurationMs = 600): void {
    this.settings.bgmPlaying = true;
    this.updateBgm(fadeDurationMs);
  }

  public isBgmPlaying(): boolean {
    return Boolean(this.bgmAudio && !this.bgmAudio.paused && !this.bgmAudio.ended && this.bgmAudio.volume > 0.01);
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

  public playSwooshSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;
    this.playAudioFile('/audio/swoosh.mp3', 0.85);
  }

  public playRevealAllSound(): void {
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;
    // Layer swoosh.mp3 with single reveal sound (correct.mp3)
    this.playSwooshSound();
    this.playCorrectSound();
  }

  public async preloadClickSound(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.clickBuffer || this.clickBufferLoading) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      this.clickBufferLoading = true;
      const res = await fetch('/audio/click-short.wav');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      this.clickBuffer = await ctx.decodeAudioData(arrayBuf);
    } catch (err) {
      console.warn('Failed to preload click-short.wav buffer:', err);
    } finally {
      this.clickBufferLoading = false;
    }
  }

  public playClickSound(volumeScale = 0.85): void {
    if (typeof window === 'undefined') return;
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    const ctx = this.getAudioContext();
    if (ctx && this.clickBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = this.clickBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(
          Math.max(0, Math.min(this.settings.soundVolume * volumeScale, 1)),
          ctx.currentTime
        );
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch (err) {
        console.warn('WebAudio click playback failed:', err);
      }
    }

    // Fallback using HTMLAudioElement
    this.playAudioFile('/audio/click-short.wav', volumeScale);
    if (!this.clickBuffer) {
      this.preloadClickSound().catch(() => {});
    }
  }

  private playSynthesizedClick(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
    gain.gain.setValueAtTime(this.settings.soundVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  private fadeTimers: Map<HTMLAudioElement, ReturnType<typeof setInterval>> = new Map();

  private fadeOutAndStop(audio: HTMLAudioElement | null, durationMs = 600): void {
    if (!audio) return;

    if (this.fadeTimers.has(audio)) {
      clearInterval(this.fadeTimers.get(audio)!);
      this.fadeTimers.delete(audio);
    }

    if (audio.paused || audio.ended) {
      try {
        audio.currentTime = 0;
      } catch {}
      return;
    }

    const startVolume = audio.volume;
    if (startVolume <= 0) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      return;
    }

    const intervalTime = 30;
    const steps = Math.max(1, Math.round(durationMs / intervalTime));
    const volumeStep = startVolume / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const nextVolume = Math.max(0, startVolume - volumeStep * step);
      audio.volume = nextVolume;

      if (step >= steps || nextVolume <= 0.01) {
        clearInterval(timer);
        this.fadeTimers.delete(audio);
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore seek errors on pause
        }
        // Reset volume back to initial for next playback
        audio.volume = startVolume;
      }
    }, intervalTime);

    this.fadeTimers.set(audio, timer);
  }

  public playApplauseSound(onEnded?: () => void): void {
    if (typeof window === 'undefined') return;
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    try {
      if (!this.applauseAudio) {
        this.applauseAudio = new Audio('/audio/applause.wav');
      }
      if (this.fadeTimers.has(this.applauseAudio)) {
        clearInterval(this.fadeTimers.get(this.applauseAudio)!);
        this.fadeTimers.delete(this.applauseAudio);
      }
      this.applauseAudio.loop = false;
      this.applauseAudio.volume = Math.max(0, Math.min(this.settings.soundVolume * 0.9, 1));
      this.applauseAudio.currentTime = 0;
      this.applauseAudio.onended = () => {
        if (onEnded) onEnded();
      };
      this.applauseAudio.play().catch((err) => {
        console.warn('Applause play failed:', err);
      });
    } catch (err) {
      console.warn('Error playing applause:', err);
    }
  }

  public stopApplauseSound(durationMs = 600): void {
    this.fadeOutAndStop(this.applauseAudio, durationMs);
  }

  public isApplausePlaying(): boolean {
    return Boolean(this.applauseAudio && !this.applauseAudio.paused && !this.applauseAudio.ended);
  }

  public playIntroMusic(onEnded?: () => void): void {
    if (typeof window === 'undefined') return;
    if (!this.settings.soundEnabled || this.settings.soundVolume <= 0) return;

    try {
      if (!this.introAudio) {
        this.introAudio = new Audio('/audio/intro.mp3');
      }
      if (this.fadeTimers.has(this.introAudio)) {
        clearInterval(this.fadeTimers.get(this.introAudio)!);
        this.fadeTimers.delete(this.introAudio);
      }
      this.introAudio.loop = false;
      this.introAudio.volume = this.settings.soundVolume;
      this.introAudio.currentTime = 0;
      this.introAudio.onended = () => {
        if (onEnded) onEnded();
      };
      this.introAudio.play().catch((err) => {
        console.warn('Intro music play failed:', err);
      });
    } catch (err) {
      console.warn('Error starting intro music:', err);
    }
  }

  public stopIntroMusic(durationMs = 600): void {
    this.fadeOutAndStop(this.introAudio, durationMs);
  }

  public isIntroPlaying(): boolean {
    return Boolean(this.introAudio && !this.introAudio.paused && !this.introAudio.ended);
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
