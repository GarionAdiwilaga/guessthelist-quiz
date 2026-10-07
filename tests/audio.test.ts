import assert from 'node:assert';
import { audioService } from '../src/services/audio.ts';

// Test volume clamping and state update
audioService.updateSettings({
  soundEnabled: true,
  soundVolume: 1.5, // should clamp to 1.0
  customAudio: {
    useCustomSound: false,
    correctAudioDataUrl: null,
    wrongAudioDataUrl: null
  }
});

let settings = audioService.getSettings();
assert.strictEqual(settings.soundVolume, 1.0, 'Volume should be clamped to 1.0');
assert.strictEqual(settings.soundEnabled, true);

audioService.updateSettings({
  soundVolume: -0.5 // should clamp to 0.0
});
settings = audioService.getSettings();
assert.strictEqual(settings.soundVolume, 0.0, 'Volume should be clamped to 0.0');

// Test custom sound settings
audioService.updateSettings({
  soundEnabled: false,
  soundVolume: 0.8,
  customAudio: {
    useCustomSound: true,
    correctAudioDataUrl: 'data:audio/mp3;base64,AAAA',
    wrongAudioDataUrl: 'data:audio/mp3;base64,BBBB'
  }
});
settings = audioService.getSettings();
assert.strictEqual(settings.soundEnabled, false);
assert.strictEqual(settings.customAudio.useCustomSound, true);
assert.strictEqual(settings.customAudio.correctAudioDataUrl, 'data:audio/mp3;base64,AAAA');

// Test stop methods execute safely without error
audioService.stopApplauseSound();
audioService.stopIntroMusic();
assert.strictEqual(audioService.isApplausePlaying(), false);
assert.strictEqual(audioService.isIntroPlaying(), false);

// Test BGM loop volume scaling: 100% at Layar Judul, 50% at Game Screen
audioService.updateSettings({
  soundEnabled: true,
  bgmEnabled: true,
  bgmVolume: 0.8,
  bgmPlaying: true
});

// At Layar Judul (isTitleScreen = true) -> 100% of bgmVolume
audioService.setScreen(true);
assert.strictEqual(audioService.getScreen(), true);
assert.strictEqual(audioService.calculateTargetBgmVolume(), 0.8, 'BGM volume should be 100% (0.8) at Layar Judul');

// At Game Screen (isTitleScreen = false) -> 50% of bgmVolume
audioService.setScreen(false);
assert.strictEqual(audioService.getScreen(), false);
assert.strictEqual(audioService.calculateTargetBgmVolume(), 0.4, 'BGM volume should be 50% (0.4) at Game screen');

// Test stopping BGM loop
audioService.stopBgm();
assert.strictEqual(audioService.calculateTargetBgmVolume(), 0.0, 'Stopped BGM should have target volume 0');

// Test resuming BGM loop
audioService.startBgm();
assert.strictEqual(audioService.calculateTargetBgmVolume(), 0.4, 'Resumed BGM at Game screen should have target volume 0.4');

// Test changing BGM volume
audioService.updateSettings({ bgmVolume: 1.0 });
assert.strictEqual(audioService.calculateTargetBgmVolume(), 0.5, 'BGM at Game screen with 1.0 volume should be 0.5 (50%)');
audioService.setScreen(true);
assert.strictEqual(audioService.calculateTargetBgmVolume(), 1.0, 'BGM at Layar Judul with 1.0 volume should be 1.0 (100%)');

console.log('Audio service unit tests passed successfully!');
