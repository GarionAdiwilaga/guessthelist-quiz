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

  let server1 = null;
  let server2 = null;
  let ws1 = null;
  let ws2 = null;

  try {
    // Clean existing config before test to verify creation
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    const port1 = 3598;
    server1 = await startServer(port1);
    const ws1Url = `ws://localhost:${port1}/ws`;

    ws1 = new WebSocket(ws1Url);
    const init1 = await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT');
    assert.strictEqual(init1.type, 'STATE_SNAPSHOT');

    // Mutate state through WebSocket actions
    console.log('Modifying state via WebSocket actions...');
    ws1.send(JSON.stringify({ type: 'SET_GAME_MODE', mode: 'family' }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.gameMode === 'family');

    ws1.send(JSON.stringify({ type: 'SELECT_MILLIONAIRE_QUESTION', questionId: 42 }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.millionaireState.currentQuestionId === 42);

    const secondCat = init1.categories[1] || init1.categories[0];
    ws1.send(JSON.stringify({ type: 'SELECT_CATEGORY', categoryId: secondCat.id }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.categoryId === secondCat.id);

    ws1.send(JSON.stringify({
      type: 'UPDATE_AUDIO_CONFIG',
      settings: {
        soundVolume: 0.65,
        bgmVolume: 0.45,
        soundEnabled: false,
        bgmOffsetMs: -120
      }
    }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.soundVolume === 0.65 && m.state.bgmOffsetMs === -120);

    ws1.send(JSON.stringify({
      type: 'UPDATE_STRIKE_CONFIG',
      enabled: true,
      maxSlots: 4
    }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.strikeSlotsEnabled === true && m.state.maxStrikeSlots === 4);

    ws1.send(JSON.stringify({ type: 'SET_THEME_MODE', mode: 'transparent' }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.themeMode === 'transparent');

    ws1.send(JSON.stringify({ type: 'UPDATE_TITLE_LOGO', logoUrl: 'https://example.com/logo.png' }));
    await waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT' && m.state.titleLogoUrl === 'https://example.com/logo.png');

    // Give write a moment if asynchronous, then verify disk file
    assert.ok(fs.existsSync(configPath), 'quiz-config.json must exist on disk after state modifications');
    const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(savedConfig.gameMode, 'family');
    assert.strictEqual(savedConfig.currentMillionaireQuestionId, 42);
    assert.strictEqual(savedConfig.familyCategoryId, secondCat.id);
    assert.strictEqual(savedConfig.soundVolume, 0.65);
    assert.strictEqual(savedConfig.bgmVolume, 0.45);
    assert.strictEqual(savedConfig.soundEnabled, false);
    assert.strictEqual(savedConfig.bgmOffsetMs, -120);
    assert.strictEqual(savedConfig.strikeSlotsEnabled, true);
    assert.strictEqual(savedConfig.maxStrikeSlots, 4);
    assert.strictEqual(savedConfig.themeMode, 'transparent');
    assert.strictEqual(savedConfig.titleLogoUrl, 'https://example.com/logo.png');
    console.log('OK: quiz-config.json content verified');

    ws1.close();
    await server1.close();
    server1 = null;

    // Reboot server on new port
    console.log('Rebooting server on new port to test restoration...');
    const port2 = 3599;
    server2 = await startServer(port2);
    const ws2Url = `ws://localhost:${port2}/ws`;
    ws2 = new WebSocket(ws2Url);

    const restoredInit = await waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT');
    assert.strictEqual(restoredInit.state.gameMode, 'family', 'gameMode must be restored from persistent config');
    assert.strictEqual(restoredInit.state.millionaireState.currentQuestionId, 42, 'currentMillionaireQuestionId must be restored');
    assert.strictEqual(restoredInit.state.categoryId, secondCat.id, 'categoryId must be restored');
    assert.strictEqual(restoredInit.state.soundVolume, 0.65, 'soundVolume must be restored');
    assert.strictEqual(restoredInit.state.bgmVolume, 0.45, 'bgmVolume must be restored');
    assert.strictEqual(restoredInit.state.soundEnabled, false, 'soundEnabled must be restored');
    assert.strictEqual(restoredInit.state.bgmOffsetMs, -120, 'bgmOffsetMs must be restored');
    assert.strictEqual(restoredInit.state.strikeSlotsEnabled, true, 'strikeSlotsEnabled must be restored');
    assert.strictEqual(restoredInit.state.maxStrikeSlots, 4, 'maxStrikeSlots must be restored');
    assert.strictEqual(restoredInit.state.themeMode, 'transparent', 'themeMode must be restored');
    assert.strictEqual(restoredInit.state.titleLogoUrl, 'https://example.com/logo.png', 'titleLogoUrl must be restored');

    // Test REST API GET /api/state
    const apiRes = await fetch(`http://localhost:${port2}/api/state`);
    const apiData = await apiRes.json();
    assert.strictEqual(apiData.state.gameMode, 'family');
    assert.strictEqual(apiData.state.millionaireState.currentQuestionId, 42);
    assert.ok(Array.isArray(apiData.millionaireQuestions));

    ws2.close();
    await server2.close();
    server2 = null;

    console.log('All persistence tests passed successfully!');
  } catch (err) {
    console.error('Persistence test failed:', err);
    if (ws1) ws1.terminate();
    if (ws2) ws2.terminate();
    if (server1) await server1.close().catch(() => {});
    if (server2) await server2.close().catch(() => {});
    process.exit(1);
  } finally {
    // Restore or remove config to prevent polluting other test runs
    if (backupConfig !== null) {
      fs.writeFileSync(configPath, backupConfig, 'utf8');
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
  process.exit(0);
}

run();
