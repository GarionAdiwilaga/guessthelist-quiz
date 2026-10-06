# Quiz Screen: Family Wibu 100 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-screen anime list quiz show application ("Family Wibu 100") with an OBS/projector-ready main display board and a real-time host controller synchronized over a local WebSocket hub.

**Architecture:** A single Node.js + Vite React application serving two routes (`/` for Main Display, `/control` for Host Controller) synchronized with sub-5ms latency over a native WebSocket server running on `http://localhost:3000`.

**Tech Stack:** React 19 / TypeScript / Vite / Tailwind CSS / Lucide React / Node.js `ws` / Web Audio API.

**Spec:** [`docs/superpowers/specs/2026-10-07-quiz-screen-design.md`](file:///home/garion/Documents/antigravity/quiz-screen/docs/superpowers/specs/2026-10-07-quiz-screen-design.md)

## Global Constraints

- Must run locally on port 3000 (`http://localhost:3000` for Main Display, `http://localhost:3000/control` for Host Controller).
- Main Display must be compatible with OBS Studio CEF Browser Source (transparent canvas option, Web Audio capture, responsive 1920×1080 canvas).
- Visual styling must adhere to the "Family Wibu 100" arcade aesthetic: Neon Cyan (`#00F0FF`), Neon Magenta (`#FF2E93`), Arcade Gold (`#FFD600`), and Deep Indigo (`#0B0E28`).
- Strike slots: Default disabled (no slots). When enabled, default 3 slots, adjustable between 2 and 5 slots. Host controller must support incrementing, decrementing, and resetting strikes.
- Audio: Zero external audio file dependency by default (synthesized Web Audio API chime and buzzer), with support for user-uploaded custom audio files.
- Real initial data from `anime-family-database-ranked-top10.json` (4 categories, 10 items each).

## Review Focus

- OBS disconnect/reconnect: If the OBS browser source is reloaded mid-game, it must immediately retrieve the current snapshot from the server without losing revealed cards or strike counts.
- Audio Autoplay Restrictions: The Main Screen must initialize its Web Audio context gracefully on first interaction or mount (handling browser autoplay policies).
- Responsive Text Scaling: Long character names (e.g. "Mai Sakurajima") and anime titles must fit into the flip card without clipping or breaking the 3D card perspective.
- Rapid Concurrent Input: Host clicking multiple reveals in quick succession must not drop messages or cause race conditions in card flip states.
- Strike Slot Range Bounds: Strike counts must clamp cleanly to `[0, maxStrikeSlots]` without displaying negative or overflowing badges.

---

### Task 1: Project Scaffolding, Tailwind Setup & Shared Types

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/types/quiz.ts`
- Test: `tests/database.test.ts`

**Interfaces:**
- Produces: `QuizState`, `QuizCategory`, `QuizItem`, and `WSMessage` types for all client and server modules.

- [ ] **Step 1: Write test verifying database JSON integrity and type contract**
Create `tests/database.test.ts` asserting `anime-family-database-ranked-top10.json` has 4 categories and each category has exactly 10 ranked items with `id`, `answer`, and `rank`.

- [ ] **Step 2: Run test to verify it fails before environment setup**
Run: `npx tsx tests/database.test.ts`
Expected: FAIL (missing dependencies/tsx).

- [ ] **Step 3: Initialize project configuration, install dependencies and define types**
Install `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, and dev dependencies (`vite`, `typescript`, `@types/react`, `@types/node`, `tailwindcss`, `@tailwindcss/vite` or Tailwind CLI, `tsx`).
Define `QuizState`, `QuizCategory`, `QuizItem`, `WSMessage` in `src/types/quiz.ts`.

- [ ] **Step 4: Run database integrity test**
Run: `npx tsx tests/database.test.ts`
Expected: PASS (4 categories validated, 10 items each).

- [ ] **Step 5: Commit**
```bash
git add package.json tsconfig.json vite.config.ts index.html src/ tests/
git commit -m "feat: initialize project scaffolding and shared quiz types"
```

---

### Task 2: WebSocket Hub & Local Server

**Files:**
- Create: `server/index.js`
- Create: `tests/server.test.js`

**Interfaces:**
- Consumes: `anime-family-database-ranked-top10.json`
- Produces: HTTP server on port 3000 + WebSocket endpoint on `ws://localhost:3000/ws` broadcasting `STATE_SNAPSHOT` and processing action events (`SELECT_CATEGORY`, `REVEAL_ITEM`, `HIDE_ITEM`, `REVEAL_ALL`, `SET_STRIKES`, `TRIGGER_QUICK_BUZZER`, `UPDATE_STRIKE_CONFIG`, `UPDATE_AUDIO_CONFIG`, `RESET_ROUND`).

- [ ] **Step 1: Write test for WebSocket hub state broadcast and client synchronization**
Write `tests/server.test.js` connecting two WebSocket clients, verifying that `SELECT_CATEGORY` and `REVEAL_ITEM` actions from Client 1 broadcast an updated `STATE_SNAPSHOT` to Client 2.

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/server.test.js`
Expected: FAIL (connection refused on port 3000).

- [ ] **Step 3: Implement `server/index.js` with Express/HTTP and `ws`**
Implement state container seeded with Category 1 from `anime-family-database-ranked-top10.json`.
Handle all action types, clamp strike numbers, update timestamp on buzzer flash, and broadcast state to all connected sockets.
Serve static dist files in production or proxy Vite in dev.

- [ ] **Step 4: Run server test to verify it passes**
Run: `node tests/server.test.js`
Expected: PASS (actions dispatched, snapshots synced across clients).

- [ ] **Step 5: Commit**
```bash
git add server/ tests/server.test.js
git commit -m "feat: implement local server and WebSocket synchronization hub"
```

---

### Task 3: Web Audio Synthesizer & Audio Service

**Files:**
- Create: `src/services/audio.ts`
- Test: `tests/audio.test.ts`

**Interfaces:**
- Consumes: `QuizState['customAudio']`, `soundEnabled`, `soundVolume`
- Produces: `playCorrectSound()`, `playBuzzerSound()`, `updateAudioSettings(volume, enabled, customAudio)`

- [ ] **Step 1: Write unit test for Audio Service configuration logic**
Create `tests/audio.test.ts` testing frequency generation logic, volume clamping, and data URL fallback routing.

- [ ] **Step 2: Run test to verify it passes/fails**
Run: `npx tsx tests/audio.test.ts`
Expected: FAIL (missing module).

- [ ] **Step 3: Implement `src/services/audio.ts`**
Implement Web Audio API synthesizer:
- Correct sound: Dual-tone harmonic chime (587.33 Hz F#5 -> 987.77 Hz B5 sine oscillators with exponential gain envelope).
- Wrong buzzer: Dissonant dual sawtooth wave (120 Hz + 128 Hz with harsh low-pass filter decay).
- Custom audio player fallback if `customAudio.useCustomSound` is true and valid data URL is provided.

- [ ] **Step 4: Run audio tests**
Run: `npx tsx tests/audio.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/services/audio.ts tests/audio.test.ts
git commit -m "feat: implement Web Audio API chime and buzzer sound engine"
```

---

### Task 4: Main Display — Game Board & 3D Flip Card Component

**Files:**
- Create: `src/components/MainDisplay/FlipCard.tsx`
- Create: `src/components/MainDisplay/GameBoard.tsx`
- Create: `src/components/MainDisplay/HeaderBanner.tsx`
- Create: `src/components/MainDisplay/MainDisplay.tsx`

**Interfaces:**
- Consumes: `QuizCategory`, `revealedItemIds: number[]`, `showClue: boolean`
- Produces: 1920×1080 Main Display layout with 2×5 grid of Family Feud flip cards.

- [ ] **Step 1: Build `FlipCard.tsx` with CSS 3D perspective transform**
Implement card with `preserve-3d`, `rotateY(180deg)` flip transition:
- Front: Neon cyan slot border, textured midnight base, bold glowing rank number badge (`01`–`10`), subtle arcade star icon.
- Back: Vibrant revealed card with rank badge on left, bold character answer in center, and anime title chip on right.

- [ ] **Step 2: Build `HeaderBanner.tsx` and `GameBoard.tsx`**
Header displays category title, emoji, revealed count badge ("X / 10"), and optional clue text.
Board organizes the 10 items in 2 columns of 5.

- [ ] **Step 3: Implement `MainDisplay.tsx` container with Stage and Transparent background modes**
Wrap board and header with full-screen container matching 16:9 OBS canvas.

- [ ] **Step 4: Verify visually in browser**
Run: `npm run dev` and verify `/` route renders clean 10-slot board.

- [ ] **Step 5: Commit**
```bash
git add src/components/MainDisplay/
git commit -m "feat: implement Main Display board with 3D flip card animations"
```

---

### Task 5: Main Display — Configurable Strike Slots & Dramatic Wrong "X" Overlay

**Files:**
- Create: `src/components/MainDisplay/StrikeSlots.tsx`
- Create: `src/components/MainDisplay/BuzzerOverlay.tsx`
- Modify: `src/components/MainDisplay/MainDisplay.tsx`

**Interfaces:**
- Consumes: `strikeSlotsEnabled: boolean`, `maxStrikeSlots: number`, `currentStrikes: number`, `quickBuzzerTriggerTime: number | null`
- Produces: Visual strike slots (2–5 badges) and screen-shaking red "X" buzzer overlay.

- [ ] **Step 1: Implement `StrikeSlots.tsx`**
Renders `maxStrikeSlots` (2 to 5) arcade badge frames when `strikeSlotsEnabled` is true.
Badges up to `currentStrikes` display an aggressive glowing neon red `✕` with entry animation.
Returns `null` when `strikeSlotsEnabled` is false.

- [ ] **Step 2: Implement `BuzzerOverlay.tsx`**
Listens for changes in `quickBuzzerTriggerTime` or strike increment.
Animates a giant fullscreen pulsing `✕` with red glow, screen-shake keyframes, and automatic 1.2s timeout.

- [ ] **Step 3: Integrate StrikeSlots and BuzzerOverlay into `MainDisplay.tsx` with sound triggers**
Connect `playCorrectSound()` on new reveals and `playBuzzerSound()` on strikes / quick buzzers.

- [ ] **Step 4: Commit**
```bash
git add src/components/MainDisplay/
git commit -m "feat: implement strike slots and dramatic wrong-guess buzzer overlay"
```

---

### Task 6: Host Controller — Category Selector & Answer Roster with Search

**Files:**
- Create: `src/components/Controller/CategorySelector.tsx`
- Create: `src/components/Controller/AnswerCard.tsx`
- Create: `src/components/Controller/AnswerRoster.tsx`
- Create: `src/components/Controller/ControllerView.tsx`

**Interfaces:**
- Consumes: `categories: QuizCategory[]`, `activeCategoryId: number`, `revealedItemIds: number[]`
- Produces: Interactive host cheat-sheet with instant search filter highlighting answers, aliases, and anime titles.

- [ ] **Step 1: Implement `CategorySelector.tsx`**
Tabs allowing host to switch between the 4 quiz categories with emoji and titles. Dispatches `SELECT_CATEGORY`.

- [ ] **Step 2: Implement `AnswerCard.tsx`**
Card displaying:
- Rank badge & Character Name
- Anime title
- Aliases tag list (highlighting matches)
- Trivia snippet
- High-visibility `[ Reveal ]` / `[ Hide ]` action button.

- [ ] **Step 3: Implement `AnswerRoster.tsx` with instant search filter**
Input bar for live search. Matches against answer name, anime title, and all aliases; highlights matching cards in radiant yellow.

- [ ] **Step 4: Commit**
```bash
git add src/components/Controller/
git commit -m "feat: implement host category selector and answer roster with live search"
```

---

### Task 7: Host Controller — Action Bar, Strike Controls & Settings Modal

**Files:**
- Create: `src/components/Controller/StrikeControls.tsx`
- Create: `src/components/Controller/BoardControls.tsx`
- Create: `src/components/Controller/SettingsModal.tsx`
- Modify: `src/components/Controller/ControllerView.tsx`

**Interfaces:**
- Consumes: `QuizState`, `sendWSMessage`
- Produces: Complete control dashboard for strikes, quick buzzer, board actions, and settings.

- [ ] **Step 1: Implement `StrikeControls.tsx`**
Buttons for:
- `[ + Strike ]` (increments `currentStrikes` up to `maxStrikeSlots`)
- `[ - Strike ]` (decrements `currentStrikes` down to 0)
- `[ Reset Strikes ]` (sets `currentStrikes` to 0)
- `[ Quick Buzzer (X) ]` (fires `TRIGGER_QUICK_BUZZER`)

- [ ] **Step 2: Implement `BoardControls.tsx`**
Buttons for `[ Reveal All Remaining ]`, `[ Hide All / Reset Round ]`, and `[ Toggle Clue Banner ]`.

- [ ] **Step 3: Implement `SettingsModal.tsx`**
- Strike Slots: Enable toggle + slot selector (2, 3, 4, 5).
- Background: Stage Dark vs OBS Transparent.
- Audio: Sound toggle, volume slider, Synthesizer vs Custom File uploader (`.mp3`/`.wav` to base64 Data URL).

- [ ] **Step 4: Commit**
```bash
git add src/components/Controller/
git commit -m "feat: implement strike controls, board actions, and host settings modal"
```

---

### Task 8: Client Routing, End-to-End WebSocket Wiring & Verification

**Files:**
- Create: `src/services/socket.ts`
- Modify: `src/App.tsx`
- Test: `tests/e2e-sync.test.ts`

**Interfaces:**
- Connects both views (`/` and `/control`) to the live WebSocket hub and validates end-to-end sync.

- [ ] **Step 1: Implement `src/services/socket.ts`**
Manages WebSocket connection with auto-reconnect and state listener callback.

- [ ] **Step 2: Wire `App.tsx` with path-based routing**
Renders `MainDisplay` on `/` and `ControllerView` on `/control`.

- [ ] **Step 3: Write and run end-to-end sync verification script**
Create `tests/e2e-sync.test.ts` validating:
- Server starts on port 3000
- Initial snapshot delivers Category 1
- Controller actions dispatch and reflect in snapshot
- Audio and strike settings update seamlessly

- [ ] **Step 4: Full verification in browser & OBS preview**
Run full server: `npm start`
Open `http://localhost:3000` and `http://localhost:3000/control` in side-by-side windows.
Verify:
1. Category switching updates main board instantly.
2. Revealing items triggers 3D card flip with chime.
3. Quick buzzer triggers fullscreen glowing "X" and buzzer sound.
4. Enabling strikes displays configurable slots (2–5) and responds to + / - / reset.
5. Search input highlights matching cards on host screen.

- [ ] **Step 5: Final Commit**
```bash
git add src/ App.tsx tests/
git commit -m "feat: complete end-to-end integration and dual-screen synchronization"
```
