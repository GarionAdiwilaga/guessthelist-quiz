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

console.log('Audio service unit tests passed successfully!');
