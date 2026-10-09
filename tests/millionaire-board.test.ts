import assert from 'node:assert';
import {
  getOptionVisualState,
  getCorrectOptionIndex,
  getOptionClasses,
  getQuestionFontSize,
  getOptionFontSize,
  MillionaireBoard
} from '../src/components/MainDisplay/MillionaireBoard';
import { MillionaireQuestion } from '../src/types/quiz';

const sampleQuestion: MillionaireQuestion = {
  id: 1,
  category: 'Anime Populer',
  anime: 'Solo Leveling',
  question: 'Kata perintah yang diucapkan Sung Jinwoo untuk membangkitkan monster yang telah mati menjadi prajurit bayangannya adalah...',
  options: ['Awake', 'Arise', 'Revive', 'Summon'],
  answer: 'Arise',
  hint: 'Diucapkan dengan nada dingin dan berwibawa.',
  explanation: 'Sung Jinwoo membangkitkan pasukan bayangan menggunakan perintah Arise.'
};

console.log('Testing MillionaireBoard logic...');

// 1. Correct Option Index Resolution
{
  const correctIdx = getCorrectOptionIndex(sampleQuestion);
  assert.strictEqual(correctIdx, 1, 'Arise should be index 1');

  // Letter fallback test
  const letterQuestion: MillionaireQuestion = {
    ...sampleQuestion,
    answer: 'C'
  };
  assert.strictEqual(getCorrectOptionIndex(letterQuestion), 2, 'Answer C should resolve to index 2');
}

// 2. Option Visual State Classification
{
  const correctOptionIndex = 1; // Option B ('Arise')

  // Case A: Idle state (no selection, not locked, not revealed)
  for (let idx = 0; idx < 4; idx++) {
    const state = getOptionVisualState({
      optionIndex: idx,
      selectedOptionIndex: null,
      isLocked: false,
      isRevealed: false,
      correctOptionIndex
    });
    assert.strictEqual(state, 'idle', `Option ${idx} should be idle when nothing selected`);
  }

  // Case B: Highlighted state (selectedOptionIndex matches, not locked, not revealed)
  {
    const stateSelected = getOptionVisualState({
      optionIndex: 0,
      selectedOptionIndex: 0,
      isLocked: false,
      isRevealed: false,
      correctOptionIndex
    });
    assert.strictEqual(stateSelected, 'highlighted', 'Selected unconfirmed option should be highlighted');

    const stateUnselected = getOptionVisualState({
      optionIndex: 1,
      selectedOptionIndex: 0,
      isLocked: false,
      isRevealed: false,
      correctOptionIndex
    });
    assert.strictEqual(stateUnselected, 'idle', 'Unselected option should remain idle');
  }

  // Case C: Locked state (selectedOptionIndex matches, isLocked is true, not revealed)
  {
    const stateLocked = getOptionVisualState({
      optionIndex: 2,
      selectedOptionIndex: 2,
      isLocked: true,
      isRevealed: false,
      correctOptionIndex
    });
    assert.strictEqual(stateLocked, 'locked', 'Locked option should have locked status');

    const stateUnselected = getOptionVisualState({
      optionIndex: 1,
      selectedOptionIndex: 2,
      isLocked: true,
      isRevealed: false,
      correctOptionIndex
    });
    assert.strictEqual(stateUnselected, 'idle', 'Other options remain idle while one is locked');
  }

  // Case D: Revealed Correct Answer (Player chose correctly)
  {
    // Player picked option 1 (correct)
    const stateCorrect = getOptionVisualState({
      optionIndex: 1,
      selectedOptionIndex: 1,
      isLocked: true,
      isRevealed: true,
      correctOptionIndex
    });
    assert.strictEqual(stateCorrect, 'revealed-correct', 'Correct answer should have revealed-correct status');

    const stateOther = getOptionVisualState({
      optionIndex: 0,
      selectedOptionIndex: 1,
      isLocked: true,
      isRevealed: true,
      correctOptionIndex
    });
    assert.strictEqual(stateOther, 'revealed-idle', 'Unselected wrong options should be revealed-idle');
  }

  // Case E: Revealed Wrong Answer (Player chose wrong)
  {
    // Player picked option 0 (Awake), but correct is option 1 (Arise)
    const stateWrongChosen = getOptionVisualState({
      optionIndex: 0,
      selectedOptionIndex: 0,
      isLocked: true,
      isRevealed: true,
      correctOptionIndex
    });
    assert.strictEqual(stateWrongChosen, 'revealed-wrong', 'Chosen wrong answer should have revealed-wrong status');

    const stateCorrectAnswer = getOptionVisualState({
      optionIndex: 1,
      selectedOptionIndex: 0,
      isLocked: true,
      isRevealed: true,
      correctOptionIndex
    });
    assert.strictEqual(stateCorrectAnswer, 'revealed-correct', 'Actual correct answer should show revealed-correct status');

    const stateOtherUnchosen = getOptionVisualState({
      optionIndex: 2,
      selectedOptionIndex: 0,
      isLocked: true,
      isRevealed: true,
      correctOptionIndex
    });
    assert.strictEqual(stateOtherUnchosen, 'revealed-idle', 'Unselected wrong answer should be revealed-idle');
  }
}

// 3. Option Classes Verification
{
  const idleClasses = getOptionClasses('idle', false);
  assert.ok(idleClasses.container.includes('border-[#00F0FF]/40'), 'Idle container has subtle cyan border');

  const highlightClasses = getOptionClasses('highlighted', false);
  assert.ok(
    highlightClasses.container.includes('#FF9F0A') || highlightClasses.container.includes('#FFD600'),
    'Highlighted container has amber/orange styling'
  );

  const lockedClasses = getOptionClasses('locked', false);
  assert.ok(lockedClasses.container.includes('#FFD600'), 'Locked container has gold styling');
  assert.ok(lockedClasses.container.includes('animate-pulse'), 'Locked container has pulsating animation');

  const correctClasses = getOptionClasses('revealed-correct', false);
  assert.ok(correctClasses.container.includes('#00FF88'), 'Correct container has emerald green styling');

  const wrongClasses = getOptionClasses('revealed-wrong', false);
  assert.ok(wrongClasses.container.includes('#FF2E55'), 'Wrong container has red styling');

  // Transparent OBS mode
  const transparentIdle = getOptionClasses('idle', true);
  assert.ok(
    transparentIdle.container.includes('bg-transparent') || transparentIdle.container.includes('backdrop-blur'),
    'Transparent theme uses transparent background styling'
  );
}

// 4. Responsive Font Size Utilities
{
  assert.strictEqual(getQuestionFontSize('Short question'), 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl');
  assert.strictEqual(getOptionFontSize('Short text'), 'text-base sm:text-lg lg:text-xl');
}

// 5. Component Export Verification
assert.ok(typeof MillionaireBoard === 'function', 'MillionaireBoard component is exported');

console.log('All MillionaireBoard tests passed successfully!');
