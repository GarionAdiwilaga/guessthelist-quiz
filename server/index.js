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
const defaultDbPath = path.resolve(rootDir, 'anime-family-database-ranked-top10.default.json');
const millionaireDbPath = path.resolve(rootDir, 'anime-quiz-database-v3.json');
const millionaireDefaultDbPath = path.resolve(rootDir, 'anime-quiz-database-v3.default.json');

function getConfigPath() {
  return process.env.QUIZ_CONFIG_PATH
    ? path.resolve(process.env.QUIZ_CONFIG_PATH)
    : path.resolve(rootDir, 'quiz-config.json');
}

const starterTemplate = {
  quizType: 'top10_list',
  title: 'Guess The List Quiz',
  language: 'id',
  instructions: 'Tebak semua item yang masuk ke dalam daftar ini.',
  categories: [
    {
      id: 1,
      category: 'Daftar Contoh (Silakan Ubah di Bank Data)',
      emoji: '🎯',
      clue: 'Ini adalah daftar contoh bawaan. Buka Bank Data di Host Controller untuk mengimpor sample data dari repo atau menambah soal Anda sendiri.',
      answerType: 'Umum',
      items: [
        { id: 101, rank: 1, answer: 'Jawaban #1', anime: 'Keterangan 1', aliases: [], reason: 'Petunjuk 1' },
        { id: 102, rank: 2, answer: 'Jawaban #2', anime: 'Keterangan 2', aliases: [], reason: 'Petunjuk 2' },
        { id: 103, rank: 3, answer: 'Jawaban #3', anime: 'Keterangan 3', aliases: [], reason: 'Petunjuk 3' },
        { id: 104, rank: 4, answer: 'Jawaban #4', anime: 'Keterangan 4', aliases: [], reason: 'Petunjuk 4' },
        { id: 105, rank: 5, answer: 'Jawaban #5', anime: 'Keterangan 5', aliases: [], reason: 'Petunjuk 5' },
        { id: 106, rank: 6, answer: 'Jawaban #6', anime: 'Keterangan 6', aliases: [], reason: 'Petunjuk 6' },
        { id: 107, rank: 7, answer: 'Jawaban #7', anime: 'Keterangan 7', aliases: [], reason: 'Petunjuk 7' },
        { id: 108, rank: 8, answer: 'Jawaban #8', anime: 'Keterangan 8', aliases: [], reason: 'Petunjuk 8' },
        { id: 109, rank: 9, answer: 'Jawaban #9', anime: 'Keterangan 9', aliases: [], reason: 'Petunjuk 9' },
        { id: 110, rank: 10, answer: 'Jawaban #10', anime: 'Keterangan 10', aliases: [], reason: 'Petunjuk 10' }
      ]
    }
  ]
};

let database;
try {
  if (fs.existsSync(dbPath)) {
    database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } else if (fs.existsSync(defaultDbPath)) {
    database = JSON.parse(fs.readFileSync(defaultDbPath, 'utf8'));
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
  } else {
    database = starterTemplate;
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
  }
} catch (err) {
  console.error('[Quiz Server] Error reading database, using fallback starter template:', err.message);
  database = starterTemplate;
}
let categories = database.categories;

let millionaireQuestions = [];
function loadMillionaireDatabase() {
  try {
    if (fs.existsSync(millionaireDbPath)) {
      millionaireQuestions = JSON.parse(fs.readFileSync(millionaireDbPath, 'utf8'));
    } else if (fs.existsSync(millionaireDefaultDbPath)) {
      millionaireQuestions = JSON.parse(fs.readFileSync(millionaireDefaultDbPath, 'utf8'));
      fs.writeFileSync(millionaireDbPath, JSON.stringify(millionaireQuestions, null, 2), 'utf8');
    } else {
      millionaireQuestions = [];
    }
  } catch (err) {
    console.error('[Quiz Server] Error reading millionaire database:', err.message);
    millionaireQuestions = [];
  }
}
loadMillionaireDatabase();

function getDefaultConfig() {
  return {
    gameMode: 'quiz',
    currentMillionaireQuestionId: millionaireQuestions[0]?.id ?? 1,
    familyCategoryId: categories[0]?.id ?? 1,
    soundEnabled: true,
    soundVolume: 0.8,
    bgmEnabled: true,
    bgmVolume: 0.8,
    bgmOffsetMs: 0,
    strikeSlotsEnabled: false,
    maxStrikeSlots: 3,
    themeMode: 'stage',
    titleLogoUrl: null,
    customAudio: {
      useCustomSound: false,
      correctAudioDataUrl: null,
      wrongAudioDataUrl: null
    }
  };
}

function loadConfig() {
  const filePath = getConfigPath();
  const defaults = getDefaultConfig();
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        ...defaults,
        ...data,
        customAudio: {
          ...defaults.customAudio,
          ...(data.customAudio || {})
        }
      };
    }
  } catch (err) {
    console.error('[Quiz Server] Error reading quiz-config.json, using defaults:', err.message);
  }
  return defaults;
}

function saveConfig() {
  const filePath = getConfigPath();
  try {
    const configData = {
      gameMode: currentState.gameMode,
      currentMillionaireQuestionId: currentState.millionaireState.currentQuestionId,
      familyCategoryId: currentState.categoryId,
      soundEnabled: currentState.soundEnabled,
      soundVolume: currentState.soundVolume,
      bgmEnabled: currentState.bgmEnabled,
      bgmVolume: currentState.bgmVolume,
      bgmOffsetMs: currentState.bgmOffsetMs ?? 0,
      strikeSlotsEnabled: currentState.strikeSlotsEnabled,
      maxStrikeSlots: currentState.maxStrikeSlots,
      themeMode: currentState.themeMode,
      titleLogoUrl: currentState.titleLogoUrl,
      customAudio: currentState.customAudio
    };
    fs.writeFileSync(filePath, JSON.stringify(configData, null, 2), 'utf8');
  } catch (err) {
    console.error('[Quiz Server] Error writing quiz-config.json:', err.message);
  }
}

function createInitialState(savedConfig = loadConfig()) {
  const activeQuestionId = millionaireQuestions.some((q) => q.id === savedConfig.currentMillionaireQuestionId)
    ? savedConfig.currentMillionaireQuestionId
    : (millionaireQuestions[0]?.id ?? 1);

  const activeCategoryId = categories.some((c) => c.id === savedConfig.familyCategoryId)
    ? savedConfig.familyCategoryId
    : (categories[0]?.id ?? 1);

  return {
    gameMode: savedConfig.gameMode || 'quiz',
    millionaireState: {
      currentQuestionId: activeQuestionId,
      selectedOptionIndex: null,
      isLocked: false,
      isRevealed: false,
      showHint: false
    },
    categoryId: activeCategoryId,
    showTitleScreen: true,
    titleLogoUrl: savedConfig.titleLogoUrl ?? null,
    transitionWipeTimestamp: null,
    revealedItemIds: [],
    showClue: true,
    strikeSlotsEnabled: Boolean(savedConfig.strikeSlotsEnabled),
    maxStrikeSlots: savedConfig.maxStrikeSlots ?? 3,
    currentStrikes: 0,
    quickBuzzerTriggerTime: null,
    soundEnabled: savedConfig.soundEnabled !== undefined ? savedConfig.soundEnabled : true,
    soundVolume: typeof savedConfig.soundVolume === 'number' ? savedConfig.soundVolume : 0.8,
    bgmEnabled: savedConfig.bgmEnabled !== undefined ? savedConfig.bgmEnabled : true,
    bgmVolume: typeof savedConfig.bgmVolume === 'number' ? savedConfig.bgmVolume : 0.8,
    bgmPlaying: true,
    customAudio: {
      useCustomSound: Boolean(savedConfig.customAudio?.useCustomSound),
      correctAudioDataUrl: savedConfig.customAudio?.correctAudioDataUrl ?? null,
      wrongAudioDataUrl: savedConfig.customAudio?.wrongAudioDataUrl ?? null
    },
    themeMode: savedConfig.themeMode || 'stage',
    clueRollTimestamp: null,
    clueRollTargetItemId: null,
    isCluePopupOpen: false,
    bgmOffsetMs: typeof savedConfig.bgmOffsetMs === 'number' ? savedConfig.bgmOffsetMs : 0
  };
}

let currentState = createInitialState();

export function startServer(preferredPort = 3001) {
  loadMillionaireDatabase();
  currentState = createInitialState(loadConfig());

  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // REST API
  app.get('/api/state', (req, res) => {
    res.json({ state: currentState, categories, millionaireQuestions });
  });

  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  app.get('/api/millionaire-questions', (req, res) => {
    res.json(millionaireQuestions);
  });

  app.get('/api/config', (req, res) => {
    res.json(loadConfig());
  });

  app.get('/api/database', (req, res) => {
    res.json(database);
  });

  app.post('/api/database', (req, res) => {
    try {
      const newDb = req.body;
      if (!newDb || !Array.isArray(newDb.categories) || newDb.categories.length === 0) {
        return res.status(400).json({ error: 'Format databank tidak valid (wajib memiliki array categories)' });
      }
      // Backup old database
      try {
        fs.writeFileSync(path.resolve(rootDir, 'anime-family-database-ranked-top10.backup.json'), JSON.stringify(database, null, 2), 'utf8');
      } catch (err) {
        console.warn('Backup write failed:', err);
      }
      database = newDb;
      categories = newDb.categories;
      fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');

      if (!categories.some((c) => c.id === currentState.categoryId)) {
        currentState.categoryId = categories[0].id;
        currentState.revealedItemIds = [];
      }
      currentState.isCluePopupOpen = false;
      currentState.clueRollTargetItemId = null;
      currentState.clueRollTimestamp = null;
      broadcastState();
      res.json({ success: true, message: 'Databank berhasil diperbarui', categories });
    } catch (err) {
      res.status(500).json({ error: 'Gagal menyimpan databank: ' + err.message });
    }
  });

  app.post('/api/categories', (req, res) => {
    try {
      const newCategories = req.body.categories || req.body;
      if (!Array.isArray(newCategories) || newCategories.length === 0) {
        return res.status(400).json({ error: 'Array categories tidak valid' });
      }
      database.categories = newCategories;
      categories = newCategories;
      fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
      if (!categories.some((c) => c.id === currentState.categoryId)) {
        currentState.categoryId = categories[0].id;
        currentState.revealedItemIds = [];
      }
      broadcastState();
      res.json({ success: true, message: 'Kategori berhasil disimpan', categories });
    } catch (err) {
      res.status(500).json({ error: 'Gagal menyimpan kategori: ' + err.message });
    }
  });

  app.post('/api/database/reset', (req, res) => {
    try {
      let defaultDb;
      if (fs.existsSync(defaultDbPath)) {
        defaultDb = JSON.parse(fs.readFileSync(defaultDbPath, 'utf8'));
      } else {
        defaultDb = starterTemplate;
      }
      database = defaultDb;
      categories = defaultDb.categories;
      fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
      if (!categories.some((c) => c.id === currentState.categoryId)) {
        currentState.categoryId = categories[0].id;
        currentState.revealedItemIds = [];
      }
      currentState.isCluePopupOpen = false;
      currentState.clueRollTargetItemId = null;
      currentState.clueRollTimestamp = null;
      broadcastState();
      res.json({ success: true, message: 'Databank berhasil di-reset ke default', database });
    } catch (err) {
      res.status(500).json({ error: 'Gagal reset databank: ' + err.message });
    }
  });

  // Serve audio files from public/audio and root
  const publicPath = path.resolve(rootDir, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }
  app.use('/audio', express.static(path.resolve(rootDir, 'public/audio')));

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

  function broadcast(data) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    }
  }

  function broadcastState() {
    broadcast({
      type: 'STATE_SNAPSHOT',
      state: currentState,
      categories,
      millionaireQuestions
    });
  }

  wss.on('connection', (ws) => {
    // Send state immediately on connection
    ws.send(JSON.stringify({
      type: 'STATE_SNAPSHOT',
      state: currentState,
      categories,
      millionaireQuestions
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'CLIENT_HELLO': {
            ws.send(JSON.stringify({
              type: 'STATE_SNAPSHOT',
              state: currentState,
              categories,
              millionaireQuestions
            }));
            break;
          }
          case 'SET_SHOW_TITLE_SCREEN': {
            currentState.showTitleScreen = Boolean(msg.show);
            currentState.quickBuzzerTriggerTime = null;
            currentState.transitionWipeTimestamp = Date.now();
            broadcastState();
            break;
          }
          case 'UPDATE_TITLE_LOGO': {
            currentState.titleLogoUrl = msg.logoUrl || null;
            saveConfig();
            broadcastState();
            break;
          }
          case 'TRIGGER_WIPE': {
            currentState.transitionWipeTimestamp = Date.now();
            currentState.quickBuzzerTriggerTime = null;
            broadcastState();
            break;
          }
          case 'PLAY_SOUND': {
            broadcast({
              type: 'PLAY_SOUND',
              sound: msg.sound
            });
            break;
          }
          case 'SET_GAME_MODE': {
            if (msg.mode === 'quiz' || msg.mode === 'family') {
              currentState.gameMode = msg.mode;
              currentState.transitionWipeTimestamp = Date.now();
              saveConfig();
              broadcastState();
            }
            break;
          }
          case 'SELECT_MILLIONAIRE_QUESTION': {
            const targetQ = millionaireQuestions.find((q) => q.id === msg.questionId);
            if (targetQ) {
              currentState.millionaireState.currentQuestionId = targetQ.id;
            } else if (typeof msg.questionId === 'number') {
              currentState.millionaireState.currentQuestionId = msg.questionId;
            }
            currentState.millionaireState.selectedOptionIndex = null;
            currentState.millionaireState.isLocked = false;
            currentState.millionaireState.isRevealed = false;
            currentState.millionaireState.showHint = false;
            currentState.transitionWipeTimestamp = Date.now();
            saveConfig();
            broadcastState();
            break;
          }
          case 'HIGHLIGHT_MILLIONAIRE_OPTION': {
            currentState.millionaireState.selectedOptionIndex =
              typeof msg.optionIndex === 'number' ? msg.optionIndex : null;
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: 'click' });
            break;
          }
          case 'LOCK_MILLIONAIRE_ANSWER': {
            currentState.millionaireState.isLocked = true;
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: 'lock' });
            break;
          }
          case 'REVEAL_MILLIONAIRE_ANSWER': {
            const currentQ = millionaireQuestions.find(
              (q) => q.id === currentState.millionaireState.currentQuestionId
            );
            const selectedIdx = currentState.millionaireState.selectedOptionIndex;
            const isMatch = Boolean(
              currentQ &&
              selectedIdx !== null &&
              selectedIdx >= 0 &&
              selectedIdx < currentQ.options.length &&
              currentQ.answer === currentQ.options[selectedIdx]
            );
            currentState.millionaireState.isRevealed = true;
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: isMatch ? 'correct' : 'buzzer' });
            break;
          }
          case 'TOGGLE_MILLIONAIRE_HINT': {
            currentState.millionaireState.showHint =
              msg.show !== undefined ? Boolean(msg.show) : !currentState.millionaireState.showHint;
            broadcastState();
            break;
          }
          case 'RESET_MILLIONAIRE_QUESTION': {
            currentState.millionaireState.selectedOptionIndex = null;
            currentState.millionaireState.isLocked = false;
            currentState.millionaireState.isRevealed = false;
            currentState.millionaireState.showHint = false;
            broadcastState();
            break;
          }
          case 'SELECT_CATEGORY': {
            const targetCat = categories.find((c) => c.id === msg.categoryId);
            if (targetCat) {
              currentState.categoryId = targetCat.id;
              currentState.revealedItemIds = [];
              currentState.currentStrikes = 0;
              currentState.quickBuzzerTriggerTime = null;
              currentState.showTitleScreen = false;
              currentState.transitionWipeTimestamp = Date.now();
              currentState.isCluePopupOpen = false;
              currentState.clueRollTargetItemId = null;
              currentState.clueRollTimestamp = null;
              saveConfig();
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
            broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
            break;
          }
          case 'REVEAL_ALL': {
            const currentCat = categories.find((c) => c.id === currentState.categoryId);
            if (currentCat) {
              currentState.revealedItemIds = currentCat.items.map((i) => i.id);
              broadcastState();
              broadcast({ type: 'PLAY_SOUND', sound: 'reveal_all' });
            }
            break;
          }
          case 'HIDE_ALL': {
            currentState.revealedItemIds = [];
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
            break;
          }
          case 'TOGGLE_CLUE': {
            currentState.showClue = msg.showClue !== undefined ? msg.showClue : !currentState.showClue;
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
            break;
          }
          case 'SET_STRIKES': {
            const max = currentState.maxStrikeSlots || 3;
            const newStrikes = Math.max(0, Math.min(msg.strikes, max));
            if (newStrikes > currentState.currentStrikes) {
              // Manually adding strike concurrently triggers buzzer popup & sound
              currentState.quickBuzzerTriggerTime = Date.now();
            } else if (newStrikes < currentState.currentStrikes) {
              // Reducing or resetting strikes plays swoosh SFX
              broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
            }
            currentState.currentStrikes = newStrikes;
            broadcastState();
            break;
          }
          case 'TRIGGER_QUICK_BUZZER': {
            currentState.quickBuzzerTriggerTime = Date.now();
            // When strike slots are enabled: increment strike counter concurrently
            if (currentState.strikeSlotsEnabled) {
              const max = currentState.maxStrikeSlots || 3;
              if (currentState.currentStrikes < max) {
                currentState.currentStrikes += 1;
              }
            }
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
            saveConfig();
            broadcastState();
            break;
          }
          case 'TOGGLE_BGM': {
            currentState.bgmPlaying = !currentState.bgmPlaying;
            broadcastState();
            break;
          }
          case 'SET_BGM_PLAYING': {
            currentState.bgmPlaying = Boolean(msg.playing);
            broadcastState();
            break;
          }
          case 'SET_BGM_VOLUME': {
            currentState.bgmVolume = Math.max(0, Math.min(Number(msg.volume) || 0, 1));
            saveConfig();
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
              if (typeof msg.settings.bgmEnabled === 'boolean') {
                currentState.bgmEnabled = msg.settings.bgmEnabled;
              }
              if (typeof msg.settings.bgmVolume === 'number') {
                currentState.bgmVolume = Math.max(0, Math.min(msg.settings.bgmVolume, 1));
              }
              if (typeof msg.settings.bgmPlaying === 'boolean') {
                currentState.bgmPlaying = msg.settings.bgmPlaying;
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
              if (typeof msg.settings.bgmOffsetMs === 'number') {
                currentState.bgmOffsetMs = Math.max(-500, Math.min(msg.settings.bgmOffsetMs, 500));
              }
              saveConfig();
            }
            broadcastState();
            break;
          }
          case 'SET_THEME_MODE': {
            if (msg.mode === 'stage' || msg.mode === 'transparent') {
              currentState.themeMode = msg.mode;
              saveConfig();
              broadcastState();
              broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
            }
            break;
          }
          case 'ROLL_CLUE': {
            const currentCat = categories.find((c) => c.id === currentState.categoryId);
            if (currentCat) {
              const unrevealed = currentCat.items.filter((item) => !currentState.revealedItemIds.includes(item.id));
              if (unrevealed.length > 0) {
                const target = unrevealed[Math.floor(Math.random() * unrevealed.length)];
                currentState.clueRollTargetItemId = target.id;
                currentState.clueRollTimestamp = Date.now();
                currentState.isCluePopupOpen = true;
                broadcastState();
                broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
              }
            }
            break;
          }
          case 'DISMISS_CLUE': {
            currentState.isCluePopupOpen = false;
            currentState.clueRollTargetItemId = null;
            currentState.clueRollTimestamp = null;
            broadcastState();
            break;
          }
          case 'UPDATE_DATABANK': {
            if (msg.database && Array.isArray(msg.database.categories) && msg.database.categories.length > 0) {
              database = msg.database;
              categories = msg.database.categories;
              try {
                fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
              } catch (e) {
                console.error('Error writing databank:', e);
              }
              if (!categories.some((c) => c.id === currentState.categoryId)) {
                currentState.categoryId = categories[0].id;
                currentState.revealedItemIds = [];
              }
              currentState.isCluePopupOpen = false;
              currentState.clueRollTargetItemId = null;
              currentState.clueRollTimestamp = null;
              broadcastState();
            }
            break;
          }
          case 'SAVE_CATEGORIES': {
            if (Array.isArray(msg.categories) && msg.categories.length > 0) {
              database.categories = msg.categories;
              categories = msg.categories;
              try {
                fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
              } catch (e) {
                console.error('Error writing categories:', e);
              }
              if (!categories.some((c) => c.id === currentState.categoryId)) {
                currentState.categoryId = categories[0].id;
                currentState.revealedItemIds = [];
              }
              broadcastState();
            }
            break;
          }
          case 'RESET_ROUND': {
            currentState.revealedItemIds = [];
            currentState.currentStrikes = 0;
            currentState.quickBuzzerTriggerTime = null;
            currentState.isCluePopupOpen = false;
            currentState.clueRollTargetItemId = null;
            currentState.clueRollTimestamp = null;
            broadcastState();
            broadcast({ type: 'PLAY_SOUND', sound: 'swoosh' });
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
              for (const client of wss.clients) {
                client.terminate();
              }
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
