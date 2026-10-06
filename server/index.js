import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load database
const dbPath = path.resolve(rootDir, 'anime-family-database-ranked-top10.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const categories = database.categories;

// Default initial state
function createInitialState() {
  return {
    categoryId: categories[0]?.id ?? 1,
    revealedItemIds: [],
    showClue: false,
    strikeSlotsEnabled: false,
    maxStrikeSlots: 3,
    currentStrikes: 0,
    quickBuzzerTriggerTime: null,
    soundEnabled: true,
    soundVolume: 0.8,
    customAudio: {
      useCustomSound: false,
      correctAudioDataUrl: null,
      wrongAudioDataUrl: null
    },
    themeMode: 'stage'
  };
}

let currentState = createInitialState();

export function startServer(preferredPort = 3001) {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // REST API
  app.get('/api/state', (req, res) => {
    res.json({ state: currentState, categories });
  });

  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  // Serve static dist in production
  const distPath = path.resolve(rootDir, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastState() {
    const snapshot = JSON.stringify({
      type: 'STATE_SNAPSHOT',
      state: currentState,
      categories
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(snapshot);
      }
    }
  }

  wss.on('connection', (ws) => {
    // Send state immediately on connection
    ws.send(JSON.stringify({
      type: 'STATE_SNAPSHOT',
      state: currentState,
      categories
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'CLIENT_HELLO': {
            ws.send(JSON.stringify({
              type: 'STATE_SNAPSHOT',
              state: currentState,
              categories
            }));
            break;
          }
          case 'SELECT_CATEGORY': {
            const targetCat = categories.find((c) => c.id === msg.categoryId);
            if (targetCat) {
              currentState.categoryId = targetCat.id;
              currentState.revealedItemIds = [];
              currentState.currentStrikes = 0;
              currentState.showClue = false;
              currentState.quickBuzzerTriggerTime = null;
              broadcastState();
            }
            break;
          }
          case 'REVEAL_ITEM': {
            if (!currentState.revealedItemIds.includes(msg.itemId)) {
              currentState.revealedItemIds = [...currentState.revealedItemIds, msg.itemId];
              broadcastState();
            }
            break;
          }
          case 'HIDE_ITEM': {
            currentState.revealedItemIds = currentState.revealedItemIds.filter((id) => id !== msg.itemId);
            broadcastState();
            break;
          }
          case 'REVEAL_ALL': {
            const currentCat = categories.find((c) => c.id === currentState.categoryId);
            if (currentCat) {
              currentState.revealedItemIds = currentCat.items.map((i) => i.id);
              broadcastState();
            }
            break;
          }
          case 'HIDE_ALL': {
            currentState.revealedItemIds = [];
            broadcastState();
            break;
          }
          case 'TOGGLE_CLUE': {
            currentState.showClue = msg.showClue !== undefined ? msg.showClue : !currentState.showClue;
            broadcastState();
            break;
          }
          case 'SET_STRIKES': {
            const max = currentState.maxStrikeSlots || 3;
            currentState.currentStrikes = Math.max(0, Math.min(msg.strikes, max));
            broadcastState();
            break;
          }
          case 'TRIGGER_QUICK_BUZZER': {
            currentState.quickBuzzerTriggerTime = Date.now();
            broadcastState();
            break;
          }
          case 'UPDATE_STRIKE_CONFIG': {
            currentState.strikeSlotsEnabled = Boolean(msg.enabled);
            const slots = Math.max(2, Math.min(Number(msg.maxSlots) || 3, 5));
            currentState.maxStrikeSlots = slots;
            if (currentState.currentStrikes > slots) {
              currentState.currentStrikes = slots;
            }
            broadcastState();
            break;
          }
          case 'UPDATE_AUDIO_CONFIG': {
            if (msg.settings) {
              if (typeof msg.settings.soundEnabled === 'boolean') {
                currentState.soundEnabled = msg.settings.soundEnabled;
              }
              if (typeof msg.settings.soundVolume === 'number') {
                currentState.soundVolume = Math.max(0, Math.min(msg.settings.soundVolume, 1));
              }
              if (typeof msg.settings.useCustomSound === 'boolean') {
                currentState.customAudio.useCustomSound = msg.settings.useCustomSound;
              }
              if (msg.settings.correctAudioDataUrl !== undefined) {
                currentState.customAudio.correctAudioDataUrl = msg.settings.correctAudioDataUrl;
              }
              if (msg.settings.wrongAudioDataUrl !== undefined) {
                currentState.customAudio.wrongAudioDataUrl = msg.settings.wrongAudioDataUrl;
              }
            }
            broadcastState();
            break;
          }
          case 'SET_THEME_MODE': {
            if (msg.mode === 'stage' || msg.mode === 'transparent') {
              currentState.themeMode = msg.mode;
              broadcastState();
            }
            break;
          }
          case 'RESET_ROUND': {
            currentState.revealedItemIds = [];
            currentState.currentStrikes = 0;
            currentState.quickBuzzerTriggerTime = null;
            broadcastState();
            break;
          }
        }
      } catch (err) {
        console.error('Error processing websocket message:', err);
      }
    });
  });

  return new Promise((resolve, reject) => {
    let port = preferredPort;

    function tryListen() {
      server.listen(port, () => {
        console.log(`[Quiz Server] running on http://localhost:${port} (WS on /ws)`);
        resolve({
          server,
          wss,
          port,
          close: () =>
            new Promise((res) => {
              wss.close(() => {
                server.close(res);
              });
            })
        });
      });
    }

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Quiz Server] Port ${port} is in use, trying port ${port + 1}...`);
        port += 1;
        tryListen();
      } else {
        reject(err);
      }
    });

    tryListen();
  });
}

// Auto-run if executed directly
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  startServer(process.env.PORT ? Number(process.env.PORT) : 3001);
}
