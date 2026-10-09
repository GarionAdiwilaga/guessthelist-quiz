# Design Specification: Quiz Wibu (Millionaire Style) & Persistent Configuration

Date: 2026-10-10
Status: Draft / Pending User Review

## 1. Overview & Goals

This specification defines the architecture, data models, user interface, audio coordination, and persistence for adding a new game mode named **"Quiz Wibu"** (inspired by *Who Wants to Be a Millionaire?*) alongside the existing **"Family Wibu 100"** (inspired by *Family Feud* / *Family 100*).

### Key Goals
1. **Multi-Round Game Flow:**
   - **Ronde 1: Quiz Wibu** (Multiple choice, 1 question at a time with 4 options A/B/C/D, contestant option highlight, final answer lock, right/wrong reveal, hint, and explanation).
   - **Ronde 2: Family Wibu 100** (Top 10 list guessing board with flip cards, strike slots, quick buzzer, and clue roll).
   - Seamless live transition between rounds using the holographic wipe effect without requiring URL or browser source changes in OBS Studio.
2. **Persistent Configuration & Data:**
   - Server automatically saves current settings (audio volume, theme mode, strike config, title logo URL, current game mode, and current question/category) to a persistent file (`quiz-config.json`). On restart or shutdown, the server seamlessly restores the exact state.
   - Quiz databases (`anime-quiz-database-v3.json` for Quiz Wibu, `anime-family-database-ranked-top10.json` for Family Wibu 100) are persisted on disk with default fallback files.
3. **Soundboard Integration:**
   - Selecting/highlighting an option plays `click-short.wav`.
   - Locking an answer ("Final Answer") plays `spacebar.mp3`.
   - Revealing a correct answer turns the option green and plays `correct.mp3`.
   - Revealing a wrong answer turns the chosen option red, the correct option green, and plays `buzzer.mp3`.
4. **Display Simplicity:**
   - Main Display shows only category, question text, 4 options (A, B, C, D), hint banner (when toggled), and explanation card (after reveal). No question index or progress number is displayed on the player board.
   - Host Controller displays full question cheat sheet (correct answer highlighted, explanation, question navigation, search, and random picker).

---

## 2. Data Models & File Persistence

### 2.1 File Storage Structure
1. `quiz-config.json`:
   - Persists live server configuration and active session position.
   - Created automatically if not present, using default configuration.
2. `anime-quiz-database-v3.json`:
   - Contains 120 multiple choice questions across 4 categories:
     - Anime Populer
     - Shounen Pillars & Classics
     - Anime Umum
     - Budaya Wibu & Istilah Otaku
   - Fallback copy: `anime-quiz-database-v3.default.json`.
3. `anime-family-database-ranked-top10.json`:
   - Contains top 10 categories for Family Wibu 100.
   - Fallback copy: `anime-family-database-ranked-top10.default.json`.
4. `public/audio/spacebar.mp3`:
   - Audio file copied from project root for answer lock SFX.

### 2.2 TypeScript Data Interfaces (`src/types/quiz.ts`)

```typescript
export type GameMode = 'quiz' | 'family';

export interface MillionaireQuestion {
  id: number;
  category: string;
  anime: string;
  question: string;
  options: string[]; // Exactly 4 options: [A, B, C, D]
  answer: string;    // String matching one of the options
  hint?: string;     // Optional hint (defaults to empty string if not provided)
  explanation: string;
}

export interface MillionaireState {
  currentQuestionId: number;
  selectedOptionIndex: number | null; // 0..3 (A, B, C, D) or null
  isLocked: boolean;                  // Answer locked ("Final Answer")
  isRevealed: boolean;                // Result revealed (true/false)
  showHint: boolean;                  // Hint banner open on Main Display
}

export interface QuizConfigPersistent {
  gameMode: GameMode;
  currentMillionaireQuestionId: number;
  familyCategoryId: number;
  soundEnabled: boolean;
  soundVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmOffsetMs: number;
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  themeMode: 'stage' | 'transparent';
  titleLogoUrl: string | null;
  customAudio: CustomAudioConfig;
}

export interface QuizState {
  gameMode: GameMode;
  millionaireState: MillionaireState;
  categoryId: number;
  showTitleScreen: boolean;
  titleLogoUrl: string | null;
  transitionWipeTimestamp: number | null;
  revealedItemIds: number[];
  showClue: boolean;
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  currentStrikes: number;
  quickBuzzerTriggerTime: number | null;
  soundEnabled: boolean;
  soundVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmPlaying: boolean;
  customAudio: CustomAudioConfig;
  themeMode: 'stage' | 'transparent';
  clueRollTimestamp: number | null;
  clueRollTargetItemId: number | null;
  isCluePopupOpen: boolean;
  bgmOffsetMs?: number;
}
```

---

## 3. WebSocket Protocol & Message Actions

### 3.1 Extended WebSocket Messages

```typescript
export type WSMessage =
  // Existing messages
  | { type: 'STATE_SNAPSHOT'; state: QuizState; categories: QuizCategory[]; millionaireQuestions: MillionaireQuestion[] }
  | { type: 'CLIENT_HELLO' }
  | { type: 'SELECT_CATEGORY'; categoryId: number }
  | { type: 'SET_SHOW_TITLE_SCREEN'; show: boolean }
  | { type: 'UPDATE_TITLE_LOGO'; logoUrl: string | null }
  | { type: 'TRIGGER_WIPE' }
  | { type: 'PLAY_SOUND'; sound: SoundEffectType }
  | { type: 'REVEAL_ITEM'; itemId: number }
  | { type: 'HIDE_ITEM'; itemId: number }
  | { type: 'REVEAL_ALL' }
  | { type: 'HIDE_ALL' }
  | { type: 'TOGGLE_CLUE'; showClue?: boolean }
  | { type: 'SET_STRIKES'; strikes: number }
  | { type: 'TRIGGER_QUICK_BUZZER' }
  | { type: 'UPDATE_STRIKE_CONFIG'; enabled: boolean; maxSlots: number }
  | { type: 'TOGGLE_BGM' }
  | { type: 'SET_BGM_PLAYING'; playing: boolean }
  | { type: 'SET_BGM_VOLUME'; volume: number }
  | { type: 'UPDATE_AUDIO_CONFIG'; settings: Partial<CustomAudioConfig & { soundEnabled: boolean; soundVolume: number; bgmEnabled?: boolean; bgmVolume?: number; bgmPlaying?: boolean; bgmOffsetMs?: number }> }
  | { type: 'ROLL_CLUE' }
  | { type: 'DISMISS_CLUE' }
  | { type: 'UPDATE_DATABANK'; database: QuizDatabase }
  | { type: 'SAVE_CATEGORIES'; categories: QuizCategory[] }
  | { type: 'SET_THEME_MODE'; mode: 'stage' | 'transparent' }
  | { type: 'RESET_ROUND' }

  // New Quiz Wibu (Millionaire) messages
  | { type: 'SET_GAME_MODE'; mode: GameMode }
  | { type: 'SELECT_MILLIONAIRE_QUESTION'; questionId: number }
  | { type: 'HIGHLIGHT_MILLIONAIRE_OPTION'; optionIndex: number | null }
  | { type: 'LOCK_MILLIONAIRE_ANSWER' }
  | { type: 'REVEAL_MILLIONAIRE_ANSWER' }
  | { type: 'TOGGLE_MILLIONAIRE_HINT'; show?: boolean }
  | { type: 'RESET_MILLIONAIRE_QUESTION' };
```

### 3.2 Extended Sound Types
`SoundEffectType` includes `'lock'` mapped to `spacebar.mp3`.
- `click`: plays `click-short.wav`
- `lock`: plays `spacebar.mp3`
- `correct`: plays `correct.mp3`
- `buzzer`: plays `buzzer.mp3`

---

## 4. Component Architecture & User Interface

### 4.1 Main Display Router (`src/components/MainDisplay/MainDisplay.tsx`)
1. **Title Screen Layer:**
   - If `displayedState.showTitleScreen` is true, renders `<TitleScreen />`.
2. **Game Board Layer:**
   - If `displayedState.gameMode === 'quiz'`, renders `<MillionaireBoard />`.
   - If `displayedState.gameMode === 'family'`, renders the existing 10-card Family Feud board.
3. **Transition Management:**
   - `TransitionWipe` coordinates view swapping at midpoint (`onWipeCovered`).
   - Switching game modes or changing questions sets `transitionWipeTimestamp = Date.now()`.

### 4.2 Millionaire Board (`src/components/MainDisplay/MillionaireBoard.tsx`)
- **Category Badge:** Top centered pill showing current category in uppercase font (`Outfit`).
- **Question Card:** Centered stadium/hexagonal container with neon cyan border, deep dark gradient background, and legible responsive typography.
- **Hint Banner:**
  - Animate in below question box when `state.millionaireState.showHint` is true.
  - Displays anime title and hint text.
- **Explanation Card:**
  - Animate in after `state.millionaireState.isRevealed` is true.
  - Displays detailed explanation why the answer is correct.
- **4 Options Grid (2 rows x 2 columns):**
  - Option items marked **A**, **B**, **C**, **D**.
  - **Idle State:** Dark slate background, subtle cyan border, golden letter badge.
  - **Highlighted State (Contestant selection):** Bright amber/orange background (`#FF9F0A` / `#FFD600`), pulsing glow.
  - **Locked State ("Final Answer"):** Golden border with intense pulsating glow.
  - **Revealed Correct State:** Emerald green background (`#00FF88`), golden border glow.
  - **Revealed Wrong State:** Chosen option glows red (`#FF2E55`), correct option glows green (`#00FF88`).
- **OBS Studio Transparency:** Transparent background in transparent theme mode.

### 4.3 Host Controller View (`src/components/Controller/ControllerView.tsx`)
- **Header Round Switcher:**
  - `[Ronde 1: Quiz Wibu]` button (highlights active mode in cyan/purple).
  - `[Ronde 2: Family Wibu 100]` button.
  - Status indicator: `📺 Layar Judul (Pause)`, `🎮 Quiz Wibu (Millionaire)`, or `🎮 Layar Game (Board)`.
- **Round 1 Panel (`MillionaireController.tsx`):**
  - **Category Filter & Search:**
    - Tabs: Semua, Anime Populer, Shounen Pillars & Classics, Anime Umum, Budaya Wibu.
    - Search input filtering by keyword, anime title, or option.
  - **Navigation Bar:**
    - `[◀ Prev]` `[🎲 Soal Acak]` `[Next ▶]`
    - Counter for host: `Soal #X / 120 (Anime Title)`.
  - **Question & Cheat Sheet:**
    - Full question text.
    - Anime title and hint preview.
    - Explanation text.
  - **Answer Control Grid:**
    - 4 large clickable buttons for Options A, B, C, D.
    - Correct option clearly indicated with a green badge `[BENAR]` for host reference.
    - Clicking an option toggles or updates `selectedOptionIndex`.
  - **Action Control Buttons:**
    - `[💡 Tampilkan / Tutup Petunjuk]`: toggles hint visibility on Main Display.
    - `[🔒 Kunci Jawaban]`: locks the selected option, emits `lock` sound.
    - `[🎯 Buka Hasil (Reveal)]`: reveals outcome, emits `correct` or `buzzer` sound, reveals explanation.
    - `[🔄 Reset Pilihan]`: resets selection and lock on current question.

---

## 5. Persistence Workflow (`server/index.js`)

1. **Server Initialization:**
   - Read `quiz-config.json` if exists; parse and apply stored settings to `currentState`.
   - Read `anime-quiz-database-v3.json`; fallback to `anime-quiz-database-v3.default.json` if missing.
   - Read `anime-family-database-ranked-top10.json`; fallback to `anime-family-database-ranked-top10.default.json`.
2. **Debounced Persistence Helper:**
   - `saveConfig()` writes the current settings and active position to `quiz-config.json`.
   - Called whenever `SET_GAME_MODE`, `SELECT_MILLIONAIRE_QUESTION`, `SELECT_CATEGORY`, `UPDATE_AUDIO_CONFIG`, `SET_BGM_VOLUME`, `UPDATE_STRIKE_CONFIG`, `UPDATE_TITLE_LOGO`, or `SET_THEME_MODE` is executed.
3. **Safety & Fallbacks:**
   - Uses `try/catch` on file read/write operations to avoid crashing on unexpected file locks.
   - Atomic or safe write to prevent truncated files on abrupt shutdown.

---

## 6. Testing & Quality Assurance Plan

1. **Unit Tests (`tests/millionaire-sync.test.js`):**
   - Verify `SET_GAME_MODE` switches between `'quiz'` and `'family'`.
   - Verify `HIGHLIGHT_MILLIONAIRE_OPTION` updates selection and broadcasts `click` sound.
   - Verify `LOCK_MILLIONAIRE_ANSWER` sets `isLocked: true` and broadcasts `lock` sound.
   - Verify `REVEAL_MILLIONAIRE_ANSWER` checks correct option, setting `isRevealed: true`, and broadcasts `correct` when matching or `buzzer` when wrong.
   - Verify `TOGGLE_MILLIONAIRE_HINT` updates `showHint`.
   - Verify `SELECT_MILLIONAIRE_QUESTION` resets selection state and updates `transitionWipeTimestamp`.
2. **Persistence Test (`tests/persistence.test.js`):**
   - Verify `quiz-config.json` is created and updated upon state changes.
   - Verify restarting server reads `quiz-config.json` and restores mode, question ID, volumes, and theme mode.
3. **Frontend Build & Release Tests:**
   - Run `npm test` to pass all test suites.
   - Run `npm run build` to ensure clean TypeScript compilation.
   - Run `npm run build:release` to package the updated lightweight deliverables including `spacebar.mp3` and `anime-quiz-database-v3.json`.
