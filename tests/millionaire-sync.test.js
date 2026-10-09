import { startServer } from '../server/index.js';
import WebSocket from 'ws';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function waitForMessage(ws, predicate = () => true, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', handler);
      reject(new Error(`Timeout waiting for WebSocket message after ${timeoutMs}ms`));
    }, timeoutMs);

    const handler = (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (predicate(msg)) {
          clearTimeout(timer);
          ws.off('message', handler);
          resolve(msg);
        }
      } catch {
        // Ignore JSON parse error on partial message
      }
    };
    ws.on('message', handler);
  });
}

async function run() {
  const rootDir = process.cwd();
  const configPath = path.resolve(rootDir, 'quiz-config.json');
  const backupConfig = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : null;

  const testPort = 3499;
  const serverInstance = await startServer(testPort);
  const wsUrl = `ws://localhost:${testPort}/ws`;

  let ws1 = null;
  let ws2 = null;

  try {
    ws1 = new WebSocket(wsUrl);
    ws2 = new WebSocket(wsUrl);

    const [init1, init2] = await Promise.all([
      waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT'),
      waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT')
    ]);

    assert.strictEqual(init1.type, 'STATE_SNAPSHOT');
    assert.strictEqual(init2.type, 'STATE_SNAPSHOT');
    assert.ok(Array.isArray(init1.millionaireQuestions), 'millionaireQuestions should be present in STATE_SNAPSHOT');
    assert.ok(init1.millionaireQuestions.length >= 10, 'millionaireQuestions should contain loaded questions');
    assert.ok(init1.state.millionaireState, 'millionaireState should exist on currentState');
    assert.strictEqual(init1.state.gameMode, 'quiz', 'default gameMode should be quiz');

    // 1. SET_GAME_MODE
    console.log('Testing SET_GAME_MODE...');
    const modePromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.gameMode === 'family');
    ws1.send(JSON.stringify({ type: 'SET_GAME_MODE', mode: 'family' }));
    const modeState = await modePromise;
    assert.strictEqual(modeState.state.gameMode, 'family');
    assert.ok(modeState.state.transitionWipeTimestamp > 0);

    // Switch back to quiz mode
    const modeQuizPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.gameMode === 'quiz');
    ws1.send(JSON.stringify({ type: 'SET_GAME_MODE', mode: 'quiz' }));
    await modeQuizPromise;
    console.log('OK: SET_GAME_MODE verified');

    // 2. SELECT_MILLIONAIRE_QUESTION
    console.log('Testing SELECT_MILLIONAIRE_QUESTION...');
    const targetQuestion = init1.millionaireQuestions.find((q) => q.id === 2) || init1.millionaireQuestions[1];
    const selectPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.currentQuestionId === targetQuestion.id);
    ws1.send(JSON.stringify({ type: 'SELECT_MILLIONAIRE_QUESTION', questionId: targetQuestion.id }));
    const selectedState = await selectPromise;
    assert.strictEqual(selectedState.state.millionaireState.currentQuestionId, targetQuestion.id);
    assert.strictEqual(selectedState.state.millionaireState.selectedOptionIndex, null);
    assert.strictEqual(selectedState.state.millionaireState.isLocked, false);
    assert.strictEqual(selectedState.state.millionaireState.isRevealed, false);
    assert.strictEqual(selectedState.state.millionaireState.showHint, false);
    console.log('OK: SELECT_MILLIONAIRE_QUESTION verified');

    // 3. HIGHLIGHT_MILLIONAIRE_OPTION
    console.log('Testing HIGHLIGHT_MILLIONAIRE_OPTION...');
    const highlightStatePromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.selectedOptionIndex === 1);
    const highlightSoundPromise = waitForMessage(ws2, (m) => m.type === 'PLAY_SOUND' && m.sound === 'click');
    ws1.send(JSON.stringify({ type: 'HIGHLIGHT_MILLIONAIRE_OPTION', optionIndex: 1 }));
    const [highlightState, highlightSound] = await Promise.all([highlightStatePromise, highlightSoundPromise]);
    assert.strictEqual(highlightState.state.millionaireState.selectedOptionIndex, 1);
    assert.strictEqual(highlightSound.sound, 'click');
    console.log('OK: HIGHLIGHT_MILLIONAIRE_OPTION verified');

    // 4. LOCK_MILLIONAIRE_ANSWER
    console.log('Testing LOCK_MILLIONAIRE_ANSWER...');
    const lockStatePromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.isLocked === true);
    const lockSoundPromise = waitForMessage(ws2, (m) => m.type === 'PLAY_SOUND' && m.sound === 'lock');
    ws1.send(JSON.stringify({ type: 'LOCK_MILLIONAIRE_ANSWER' }));
    const [lockedState, lockSound] = await Promise.all([lockStatePromise, lockSoundPromise]);
    assert.strictEqual(lockedState.state.millionaireState.isLocked, true);
    assert.strictEqual(lockSound.sound, 'lock');
    console.log('OK: LOCK_MILLIONAIRE_ANSWER verified');

    // 5. REVEAL_MILLIONAIRE_ANSWER (wrong answer scenario)
    console.log('Testing REVEAL_MILLIONAIRE_ANSWER (wrong answer)...');
    const correctIndex = targetQuestion.options.indexOf(targetQuestion.answer);
    assert.ok(correctIndex !== -1, 'target question must contain correct answer in options');
    // Ensure index 1 is not the correct answer or pick another index
    const wrongIndex = (correctIndex + 1) % 4;
    // Set to wrong index
    ws1.send(JSON.stringify({ type: 'HIGHLIGHT_MILLIONAIRE_OPTION', optionIndex: wrongIndex }));
    await waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.selectedOptionIndex === wrongIndex);

    const revealWrongStatePromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.isRevealed === true);
    const revealWrongSoundPromise = waitForMessage(ws2, (m) => m.type === 'PLAY_SOUND' && m.sound === 'buzzer');
    ws1.send(JSON.stringify({ type: 'REVEAL_MILLIONAIRE_ANSWER' }));
    const [revealedWrongState, revealedWrongSound] = await Promise.all([revealWrongStatePromise, revealWrongSoundPromise]);
    assert.strictEqual(revealedWrongState.state.millionaireState.isRevealed, true);
    assert.strictEqual(revealedWrongSound.sound, 'buzzer');
    console.log('OK: REVEAL_MILLIONAIRE_ANSWER (wrong answer) verified');

    // 6. RESET_MILLIONAIRE_QUESTION
    console.log('Testing RESET_MILLIONAIRE_QUESTION...');
    const resetPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.selectedOptionIndex === null);
    ws1.send(JSON.stringify({ type: 'RESET_MILLIONAIRE_QUESTION' }));
    const resetState = await resetPromise;
    assert.strictEqual(resetState.state.millionaireState.selectedOptionIndex, null);
    assert.strictEqual(resetState.state.millionaireState.isLocked, false);
    assert.strictEqual(resetState.state.millionaireState.isRevealed, false);
    assert.strictEqual(resetState.state.millionaireState.showHint, false);
    console.log('OK: RESET_MILLIONAIRE_QUESTION verified');

    // 7. REVEAL_MILLIONAIRE_ANSWER (correct answer scenario)
    console.log('Testing REVEAL_MILLIONAIRE_ANSWER (correct answer)...');
    ws1.send(JSON.stringify({ type: 'HIGHLIGHT_MILLIONAIRE_OPTION', optionIndex: correctIndex }));
    await waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.selectedOptionIndex === correctIndex);
    ws1.send(JSON.stringify({ type: 'LOCK_MILLIONAIRE_ANSWER' }));
    await waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.isLocked === true);

    const revealCorrectStatePromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.isRevealed === true);
    const revealCorrectSoundPromise = waitForMessage(ws2, (m) => m.type === 'PLAY_SOUND' && m.sound === 'correct');
    ws1.send(JSON.stringify({ type: 'REVEAL_MILLIONAIRE_ANSWER' }));
    const [revealedCorrectState, revealedCorrectSound] = await Promise.all([revealCorrectStatePromise, revealCorrectSoundPromise]);
    assert.strictEqual(revealedCorrectState.state.millionaireState.isRevealed, true);
    assert.strictEqual(revealedCorrectSound.sound, 'correct');
    console.log('OK: REVEAL_MILLIONAIRE_ANSWER (correct answer) verified');

    // 8. TOGGLE_MILLIONAIRE_HINT
    console.log('Testing TOGGLE_MILLIONAIRE_HINT...');
    const hintPromise1 = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.showHint === true);
    ws1.send(JSON.stringify({ type: 'TOGGLE_MILLIONAIRE_HINT' }));
    const hintState1 = await hintPromise1;
    assert.strictEqual(hintState1.state.millionaireState.showHint, true);

    const hintPromise2 = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.showHint === false);
    ws1.send(JSON.stringify({ type: 'TOGGLE_MILLIONAIRE_HINT', show: false }));
    const hintState2 = await hintPromise2;
    assert.strictEqual(hintState2.state.millionaireState.showHint, false);
    console.log('OK: TOGGLE_MILLIONAIRE_HINT verified');

    ws1.close();
    ws2.close();
    await serverInstance.close();
    console.log('All Millionaire WebSocket synchronization tests passed successfully!');
  } catch (err) {
    console.error('Test failed:', err);
    if (ws1) ws1.terminate();
    if (ws2) ws2.terminate();
    await serverInstance.close();
    process.exit(1);
  } finally {
    if (backupConfig !== null) {
      fs.writeFileSync(configPath, backupConfig, 'utf8');
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
  process.exit(0);
}

run();
