import { startServer } from '../server/index.js';
import WebSocket from 'ws';
import assert from 'node:assert';

function waitForMessage(ws) {
  return new Promise((resolve) => {
    ws.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });
}

async function run() {
  const serverInstance = await startServer(3099);
  const wsUrl = 'ws://localhost:3099/ws';

  try {
    const ws1 = new WebSocket(wsUrl);
    const p1 = waitForMessage(ws1);
    const ws2 = new WebSocket(wsUrl);
    const p2 = waitForMessage(ws2);

    const [init1, init2] = await Promise.all([p1, p2]);

    assert.strictEqual(init1.type, 'STATE_SNAPSHOT');
    assert.strictEqual(init2.type, 'STATE_SNAPSHOT');
    assert.strictEqual(init2.state.categoryId, init2.categories[0].id);
    assert.ok(init2.categories.length >= 1);

    // Client 1 reveals item
    const itemToReveal = init1.categories[0].items[0].id;
    const nextMsgPromise = waitForMessage(ws2);
    ws1.send(JSON.stringify({ type: 'REVEAL_ITEM', itemId: itemToReveal }));

    const updated = await nextMsgPromise;
    assert.strictEqual(updated.type, 'STATE_SNAPSHOT');
    assert.ok(updated.state.revealedItemIds.includes(itemToReveal));

    // Client 1 sets strikes
    const strikeMsgPromise = waitForMessage(ws2);
    ws1.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 2 }));
    const strikeUpdated = await strikeMsgPromise;
    assert.strictEqual(strikeUpdated.state.currentStrikes, 2);

    ws1.close();
    ws2.close();
    await serverInstance.close();
    console.log('Server WebSocket synchronization test passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    await serverInstance.close();
    process.exit(1);
  }
}

run();
