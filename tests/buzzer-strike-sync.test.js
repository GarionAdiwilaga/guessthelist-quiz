import { startServer } from '../server/index.js';
import WebSocket from 'ws';
import assert from 'node:assert';

function waitForSingleMessage(ws) {
  return new Promise((resolve) => {
    ws.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });
}

function waitForMessages(ws, count = 2) {
  return new Promise((resolve) => {
    const received = [];
    function onMsg(data) {
      received.push(JSON.parse(data.toString()));
      if (received.length >= count) {
        ws.off('message', onMsg);
        resolve(received);
      }
    }
    ws.on('message', onMsg);
  });
}

async function run() {
  const serverInstance = await startServer(3299);
  const wsUrl = 'ws://localhost:3299/ws';

  try {
    const ws = new WebSocket(wsUrl);
    const initial = await waitForSingleMessage(ws);

    assert.strictEqual(initial.type, 'STATE_SNAPSHOT');
    assert.strictEqual(initial.state.strikeSlotsEnabled, false);
    assert.strictEqual(initial.state.currentStrikes, 0);

    // Test 1: When strike slots disabled, TRIGGER_QUICK_BUZZER sets buzzer time but does NOT add strike
    const p1 = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'TRIGGER_QUICK_BUZZER' }));
    const r1 = await p1;
    assert.ok(r1.state.quickBuzzerTriggerTime !== null);
    assert.strictEqual(r1.state.currentStrikes, 0, 'Strikes must remain 0 when slots disabled');

    // Test 2: Enable strike slots (max 3)
    const p2 = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'UPDATE_STRIKE_CONFIG', enabled: true, maxSlots: 3 }));
    const r2 = await p2;
    assert.strictEqual(r2.state.strikeSlotsEnabled, true);
    assert.strictEqual(r2.state.maxStrikeSlots, 3);

    // Test 3: When strike slots enabled, TRIGGER_QUICK_BUZZER increments strike AND triggers buzzer
    const prevBuzzerTime = r2.state.quickBuzzerTriggerTime;
    const p3 = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'TRIGGER_QUICK_BUZZER' }));
    const r3 = await p3;
    assert.strictEqual(r3.state.currentStrikes, 1, 'Buzzer must increment strike counter to 1');
    assert.ok(r3.state.quickBuzzerTriggerTime >= prevBuzzerTime, 'Buzzer time must update concurrently');

    // Test 4: Manually adding strike via SET_STRIKES concurrently triggers buzzer
    const p4 = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 2 }));
    const r4 = await p4;
    assert.strictEqual(r4.state.currentStrikes, 2, 'Strikes must update to 2');
    assert.ok(r4.state.quickBuzzerTriggerTime >= r3.state.quickBuzzerTriggerTime, 'Manual strike must trigger buzzer popup');

    // Test 5: Reducing strike does NOT trigger buzzer, but broadcasts swoosh SFX
    const p5Promise = waitForMessages(ws, 2);
    ws.send(JSON.stringify({ type: 'SET_STRIKES', strikes: 1 }));
    const msgs5 = await p5Promise;
    const r5State = msgs5.find((m) => m.type === 'STATE_SNAPSHOT');
    const r5Sound = msgs5.find((m) => m.type === 'PLAY_SOUND');
    assert.ok(r5State, 'Expected STATE_SNAPSHOT');
    assert.ok(r5Sound, 'Expected PLAY_SOUND');
    assert.strictEqual(r5State.state.currentStrikes, 1);
    assert.strictEqual(r5State.state.quickBuzzerTriggerTime, r4.state.quickBuzzerTriggerTime, 'Reducing strike should not update buzzer time');
    assert.strictEqual(r5Sound.sound, 'swoosh', 'Reducing strikes should broadcast swoosh');

    // Test 6: REVEAL_ALL broadcasts state and reveal_all sound
    const p6Promise = waitForMessages(ws, 2);
    ws.send(JSON.stringify({ type: 'REVEAL_ALL' }));
    const msgs6 = await p6Promise;
    const r6State = msgs6.find((m) => m.type === 'STATE_SNAPSHOT');
    const r6Sound = msgs6.find((m) => m.type === 'PLAY_SOUND');
    assert.ok(r6State, 'Expected STATE_SNAPSHOT');
    assert.ok(r6Sound, 'Expected PLAY_SOUND');
    assert.strictEqual(r6State.state.revealedItemIds.length, 10);
    assert.strictEqual(r6Sound.sound, 'reveal_all', 'REVEAL_ALL must broadcast reveal_all sound');

    // Test 7: HIDE_ALL broadcasts state and swoosh sound
    const p7Promise = waitForMessages(ws, 2);
    ws.send(JSON.stringify({ type: 'HIDE_ALL' }));
    const msgs7 = await p7Promise;
    const r7State = msgs7.find((m) => m.type === 'STATE_SNAPSHOT');
    const r7Sound = msgs7.find((m) => m.type === 'PLAY_SOUND');
    assert.ok(r7State, 'Expected STATE_SNAPSHOT');
    assert.ok(r7Sound, 'Expected PLAY_SOUND');
    assert.strictEqual(r7State.state.revealedItemIds.length, 0);
    assert.strictEqual(r7Sound.sound, 'swoosh', 'HIDE_ALL must broadcast swoosh sound');

    // Test 8: TOGGLE_CLUE broadcasts state and swoosh sound
    const p8Promise = waitForMessages(ws, 2);
    ws.send(JSON.stringify({ type: 'TOGGLE_CLUE' }));
    const msgs8 = await p8Promise;
    const r8Sound = msgs8.find((m) => m.type === 'PLAY_SOUND');
    assert.ok(r8Sound, 'Expected PLAY_SOUND');
    assert.strictEqual(r8Sound.sound, 'swoosh', 'TOGGLE_CLUE must broadcast swoosh sound');

    // Test 9: PLAY_SOUND broadcasts sound message
    const soundPromise = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'PLAY_SOUND', sound: 'applause' }));
    const soundMsg = await soundPromise;
    assert.strictEqual(soundMsg.type, 'PLAY_SOUND');
    assert.strictEqual(soundMsg.sound, 'applause');

    // Test 10: PLAY_SOUND broadcasts stop_applause and stop_music
    const stopApplausePromise = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'PLAY_SOUND', sound: 'stop_applause' }));
    const stopApplauseMsg = await stopApplausePromise;
    assert.strictEqual(stopApplauseMsg.type, 'PLAY_SOUND');
    assert.strictEqual(stopApplauseMsg.sound, 'stop_applause');

    const stopMusicPromise = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'PLAY_SOUND', sound: 'stop_music' }));
    const stopMusicMsg = await stopMusicPromise;
    assert.strictEqual(stopMusicMsg.type, 'PLAY_SOUND');
    assert.strictEqual(stopMusicMsg.sound, 'stop_music');

    // Test 11: TOGGLE_BGM toggles bgmPlaying state
    const toggleBgmPromise = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'TOGGLE_BGM' }));
    const toggleBgmMsg = await toggleBgmPromise;
    assert.strictEqual(toggleBgmMsg.type, 'STATE_SNAPSHOT');
    assert.strictEqual(toggleBgmMsg.state.bgmPlaying, false, 'BGM should be paused after toggle');

    // Test 12: SET_BGM_VOLUME updates bgmVolume state
    const setBgmVolPromise = waitForSingleMessage(ws);
    ws.send(JSON.stringify({ type: 'SET_BGM_VOLUME', volume: 0.65 }));
    const setBgmVolMsg = await setBgmVolPromise;
    assert.strictEqual(setBgmVolMsg.type, 'STATE_SNAPSHOT');
    assert.strictEqual(setBgmVolMsg.state.bgmVolume, 0.65, 'BGM volume should update to 0.65');

    ws.close();
    await serverInstance.close();
    console.log('✅ Buzzer & Strike State Synchronization, Soundboard, and BGM test passed!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    await serverInstance.close();
    process.exit(1);
  }
}

run();
