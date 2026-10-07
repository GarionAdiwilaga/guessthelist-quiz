import { startServer } from '../server/index.js';
import WebSocket from 'ws';
import assert from 'node:assert';

import fs from 'node:fs';
import path from 'node:path';

function waitForMessage(ws, predicate = () => true) {
  return new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (predicate(msg)) {
        ws.off('message', handler);
        resolve(msg);
      }
    };
    ws.on('message', handler);
  });
}

async function run() {
  const dbPath = path.resolve(process.cwd(), 'anime-family-database-ranked-top10.json');
  const backup = fs.existsSync(dbPath) ? fs.readFileSync(dbPath, 'utf8') : null;
  const testPort = 3399;
  const serverInstance = await startServer(testPort);
  const wsUrl = `ws://localhost:${testPort}/ws`;
  const apiUrl = `http://localhost:${testPort}/api`;

  try {
    const ws1 = new WebSocket(wsUrl);
    const ws2 = new WebSocket(wsUrl);

    const [snap1, snap2] = await Promise.all([
      waitForMessage(ws1, (m) => m.type === 'STATE_SNAPSHOT'),
      waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT')
    ]);

    assert.strictEqual(snap1.type, 'STATE_SNAPSHOT');
    assert.strictEqual(snap2.type, 'STATE_SNAPSHOT');

    // Test 1: ROLL_CLUE
    console.log('Testing ROLL_CLUE...');
    const rollPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.isCluePopupOpen === true);
    ws1.send(JSON.stringify({ type: 'ROLL_CLUE' }));
    const rolledState = await rollPromise;

    assert.strictEqual(rolledState.state.isCluePopupOpen, true);
    assert.ok(rolledState.state.clueRollTimestamp > 0);
    assert.ok(rolledState.state.clueRollTargetItemId !== null);
    console.log('✅ ROLL_CLUE successfully selected unrevealed target item and set isCluePopupOpen = true');

    // Test 2: DISMISS_CLUE
    console.log('Testing DISMISS_CLUE...');
    const dismissPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.state.isCluePopupOpen === false);
    ws1.send(JSON.stringify({ type: 'DISMISS_CLUE' }));
    const dismissedState = await dismissPromise;

    assert.strictEqual(dismissedState.state.isCluePopupOpen, false);
    console.log('✅ DISMISS_CLUE successfully closed clue popup');

    // Test 3: REST API GET /api/database
    console.log('Testing GET /api/database...');
    const getRes = await fetch(`${apiUrl}/database`);
    assert.strictEqual(getRes.status, 200);
    const currentDb = await getRes.json();
    assert.ok(Array.isArray(currentDb.categories));
    console.log(`✅ GET /api/database returned ${currentDb.categories.length} categories`);

    // Test 4: REST API POST /api/categories
    console.log('Testing POST /api/categories...');
    const modifiedCategories = JSON.parse(JSON.stringify(currentDb.categories));
    modifiedCategories[0].category = 'Kategori Test Dimodifikasi';
    
    const postCatPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT' && m.categories[0].category === 'Kategori Test Dimodifikasi');
    const catRes = await fetch(`${apiUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: modifiedCategories })
    });
    assert.strictEqual(catRes.status, 200);
    const catWsUpdate = await postCatPromise;
    assert.strictEqual(catWsUpdate.categories[0].category, 'Kategori Test Dimodifikasi');
    console.log('✅ POST /api/categories successfully updated and broadcasted modified category');

    // Test 5: REST API POST /api/database/reset
    console.log('Testing POST /api/database/reset...');
    const resetPromise = waitForMessage(ws2, (m) => m.type === 'STATE_SNAPSHOT');
    const resetRes = await fetch(`${apiUrl}/database/reset`, { method: 'POST' });
    assert.strictEqual(resetRes.status, 200);
    const resetBody = await resetRes.json();
    assert.strictEqual(resetBody.success, true);
    await resetPromise;

    // Verify it restored
    const afterResetGet = await fetch(`${apiUrl}/database`);
    const afterResetDb = await afterResetGet.json();
    assert.notStrictEqual(afterResetDb.categories[0].category, 'Kategori Test Dimodifikasi');
    console.log('✅ POST /api/database/reset restored default databank successfully');

    ws1.close();
    ws2.close();
    await serverInstance.close();
    console.log('🎉 All databank & clue roll tests passed!');
  } catch (err) {
    console.error('Test error:', err);
    await serverInstance.close();
    process.exitCode = 1;
  } finally {
    if (backup && fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, backup, 'utf8');
    }
  }
}

run();
