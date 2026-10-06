import assert from 'node:assert';

export function getAnswerFontSizeClass(text: string): string {
  const len = text.trim().length;
  if (len <= 12) {
    return 'text-xl md:text-2xl';
  } else if (len <= 20) {
    return 'text-base md:text-lg';
  } else {
    return 'text-sm md:text-base';
  }
}

// Test short names
assert.strictEqual(getAnswerFontSizeClass('Rem'), 'text-xl md:text-2xl');
// Test medium names
assert.strictEqual(getAnswerFontSizeClass('Mai Sakurajima'), 'text-base md:text-lg');
// Test long titles
assert.strictEqual(getAnswerFontSizeClass('Koro-sensei (Assassination Classroom)'), 'text-sm md:text-base');

console.log('FlipCard responsive text sizing test passed!');
