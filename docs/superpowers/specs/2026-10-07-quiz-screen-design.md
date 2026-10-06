# Quiz Screen: Family Wibu 100 — Design Specification

**Date:** 2026-10-07  
**Status:** Approved  
**Project:** Quiz Screen App ("Family Wibu 100" dual-screen list guessing game)

---

## 1. Overview & Purpose

The **Quiz Screen** app is a dual-screen, "guess what is on the list" quiz show application inspired by *Family Feud* / *Family 100* (adapted for anime fandom, styled after the "Family Wibu 100" arcade convention aesthetic). 

The app operates across two views:
1. **Main Display View (`/`):** Designed for OBS Studio Browser Source (1920×1080) or direct HDMI projector/TV display. Shows category title, optional clue banner, a 10-slot 3D flip card gameboard, configurable strike badges, dramatic wrong-guess "X" animations, and game audio effects.
2. **Host Controller View (`/control`):** Designed for the game master running in any desktop or mobile browser. Displays category selectors, a live cheat-sheet showing all 10 answers with anime titles, alternative aliases, and trivia notes, instant search highlighting, one-click reveal/hide buttons, strike count controls, quick buzzer, and sound settings.

---

## 2. Technical Architecture & Communication

### 2.1 Cross-Process Local WebSocket Architecture
* **Requirement:** Must support OBS Studio's built-in CEF (Chromium Embedded Framework) browser source on the main display, while the game host operates from an external browser (Chrome, Firefox, Edge, etc.) on `localhost`.
* **Server:** A lightweight Node.js server running on `http://localhost:3000`.
  * Serves the frontend static bundle.
  * Hosts a WebSocket hub (`ws://localhost:3000/ws`) that broadcasts all game state updates across clients with <5ms latency.
* **Client Frontend:** Single Vite + React + Tailwind CSS application with client-side routing:
  * Route `/`: Main Display Screen (OBS Browser Source / Projector).
  * Route `/control`: Host Controller Dashboard.

### 2.2 Shared State Model

```typescript
interface QuizItem {
  id: number;
  answer: string;
  anime?: string;
  aliases?: string[];
  reason?: string;
  rank: number;
  difficulty?: string;
}

interface QuizCategory {
  id: number;
  category: string;
  emoji?: string;
  clue?: string;
  answerType?: string;
  items: QuizItem[];
}

interface QuizState {
  categoryId: number;
  revealedItemIds: number[];      // Set of revealed item IDs
  showClue: boolean;              // Whether category clue is displayed on main screen
  // Strike configuration & count
  strikeSlotsEnabled: boolean;    // Default: false (no slots on screen)
  maxStrikeSlots: number;         // 2 to 5 (default: 3 when enabled)
  currentStrikes: number;         // 0 to maxStrikeSlots
  // Wrong guess quick flash
  quickBuzzerTriggerTime: number | null; // Timestamp to trigger ephemeral big X flash
  // Audio settings
  soundEnabled: boolean;
  soundVolume: number;            // 0.0 to 1.0
  customAudio: {
    useCustomSound: boolean;
    correctAudioDataUrl: string | null;
    wrongAudioDataUrl: string | null;
  };
  // Display theme mode
  themeMode: 'stage' | 'transparent'; // 'stage' (dark gameshow) or 'transparent' (OBS overlay)
}
```

### 2.3 WebSocket Message Protocol

The WebSocket hub maintains the authoritative state and broadcasts events in JSON format:

* `CLIENT_HELLO`: Sent by client on connect; server responds with `STATE_SNAPSHOT`.
* `SELECT_CATEGORY`: `{ type: 'SELECT_CATEGORY', categoryId: number }`
* `REVEAL_ITEM`: `{ type: 'REVEAL_ITEM', itemId: number }`
* `HIDE_ITEM`: `{ type: 'HIDE_ITEM', itemId: number }`
* `REVEAL_ALL`: `{ type: 'REVEAL_ALL' }`
* `HIDE_ALL`: `{ type: 'HIDE_ALL' }`
* `TOGGLE_CLUE`: `{ type: 'TOGGLE_CLUE', showClue: boolean }`
* `SET_STRIKES`: `{ type: 'SET_STRIKES', strikes: number }`
* `TRIGGER_QUICK_BUZZER`: `{ type: 'TRIGGER_QUICK_BUZZER' }`
* `UPDATE_STRIKE_CONFIG`: `{ type: 'UPDATE_STRIKE_CONFIG', enabled: boolean, maxSlots: number }`
* `UPDATE_AUDIO_CONFIG`: `{ type: 'UPDATE_AUDIO_CONFIG', settings: Partial<QuizState['customAudio'] & { soundEnabled: boolean; soundVolume: number }> }`
* `SET_THEME_MODE`: `{ type: 'SET_THEME_MODE', mode: 'stage' | 'transparent' }`
* `RESET_ROUND`: `{ type: 'RESET_ROUND' }`

---

## 3. Visual Design System ("Family Wibu 100" Aesthetic)

Directly inspired by the Plaza Cosplay Day *Family Wibu 100* poster:

* **Color Palette:**
  * Background (Stage Mode): Deep cosmic navy `#0A0D26` to midnight indigo `#130D3A`.
  * Neon Cyan (Primary highlight): `#00F0FF` (used for card glow borders and primary buttons).
  * Neon Magenta / Hot Pink (Accent & buzzer glow): `#FF2E93` (used for category highlights and strikes).
  * Arcade Yellow / Gold (Star / rank badges): `#FFD600` (used for rank numbers and victory elements).
  * Dark Card Base: `#12183E` with crisp border `#2A356C`.
  * Text: High-contrast white `#FFFFFF` for primary answers and soft cyan/lavender `#C5CEF8` for subtitles.
* **Typography:** Bold, energetic sans-serif / comic-arcade styling with high legibility for streaming (e.g., Fredoka / Outfit / Inter Black).
* **Card Slots:**
  * 10 slots arranged in a 2-column × 5-row grid.
  * In covered state: Sleek, high-gloss arcade card showing numbered badge (`01` through `10`).
  * In revealed state: Smooth 3D horizontal flip animation (`transform: rotateY(180deg)`) revealing rank pill on left, bold character name in center, and anime title badge on right.

---

## 4. Main Display Screen (`/`) Specifications

1. **Resolution & Canvas:** 1920×1080 responsive canvas. Supports OBS Browser Source and projector modes.
2. **Category Header:**
   * Category emoji and title in large, high-impact arcade font.
   * Progress chip (e.g., "4 / 10 Revealed").
   * Collapsible clue bar underneath (toggled by host).
3. **Game Board:**
   * 2 columns × 5 rows.
   * CSS 3D perspective flip cards with hardware acceleration.
4. **Strike Display:**
   * **When Strike Slots are Disabled:** No strike slots displayed on canvas.
   * **When Strike Slots are Enabled:** Renders 2 to 5 diamond/hexagon arcade badge slots. Unstruck slots appear as empty neon frames; active strikes slam in with an animated red/magenta `✕` and buzzer.
5. **Wrong Guess Big "X" Overlay:**
   * Fullscreen translucent overlay with screen shake.
   * Giant glowing `✕` icon pulses into view for 1.2s and fades away.
6. **Audio Playback:**
   * Web Audio API synthesized audio by default:
     * *Correct Reveal:* Uplifting two-tone chime (F#5 -> B5 sine wave with natural decay).
     * *Wrong Guess:* Low sawtooth dissonance buzzer (120Hz + 128Hz with harsh harmonic envelope).
   * Custom audio support: Allows host to supply audio files for ding and buzzer. Audio is triggered locally inside the main display so OBS captures it directly.

---

## 5. Host Controller Screen (`/control`) Specifications

1. **Category Navigation:**
   * Tabs or dropdown to select from the 4 categories in `anime-family-database-ranked-top10.json`.
2. **Live Answer Roster & Search:**
   * Instant filter input: Typing e.g. "rem", "naruto", or alias instantly highlights the matching item in yellow.
   * 10 item cards displaying:
     * Rank (#1 to #10)
     * Character Answer (large)
     * Anime Title
     * Aliases list (highlighted tags)
     * Reason/Trivia context
     * One-click toggle button: `[ Reveal ]` (green) / `[ Hide ]` (gray).
3. **Host Control Bar:**
   * **Strikes:** `[ + Strike ]` (adds 1), `[ - Strike ]` (reduces 1), `[ Reset Strikes ]`.
   * **Buzzer:** `[ Quick Buzzer (X) ]` (ephemeral 1.2s flash).
   * **Board Actions:** `[ Reveal All Remaining ]`, `[ Reset Board ]`, `[ Toggle Clue ]`.
4. **Settings Modal:**
   * Strike Slots: Enable/disable toggle + Slider/Buttons to choose slot count (2, 3, 4, 5).
   * Audio: Sound ON/OFF, volume slider, audio type (Synthesized vs Custom Audio File upload for Ding & Buzzer).
   * Theme: Stage Dark vs OBS Transparent Background.

---

## 6. Data Source Integration

Data loaded directly from `/anime-family-database-ranked-top10.json`:
* Category 1: *Waifu Sejuta Umat: Karakter yang Sering Diklaim "Bini Gue"* (10 items)
* Category 2: *Anime Iyashikei: Tontonan Santuy dengan Slow Pacing & Cozy Vibes* (10 items)
* Category 3: *Sensei Idaman tapi Kelakuan Sengklek* (10 items)
* Category 4: *Duta Penderitaan: Karakter Paling Kena Siksa Batin & Fisik* (10 items)

Server loads and serves this JSON file on startup.

---

## 7. Verification & Testing Strategy

1. **WebSocket Synchronization Test:**
   * Open `/` and `/control` in separate browser windows.
   * Verify category selection syncs immediately.
   * Verify individual item reveals flip correctly on the main screen.
   * Verify quick buzzer and strike additions update in real-time without latency.
2. **OBS Studio Compatibility Test:**
   * Load `http://localhost:3000/` inside an OBS Browser Source (1920×1080).
   * Control from external Google Chrome window on `http://localhost:3000/control`.
   * Confirm audio plays through OBS audio channel and animations render cleanly.
3. **Responsive & Resiliency Test:**
   * Refresh main display while game is in progress; verify state snapshot is immediately restored without data loss.
