import assert from 'node:assert';
import { getAnswerFontSize } from '../src/components/MainDisplay/FlipCard';

// Test short names (<= 14 chars)
assert.strictEqual(getAnswerFontSize('Rem'), 'text-base sm:text-lg lg:text-xl');
assert.strictEqual(getAnswerFontSize('Mai Sakurajima'), 'text-base sm:text-lg lg:text-xl');
// Test medium names (<= 26 chars)
assert.strictEqual(getAnswerFontSize('Sousou no Frieren'), 'text-sm sm:text-base lg:text-lg');
// Test long titles (> 26 chars)
assert.strictEqual(getAnswerFontSize('Spice and Wolf (Ookami to Koushinryou)'), 'text-xs sm:text-sm lg:text-base');

console.log('FlipCard responsive text sizing test passed!');
