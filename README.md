# Guess The List Quiz : Family Wibu 100 & Quiz Wibu 🎮

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Realtime_Sync-ff2e93.svg)](https://github.com/websockets/ws)

An interactive, dual-screen gameshow application combining **Family Wibu 100** (Family Feud style top-10 list guessing) and **Quiz Wibu** (Who Wants to Be a Millionaire style 4-option trivia) with cyberpunk Japanese arcade aesthetics. Built with **React 19**, **Tailwind CSS v4**, **Node.js Express**, and **WebSockets** for seamless real-time synchronization between the stage display (TV/Projector/OBS) and the host controller.

---

## ✨ Key Features

### 1. Multi-Round Gameshow System
- **Ronde 1: Quiz Wibu (Millionaire Style):**
  - Multiple-choice trivia served 1 question at a time with 4 options (A, B, C, D).
  - Pre-loaded with 120 curated anime trivia questions across 4 categories (*Anime Populer*, *Shounen Pillars & Classics*, *Anime Umum*, *Budaya Wibu & Istilah Otaku*).
  - Dynamic option states: Idle, Contestant Selection (amber glow), Final Answer Lock (pulsating golden neon), Revealed Correct (emerald green), and Revealed Wrong (chosen option red + correct option green).
  - Collapsible hint banner with anime clue and hint text.
  - Automatic answer explanation card revealed after answering.
  - Clean player display: No question numbers or indices on the stage board, keeping focus on gameplay.
- **Ronde 2: Family Wibu 100 (Family Feud Style):**
  - Interactive 2x5 game board with smooth 3D flip card animations.
  - Responsive typography auto-scaling for character and anime names.
  - Strike slots (configurable 2 to 5 or disabled) and full-screen dramatic buzzer with camera shake.
  - Clue Roll roulette feature: animated cycling through unrevealed cards before landing on a mystery clue card.
- **Shared Title Screen & Holographic Transitions:**
  - Seamless 2-second holographic wipe transitions across round changes and question transitions.
  - Tempo-locked Title Screen (177 BPM, 4/4) driven directly by the audio clock with zero drift and adjustable audio latency calibration (-200ms to +200ms).

### 2. Host Controller Panel
- **Quick Round Switcher:** Toggle instantly between `[Ronde 1: Quiz Wibu]` and `[Ronde 2: Family Wibu 100]`.
- **Paginated Question Table:**
  - Embedded directly under the search bar in Quiz mode.
  - Configurable page size (5, 10 default, 20, 50, or All).
  - Live search by anime title, question keyword, or answer options.
  - Active question row highlight with one-click `[🎯 Ke Halaman Soal Aktif]` jump.
  - Collapsible toggle to save screen space during live hosting.
- **Host Cheat Sheet & Live Controls:**
  - Instant `[BENAR]` badges on correct options for host guidance.
  - Action buttons: Toggle Hint, Lock Answer, Reveal Answer, and Reset Question.
  - Full Family 100 card controls, strike steppers, quick buzzer, and visual databank editor.

### 3. Persistent Configuration System
- Server automatically saves and restores state via `quiz-config.json`:
  - Active game mode (`quiz` or `family`).
  - Active question ID (Quiz Wibu) and category ID (Family Wibu 100).
  - Volume levels, BGM toggle, strike slot settings, theme mode, custom audio, and custom title logos.
- Server reboots or restarts restore the exact session state without data loss.

### 4. Broadcast-Grade Audio & Smart BGM
- Option selection click (`click-short.wav`).
- Final answer lock effect (`spacebar.mp3`).
- Correct answer reveal chime (`correct.mp3`).
- Wrong answer buzzer overlay (`buzzer.mp3`).
- Background music (`bgm.mp3`) with automatic ducking (100% on Title Screen, 50% during gameplay).
- Intro theme music (`intro.mp3`) and applause (`applause.wav`) with fade-out.
- Holographic wipe transition sounds (`woosh.mp3` / `swoosh.mp3`).

### 5. OBS Studio & Videotron Ready
- Support for transparent canvas mode (`?transparent=true` or theme settings) for camera overlays.
- Compatible with LED videotrons (e.g. 1620x1080 3:2 or custom aspect ratios) using OBS Browser Source.

---

## 🚀 Quick Start (Portable Release)

Download the latest pre-built portable package from the [Releases](https://github.com/GarionAdiwilaga/guessthelist-quiz/releases) tab.

### Windows
1. Extract the downloaded `guessthelist-quiz-v1.0.0-portable.zip` archive.
2. Double-click `start.bat`.
3. Open your browser:
   - **Main Display (Proyektor / OBS):** [http://localhost:3001/](http://localhost:3001/)
   - **Host Controller (Operator):** [http://localhost:3001/control](http://localhost:3001/control)

### Linux & macOS
1. Extract the archive and enter the folder:
   ```bash
   tar -xzf guessthelist-quiz-v1.0.0-portable.tar.gz
   cd guessthelist-quiz
   ```
2. Run the start script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
3. Open [http://localhost:3001/](http://localhost:3001/) on your display and [http://localhost:3001/control](http://localhost:3001/control) on the controller.

> **Requirement:** Only [Node.js](https://nodejs.org/) (v18 or higher) is required on the host computer.

---

## 🛠️ Development & Building from Source

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/GarionAdiwilaga/guessthelist-quiz.git
cd guessthelist-quiz

# Install dependencies
npm install

# Start development mode (Vite HMR)
npm run dev

# Run full test suite (11 automated test suites)
npm test

# Build production bundle
npm run build

# Start production server
npm start

# Build portable release packages (.zip and .tar.gz)
npm run build:release
```

---

## 📂 Project Structure

```text
├── anime-quiz-database-v4.json                     # Millionaire quiz databank (120 questions with hints)
├── anime-quiz-database-v4.default.json             # Default backup for Millionaire quiz
├── anime-family-database-ranked-top10.json         # Family 100 active databank file
├── anime-family-database-ranked-top10.default.json # Backup default Family 100 databank
├── package.json                                    # Project metadata and scripts
├── scripts/
│   └── build-release.mjs                           # Automated portable release bundler
├── public/
│   ├── audio/                                      # SFX and BGM audio assets
│   │   ├── applause.wav
│   │   ├── bgm.mp3
│   │   ├── buzzer.mp3
│   │   ├── click-short.wav
│   │   ├── correct.mp3
│   │   ├── intro.mp3
│   │   ├── spacebar.mp3
│   │   ├── swoosh.mp3
│   │   └── woosh.mp3
│   └── logo.png
├── server/
│   └── index.js                                    # Express & WebSocket authoritative server
├── src/
│   ├── components/
│   │   ├── Controller/                             # Host Controller components
│   │   │   ├── AnswerCard.tsx
│   │   │   ├── AnswerRoster.tsx
│   │   │   ├── BoardControls.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── ControllerView.tsx
│   │   │   ├── DataEditorModal.tsx
│   │   │   ├── MillionaireController.tsx           # Millionaire panel with paginated table
│   │   │   ├── SettingsModal.tsx
│   │   │   └── StrikeControls.tsx
│   │   └── MainDisplay/                            # Main Stage Display components
│   │       ├── BuzzerOverlay.tsx
│   │       ├── CluePopupModal.tsx
│   │       ├── FlipCard.tsx
│   │       ├── GameBoard.tsx
│   │       ├── HeaderBanner.tsx
│   │       ├── MainDisplay.tsx
│   │       ├── MillionaireBoard.tsx                # Millionaire stage display board
│   │       ├── StrikeSlots.tsx
│   │       ├── TitleScreen.tsx
│   │       └── TransitionWipe.tsx
│   ├── services/
│   │   ├── audio.ts                                # Web Audio API & audio element controller
│   │   └── socket.ts                               # WebSocket client manager
│   ├── types/
│   │   └── quiz.ts                                 # Shared TypeScript interfaces & messages
│   └── index.css                                   # Cyberpunk arcade tokens & keyframe styles
└── tests/                                          # 11 automated unit and integration test suites
```

---

## 🎮 Host Controller Controls Guide

| Control | Mode | Description |
|---|---|---|
| **Ronde 1: Quiz Wibu** | Top Header | Switches the live game mode to Millionaire trivia. |
| **Ronde 2: Family Wibu 100** | Top Header | Switches the live game mode to Family 100 top-10 list. |
| **Layar Judul (Pause)** | Top Header | Toggles between live game board and Title Screen. |
| **Tabel Pilihan Soal** | Quiz Wibu | Paginated table to search, filter, and jump to any of the 120 questions. |
| **Prev / Next / Soal Acak** | Quiz Wibu | Question navigators for sequential or random selection. |
| **Pilihan Opsi (A, B, C, D)** | Quiz Wibu | Highlights the contestant's chosen answer. |
| **💡 Tampilkan Petunjuk** | Quiz Wibu | Displays anime clue and hint banner on the stage display. |
| **🔒 Kunci Jawaban** | Quiz Wibu | Locks the contestant's final answer with spacebar audio effect. |
| **🎯 Buka Hasil (Reveal)** | Quiz Wibu | Reveals whether the answer is right or wrong, plays SFX, and shows explanation. |
| **BUZZER (✕)** | Family 100 | Triggers fullscreen wrong buzzer overlay, shakes screen, and increments strike. |
| **🎲 Roll Petunjuk** | Family 100 | Starts roulette cycling on unrevealed cards and opens mystery clue popup. |
| **Buka Semua Jawaban** | Family 100 | Reveals all 10 cards simultaneously with swoosh and chime SFX. |
| **Tutup Semua** | Family 100 | Flips all cards back to question marks. |
| **👏 Tepuk Tangan** | Soundboard | Plays / stops `applause.wav` sound effect with smooth fade. |
| **🎵 Musik Intro** | Soundboard | Plays / stops `intro.mp3` theme music with smooth fade. |
| **📻 Putar / Stop BGM** | Soundboard | Toggles looping background music. |
| **⚙️ Pengaturan** | Header | Configures volume, strike slots, display theme, and custom audio. |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).  
Copyright (c) 2026 Garion Adiwilaga.
