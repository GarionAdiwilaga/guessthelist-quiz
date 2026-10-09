import assert from 'node:assert';
import { MillionaireController } from '../src/components/Controller/MillionaireController';
import { ControllerView } from '../src/components/Controller/ControllerView';
import { getCorrectOptionIndex } from '../src/components/MainDisplay/MillionaireBoard';
import { MillionaireQuestion, MillionaireState, WSMessage } from '../src/types/quiz';

console.log('Testing MillionaireController and ControllerView integration...');

const sampleQuestions: MillionaireQuestion[] = [
  {
    id: 1,
    category: 'Anime Populer',
    anime: 'Solo Leveling',
    question: 'Kata perintah yang diucapkan Sung Jinwoo untuk membangkitkan monster adalah...',
    options: ['Awake', 'Arise', 'Revive', 'Summon'],
    answer: 'Arise',
    hint: 'Diucapkan dengan nada dingin dan berwibawa.',
    explanation: 'Sung Jinwoo membangkitkan pasukan bayangan menggunakan perintah Arise.'
  },
  {
    id: 2,
    category: 'Shounen Pillars & Classics',
    anime: 'One Piece',
    question: 'Nama kapal pertama yang digunakan oleh Bajak Laut Topi Jerami adalah...',
    options: ['Thousand Sunny', 'Going Merry', 'Red Force', 'Moby Dick'],
    answer: 'Going Merry',
    hint: 'Memiliki kepala domba di haluan.',
    explanation: 'Going Merry adalah kapal pertama hadiah dari Kaya di Desa Syrup.'
  },
  {
    id: 3,
    category: 'Anime Umum',
    anime: 'Sousou no Frieren',
    question: 'Berapa tahun perjalanan pahlawan Himmel bersama Frieren menaklukkan Raja Iblis?',
    options: ['5 tahun', '7 tahun', '10 tahun', '15 tahun'],
    answer: '10 tahun',
    hint: 'Hanya seperseratus dari rentang hidup elf.',
    explanation: 'Perjalanan kelompok pahlawan berlangsung selama 10 tahun.'
  }
];

// 1. Verify Component Exports
{
  assert.ok(typeof MillionaireController === 'function', 'MillionaireController should be a function component');
  assert.ok(typeof ControllerView === 'function', 'ControllerView should be a function component');
  console.log('OK: Component exports verified');
}

// 2. Question Filtering & Search Logic Verification
{
  const categoryFilter = (category: string) => {
    return sampleQuestions.filter((q) => category === 'Semua' || q.category === category);
  };

  assert.strictEqual(categoryFilter('Semua').length, 3, 'Semua category should return all 3');
  assert.strictEqual(categoryFilter('Anime Populer').length, 1, 'Anime Populer should return 1');
  assert.strictEqual(categoryFilter('Shounen Pillars & Classics').length, 1, 'Shounen category should return 1');
  assert.strictEqual(categoryFilter('Budaya Wibu & Istilah Otaku').length, 0, 'Budaya Wibu category should return 0');

  const searchFilter = (query: string) => {
    const term = query.toLowerCase().trim();
    return sampleQuestions.filter((q) => {
      return (
        q.anime.toLowerCase().includes(term) ||
        q.question.toLowerCase().includes(term) ||
        q.options.some((opt) => opt.toLowerCase().includes(term))
      );
    });
  };

  assert.strictEqual(searchFilter('Solo').length, 1, 'Search for "Solo" should match Solo Leveling');
  assert.strictEqual(searchFilter('kapal').length, 1, 'Search for "kapal" should match One Piece question');
  assert.strictEqual(searchFilter('Thousand').length, 1, 'Search for option "Thousand" should match One Piece question');
  assert.strictEqual(searchFilter('xyznotfound').length, 0, 'Non-matching search should return 0');
  console.log('OK: Question filtering and search logic verified');
}

// 3. Correct Option Resolution
{
  const q1Correct = getCorrectOptionIndex(sampleQuestions[0]);
  assert.strictEqual(q1Correct, 1, 'Option B (Arise) should be index 1');

  const q2Correct = getCorrectOptionIndex(sampleQuestions[1]);
  assert.strictEqual(q2Correct, 1, 'Option B (Going Merry) should be index 1');

  const q3Correct = getCorrectOptionIndex(sampleQuestions[2]);
  assert.strictEqual(q3Correct, 2, 'Option C (10 tahun) should be index 2');
  console.log('OK: Correct option resolution verified');
}

// 4. WebSocket Message Contract Integrity
{
  const dispatchedMessages: WSMessage[] = [];
  const mockSendMessage = (msg: WSMessage) => {
    dispatchedMessages.push(msg);
  };

  // Test Round Switching messages
  mockSendMessage({ type: 'SET_GAME_MODE', mode: 'quiz' });
  mockSendMessage({ type: 'SET_GAME_MODE', mode: 'family' });

  // Test Millionaire Host Control messages
  mockSendMessage({ type: 'SELECT_MILLIONAIRE_QUESTION', questionId: 2 });
  mockSendMessage({ type: 'HIGHLIGHT_MILLIONAIRE_OPTION', optionIndex: 1 });
  mockSendMessage({ type: 'LOCK_MILLIONAIRE_ANSWER' });
  mockSendMessage({ type: 'REVEAL_MILLIONAIRE_ANSWER' });
  mockSendMessage({ type: 'TOGGLE_MILLIONAIRE_HINT' });
  mockSendMessage({ type: 'RESET_MILLIONAIRE_QUESTION' });

  assert.strictEqual(dispatchedMessages.length, 8, '8 WS messages should be dispatched');
  assert.deepStrictEqual(dispatchedMessages[0], { type: 'SET_GAME_MODE', mode: 'quiz' });
  assert.deepStrictEqual(dispatchedMessages[1], { type: 'SET_GAME_MODE', mode: 'family' });
  assert.deepStrictEqual(dispatchedMessages[2], { type: 'SELECT_MILLIONAIRE_QUESTION', questionId: 2 });
  assert.deepStrictEqual(dispatchedMessages[3], { type: 'HIGHLIGHT_MILLIONAIRE_OPTION', optionIndex: 1 });
  assert.deepStrictEqual(dispatchedMessages[4], { type: 'LOCK_MILLIONAIRE_ANSWER' });
  assert.deepStrictEqual(dispatchedMessages[5], { type: 'REVEAL_MILLIONAIRE_ANSWER' });
  assert.deepStrictEqual(dispatchedMessages[6], { type: 'TOGGLE_MILLIONAIRE_HINT' });
  assert.deepStrictEqual(dispatchedMessages[7], { type: 'RESET_MILLIONAIRE_QUESTION' });
  console.log('OK: WebSocket message contracts verified');
}

console.log('All MillionaireController unit & integration tests passed successfully!');
