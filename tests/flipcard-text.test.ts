import assert from 'node:assert';

export function getAnswerFontSizeClass(text: string): string {
  const len = text.trim().length;
  if (len <= 14) {
    return 'text-sm sm:text-base lg:text-lg';
  } else if (len <= 24) {
    return 'text-xs sm:text-sm lg:text-base';
  } else {
    return 'text-[11px] sm:text-xs lg:text-sm';
  }
}

// Test short names
assert.strictEqual(getAnswerFontSizeClass('Rem'), 'text-sm sm:text-base lg:text-lg');
// Test medium names
assert.strictEqual(getAnswerFontSizeClass('Mai Sakurajima'), 'text-sm sm:text-base lg:text-lg');
// Test long titles
assert.strictEqual(getAnswerFontSizeClass('Koro-sensei (Assassination Classroom)'), 'text-[11px] sm:text-xs lg:text-sm');

console.log('FlipCard responsive text sizing test passed!');
