# Quiz Wibu (Millionaire Style) & Persistent Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Quiz Wibu" (Who Wants to Be a Millionaire style) multi-round game mode with option highlight, answer locking, result reveal with sound effects, hint & explanation display, seamless holographic wipe transitions, and persistent file configuration (`quiz-config.json`).

**Architecture:** Extend server authoritative state with `gameMode: 'quiz' | 'family'`, `millionaireState`, and `quiz-config.json` persistence. Create `<MillionaireBoard />` for the Main Display (OBS friendly) and `<MillionaireController />` for the Host Controller, integrated into a unified multi-round layout.

**Tech Stack:** TypeScript, React 19, Tailwind CSS v4, Express, WebSocket (`ws`), Web Audio API, Node.js `fs`.

**Spec:** [`docs/superpowers/specs/2026-10-10-quiz-wibu-millionaire-design.md`](file:///home/garion/Documents/antigravity/quiz-screen/docs/superpowers/specs/2026-10-10-quiz-wibu-millionaire-design.md)

## Global Constraints

- No em dashes (—) in UI copy, code comments, or commit messages (per antislop R-02).
- OBS Studio transparent canvas mode (`state.themeMode === 'transparent'`) must be fully supported on Millionaire board.
- Audio playback must adhere to Web Audio API user gesture unlock and soundboard ducking.
- Release deliverables (`release/`) must bundle all necessary database and audio assets while remaining lightweight.

## Review Focus

1. OBS disconnect or reload during Millionaire mode: client re-renders with exact active question, option highlight, lock, and reveal state.
2. Question bounds safety: selecting out-of-range question IDs or options falls back gracefully without crashing.
3. Audio coordination: answer highlight triggers `click-short.wav`, lock triggers `spacebar.mp3`, correct reveal triggers `correct.mp3`, and wrong reveal triggers `buzzer.mp3` with chosen red and correct green.
4. Server crash or restart: `quiz-config.json` restores previous mode, volumes, theme, strikes, and active question ID.
5. Midpoint wipe transition: changing question or game mode triggers `TransitionWipe` and swaps screen content only when covered.

---

### Task 1: Data Contracts, Audio Asset & Audio Service Extension

**Files:**
- Modify: `src/types/quiz.ts:1-96`
- Copy: `spacebar.mp3` -> `public/audio/spacebar.mp3`
- Modify: `src/services/audio.ts:1-250`
- Test: `tests/audio.test.ts`

**Interfaces:**
- Produces: `GameMode`, `MillionaireQuestion`, `MillionaireState`, `QuizConfigPersistent` in `src/types/quiz.ts`
- Produces: `audioService.playLockSound()`, `SoundEffectType = ... | 'lock'` in `src/services/audio.ts`

- [ ] **Step 1: Write the failing test for lock audio in `tests/audio.test.ts`**

Add unit test asserting `audioService.playLockSound()` exists and can be called without error.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx tests/audio.test.ts`
Expected: FAIL with "playLockSound is not a function"

- [ ] **Step 3: Update `src/types/quiz.ts` and `src/services/audio.ts`, and copy `spacebar.mp3`**

1. Copy `spacebar.mp3` to `public/audio/spacebar.mp3`.
2. Add `GameMode`, `MillionaireQuestion`, `MillionaireState`, and `QuizConfigPersistent` to `src/types/quiz.ts`.
3. Add `'lock'` to `SoundEffectType` in `src/types/quiz.ts`.
4. Add `preloadLockSound()` and `playLockSound()` using `/audio/spacebar.mp3` in `src/services/audio.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/audio.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/quiz.ts src/services/audio.ts public/audio/spacebar.mp3 tests/audio.test.ts
git commit -m "feat(audio): add Millionaire types and spacebar lock SFX"
```

---

### Task 2: Server State Extension, Database Loading & Persistent Configuration

**Files:**
- Create: `anime-quiz-database-v3.default.json` (copy from `anime-quiz-database-v3.json`)
- Modify: `server/index.js:1-524`
- Create: `tests/persistence.test.js`
- Create: `tests/millionaire-sync.test.js`

**Interfaces:**
- Consumes: `MillionaireQuestion`, `MillionaireState`, `QuizConfigPersistent` from `src/types/quiz.ts`
- Produces: Server WebSocket handlers:
  - `SET_GAME_MODE`
  - `SELECT_MILLIONAIRE_QUESTION`
  - `HIGHLIGHT_MILLIONAIRE_OPTION`
  - `LOCK_MILLIONAIRE_ANSWER`
  - `REVEAL_MILLIONAIRE_ANSWER`
  - `TOGGLE_MILLIONAIRE_HINT`
  - `RESET_MILLIONAIRE_QUESTION`
- Produces: Persistent config file `quiz-config.json`

- [ ] **Step 1: Write failing tests in `tests/persistence.test.js` and `tests/millionaire-sync.test.js`**

1. `tests/persistence.test.js`: Start server, modify settings and game mode, verify `quiz-config.json` is written to disk, reboot server on new port, verify state is restored.
2. `tests/millionaire-sync.test.js`: Connect WebSocket, test `SET_GAME_MODE`, `HIGHLIGHT_MILLIONAIRE_OPTION`, `LOCK_MILLIONAIRE_ANSWER`, `REVEAL_MILLIONAIRE_ANSWER`, and `TOGGLE_MILLIONAIRE_HINT`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/millionaire-sync.test.js`
Expected: FAIL with unhandled action / missing properties

- [ ] **Step 3: Implement database loading, persistence, and action handlers in `server/index.js`**

1. Copy `anime-quiz-database-v3.json` to `anime-quiz-database-v3.default.json`.
2. Load `anime-quiz-database-v3.json` on server startup; fallback to `.default.json`.
3. Implement `loadConfig()` and `saveConfig()` for `quiz-config.json`.
4. Add `gameMode` and `millionaireState` to `currentState`.
5. Implement case handlers for:
   - `SET_GAME_MODE`: updates `gameMode`, triggers wipe transition, saves config.
   - `SELECT_MILLIONAIRE_QUESTION`: sets question ID, resets selection/lock/reveal/hint, triggers wipe, saves config.
   - `HIGHLIGHT_MILLIONAIRE_OPTION`: sets option index, broadcasts `PLAY_SOUND` click.
   - `LOCK_MILLIONAIRE_ANSWER`: sets `isLocked = true`, broadcasts `PLAY_SOUND` lock.
   - `REVEAL_MILLIONAIRE_ANSWER`: sets `isRevealed = true`, broadcasts `PLAY_SOUND` correct (if right) or buzzer (if wrong).
   - `TOGGLE_MILLIONAIRE_HINT`: toggles `showHint`.
   - `RESET_MILLIONAIRE_QUESTION`: resets selection/lock/reveal/hint on active question.
6. Include `millionaireQuestions` in `STATE_SNAPSHOT` and `/api/state`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/millionaire-sync.test.js && node tests/persistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/index.js anime-quiz-database-v3.default.json tests/persistence.test.js tests/millionaire-sync.test.js
git commit -m "feat(server): add Millionaire state machine and persistent quiz configuration"
```

---

### Task 3: Main Display Millionaire Board Component

**Files:**
- Create: `src/components/MainDisplay/MillionaireBoard.tsx`
- Create: `tests/millionaire-board.test.ts`

**Interfaces:**
- Consumes: `MillionaireQuestion`, `MillionaireState`, `themeMode`
- Produces: `<MillionaireBoard />` component with:
  - Category pill badge
  - Central question stadium box
  - Collapsible hint banner (when `showHint` is true)
  - 4 Options grid (A, B, C, D) with Idle, Highlighted (Amber), Locked (Golden Pulse), Revealed Correct (Green), and Revealed Wrong (Red + Correct Green) states
  - Explanation card (when `isRevealed` is true)
  - Responsive text scaling and transparent OBS theme support

- [ ] **Step 1: Write test for option styling and state logic in `tests/millionaire-board.test.ts`**

Assert state-to-class mapping:
- Option selected & not locked -> highlighted style
- Option selected & locked -> locked pulsating golden style
- Option revealed correct -> emerald green style
- Option revealed wrong -> chosen red, correct answer emerald green

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx tests/millionaire-board.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/components/MainDisplay/MillionaireBoard.tsx`**

Implement `<MillionaireBoard />` with high-contrast, cyberpunk neon styling, clean layout, responsive typography, and full state transitions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/millionaire-board.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MainDisplay/MillionaireBoard.tsx tests/millionaire-board.test.ts
git commit -m "feat(ui): create MillionaireBoard component for Main Display"
```

---

### Task 4: Main Display Routing & Holographic Wipe Integration

**Files:**
- Modify: `src/components/MainDisplay/MainDisplay.tsx:1-320`
- Test: `tests/e2e-sync.test.ts`

**Interfaces:**
- Consumes: `state.gameMode`, `state.millionaireState`, `millionaireQuestions` from `App.tsx`
- Produces: Seamless display routing between TitleScreen, MillionaireBoard, and Family100Board via `TransitionWipe`

- [ ] **Step 1: Write test for gameMode display switching in `tests/e2e-sync.test.ts`**

Add assertion verifying state snapshot contains `gameMode` and `millionaireState`.

- [ ] **Step 2: Run test to verify current state**

Run: `npx tsx tests/e2e-sync.test.ts`
Expected: Verify before updating component

- [ ] **Step 3: Update `src/components/MainDisplay/MainDisplay.tsx` and `src/App.tsx`**

1. In `src/App.tsx`: pass `millionaireQuestions` from socket snapshot to views.
2. In `src/components/MainDisplay/MainDisplay.tsx`:
   - Extend `displayedCategoryState` buffer to include `gameMode` and `currentQuestionId` so view changes wait for midpoint of `TransitionWipe`.
   - Route between `<TitleScreen />`, `<MillionaireBoard />`, and Family Feud board.
   - Listen for sound effects `lock`, `click`, etc., in `audioService` listener.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/MainDisplay/MainDisplay.tsx tests/e2e-sync.test.ts
git commit -m "feat(display): route MainDisplay between Family 100 and Millionaire with wipe transition"
```

---

### Task 5: Host Controller Millionaire Panel & Round Switcher

**Files:**
- Create: `src/components/Controller/MillionaireController.tsx`
- Modify: `src/components/Controller/ControllerView.tsx:1-290`

**Interfaces:**
- Consumes: `state.gameMode`, `state.millionaireState`, `millionaireQuestions`, `sendMessage`
- Produces:
  - Header Round Switcher: `[Ronde 1: Quiz Wibu]` and `[Ronde 2: Family Wibu 100]`
  - Category filter dropdown / tabs
  - Question search input
  - Navigation: Prev, Soal Acak (Random), Next
  - Option selector buttons A/B/C/D with green `[BENAR]` cheat sheet indicator
  - Action buttons: Hint toggle, Lock answer, Reveal result, Reset

- [ ] **Step 1: Implement `src/components/Controller/MillionaireController.tsx`**

Build the host control panel for Quiz Wibu with:
- Category filter and search query state
- Question navigator (`prev`, `next`, `random`)
- Cheat sheet view with correct answer badge and explanation
- Option highlight buttons
- Action controls (`Lock`, `Reveal`, `Hint`, `Reset`)

- [ ] **Step 2: Integrate into `src/components/Controller/ControllerView.tsx`**

1. Add round switcher buttons in the header:
   - `[Ronde 1: Quiz Wibu]`
   - `[Ronde 2: Family Wibu 100]`
2. Conditionally render `<MillionaireController />` when `state.gameMode === 'quiz'`, or existing Family 100 panels when `state.gameMode === 'family'`.
3. Update header status badge to show `🎮 Quiz Wibu (Millionaire)` when on quiz mode.

- [ ] **Step 3: Run full test suite and build verification**

Run: `npm test && npm run build`
Expected: PASS with 0 TypeScript/build errors

- [ ] **Step 4: Commit**

```bash
git add src/components/Controller/MillionaireController.tsx src/components/Controller/ControllerView.tsx
git commit -m "feat(controller): add MillionaireController panel and header round switcher"
```

---

### Task 6: Packaging, Release Bundling & Full End-to-End Verification

**Files:**
- Modify: `scripts/build-release.mjs:1-120`
- Test: Full release package build and verification

**Interfaces:**
- Produces: Updated portable release packages (`release/guessthelist-quiz-v1.0.0-portable.zip` and `.tar.gz`) containing `spacebar.mp3`, `anime-quiz-database-v3.json`, `anime-quiz-database-v3.default.json`, and `quiz-config.json` defaults.

- [ ] **Step 1: Update `scripts/build-release.mjs`**

Include:
- `anime-quiz-database-v3.json`
- `anime-quiz-database-v3.default.json`
- `public/audio/spacebar.mp3`

- [ ] **Step 2: Run all test suites**

Run: `npm test`
Expected: All test suites PASS

- [ ] **Step 3: Build release bundle**

Run: `npm run build:release`
Expected: Release ZIP and TAR.GZ built successfully

- [ ] **Step 4: Commit and push**

```bash
git add scripts/build-release.mjs package.json
git commit -m "chore(release): package Millionaire assets and audio in portable release"
git push origin main
git tag -f v1.0.0
git push --force origin v1.0.0
```
