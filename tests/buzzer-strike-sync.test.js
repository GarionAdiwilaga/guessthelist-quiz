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
  const serverInstance = await startServer(3299);
  const wsUrl = 'ws://localhost:3299/ws';

  try {
    const ws = new WebSocket(wsUrl);
    const initial = await waitForMessage(ws);

    assert.strictEqual(initial.type, 'STATE_SNAPSHOT');
    assert.strictEqual(initial.state.strikeSlotsEnabled, false);
    assert.strictEqual(initial.state.currentStrikes, 0);

    // Test 1: When strike slots disabled, TRIGGER_QUICK_BUZZER sets buzzer time but does NOT add strike
    const p1 = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'TRIGGER_QUICK_BUZZER' }));
    const r1 = await p1;
    assert.ok(r1.state.quickBuzzerTriggerTime !== null);
    assert.strictEqual(r1.state.currentStrikes, 0, 'Strikes must remain 0 when slots disabled');

    // Test 2: Enable strike slots (max 3)
    const p2 = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'UPDATE_STRIKE_CONFIG', enabled: true, maxSlots: 3 }));
    const r2 = await p2;
    assert.strictEqual(r2.state.strikeSlotsEnabled, true);
    assert.strictEqual(r2.state.maxStrikeSlots, 3);

    // Test 3: When strike slots enabled, TRIGGER_QUICK_BUZZER increments strike AND triggers buzzer
    const prevBuzzerTime = r2.state.quickBuzzerTriggerTime;
    const p3 = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'TRIGGER_QUICK_BUZZER' }));
    const r3 = await p3;
    assert.strictEqual(r3.state.currentStrikes, 1, 'Buzzer must increment strike counter to 1');
    assert.ok(r3.state.quickBuzzerTriggerTime >= prevBuzzerTime, 'Buzzer time must update concurrently');

    // Test 4: Manually adding strike via SET_STRIKES concurrently triggers buzzer
    const p4 = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 2 }));
    const r4 = await p4;
    assert.strictEqual(r4.state.currentStrikes, 2, 'Strikes must update to 2');
    assert.ok(r4.state.quickBuzzerTriggerTime >= r3.state.quickBuzzerTriggerTime, 'Manual strike must trigger buzzer popup');

    // Test 5: Reducing strike does NOT trigger buzzer
    const p5 = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 1 }));
    const r5 = await p5;
    assert.strictEqual(r5.state.currentStrikes, 1);
    assert.strictEqual(r5.state.quickBuzzerTriggerTime, r4.state.quickBuzzerTriggerTime, 'Reducing strike should not update buzzer time');

    // Test 6: PLAY_SOUND broadcasts sound message
    const soundPromise = waitForMessage(ws);
    ws.send(JSON.stringify({ type: 'PLAY_SOUND', sound: 'applause' }));
    const soundMsg = await soundPromise;
    assert.strictEqual(soundMsg.type, 'PLAY_SOUND');
    assert.strictEqual(soundMsg.sound, 'applause');

    ws.close();
    await serverInstance.close();
    console.log('✅ Buzzer & Strike State Synchronization and Soundboard test passed!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    await serverInstance.close();
    process.exit(1);
  }
}

run();
