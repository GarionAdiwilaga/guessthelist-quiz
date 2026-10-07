import { startServer } from '../server/index.js';
import WebSocket from 'ws';
import assert from 'node:assert';

function waitForSnapshot(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    ws.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });
}

async function testE2E() {
  const port = 3199;
  const instance = await startServer(port);
  const wsUrl = `ws://localhost:${port}/ws`;

  try {
    const displayWs = new WebSocket(wsUrl);
    const controllerWs = new WebSocket(wsUrl);

    const [dispInit, ctrlInit] = await Promise.all([
      waitForSnapshot(displayWs),
      waitForSnapshot(controllerWs)
    ]);

    assert.strictEqual(dispInit.type, 'STATE_SNAPSHOT');
    assert.strictEqual(ctrlInit.type, 'STATE_SNAPSHOT');
    assert.strictEqual(dispInit.state.categoryId, dispInit.categories[0].id);
    assert.ok(dispInit.categories.length >= 2);

    // 1. Controller selects second Category
    const targetCat = dispInit.categories[1];
    let nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'SELECT_CATEGORY', categoryId: targetCat.id }));
    let updated = await nextSnap;
    assert.strictEqual(updated.state.categoryId, targetCat.id);
    assert.strictEqual(updated.state.revealedItemIds.length, 0);

    // 2. Controller reveals first 2 items of selected Category
    const cat2Items = updated.categories.find((c: any) => c.id === targetCat.id).items;
    const item1 = cat2Items[0].id;
    const item2 = cat2Items[1].id;

    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'REVEAL_ITEM', itemId: item1 }));
    updated = await nextSnap;
    assert.ok(updated.state.revealedItemIds.includes(item1));

    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'REVEAL_ITEM', itemId: item2 }));
    updated = await nextSnap;
    assert.ok(updated.state.revealedItemIds.includes(item1));
    assert.ok(updated.state.revealedItemIds.includes(item2));
    assert.strictEqual(updated.state.revealedItemIds.length, 2);

    // 3. Controller triggers Quick Buzzer
    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'TRIGGER_QUICK_BUZZER' }));
    updated = await nextSnap;
    assert.ok(typeof updated.state.quickBuzzerTriggerTime === 'number');

    // 4. Controller enables strike slots with 4 slots
    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'UPDATE_STRIKE_CONFIG', enabled: true, maxSlots: 4 }));
    updated = await nextSnap;
    assert.strictEqual(updated.state.strikeSlotsEnabled, true);
    assert.strictEqual(updated.state.maxStrikeSlots, 4);

    // 5. Controller sets strikes to 3
    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 3 }));
    updated = await nextSnap;
    assert.strictEqual(updated.state.currentStrikes, 3);

    // 6. Controller resets round
    nextSnap = waitForSnapshot(displayWs);
    controllerWs.send(JSON.stringify({ type: 'RESET_ROUND' }));
    updated = await nextSnap;
    assert.strictEqual(updated.state.revealedItemIds.length, 0);
    assert.strictEqual(updated.state.currentStrikes, 0);

    displayWs.close();
    controllerWs.close();
    await instance.close();
    console.log('✅ End-to-end WebSocket synchronization test passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E sync test failed:', err);
    await instance.close();
    process.exit(1);
  }
}

testE2E();
