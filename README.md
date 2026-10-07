# Guess The List Quiz — Family Wibu 100 🎮

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Realtime_Sync-ff2e93.svg)](https://github.com/websockets/ws)

An interactive, dual-screen list-guessing gameshow application inspired by *Family 100* / *Family Feud* and Japanese arcade aesthetics. Built with **React 19**, **Tailwind CSS v4**, **Node.js Express**, and **WebSockets** for seamless real-time synchronization between the stage display (TV/Projector/OBS) and the host controller.

---

## ✨ Features

- **Dual-Screen Architecture:**
  - **Main Stage Display (`/`):** Fullscreen broadcast view designed for stage projectors, secondary monitors, or OBS Studio browser sources.
  - **Host Controller (`/controller`):** Cheat-sheet view with category switcher, live item search, answer reveal toggles, strike controls, and soundboard.
- **Interactive 2×5 Game Board:**
  - Smooth 3D flip card animations with responsive typography auto-scaling for long character and anime titles.
  - Question mark (`?`) hidden slots for unranked category items.
- **🎲 Roll Clue (Roulette Feature):**
  - Roulette cycle animation highlighting through unrevealed cards before landing on a target card.
  - Pop-up clue modal revealing the clue description without spoiling the character name or anime title.
- **🎵 Tempo-Locked Title Screen (177 BPM, 4/4):**
  - Concentric vector ripple circles and logo heartbeat pulse driven directly by the audio playback clock (`currentTime`).
  - Zero-drift synchronization with adjustable latency calibration slider (-200ms to +200ms) for Bluetooth or audio capture lag.
- **🔊 Soundboard & Smart BGM:**
  - Background music (`bgm.mp3`) with automatic ducking (100% on Title Screen, 50% during gameplay).
  - Intro theme music (`intro.mp3`) and applause (`applause.wav`) with fade-out stop.
  - Dramatic buzzer (`buzzer.mp3`), correct reveal chimes (`correct.mp3`), and holographic wipe transitions (`woosh.mp3` / `swoosh.mp3`).
- **📚 Visual Databank & JSON Editor:**
  - Visual category & item manager to create, edit, reorder, and save categories directly.
  - JSON importer & exporter with real-time schema validation and one-click default restore.
- **🎥 OBS Studio Ready:**
  - Support for native transparent canvas mode (`themeMode: transparent`) to overlay the quiz board directly on live camera feeds or stream overlays.
- **⚡ Local Network Multi-Device Sync:**
  - Authoritative WebSocket server syncing state instantly across all connected laptops, tablets, or phones.

---

## 🚀 Quick Start (Portable Release)

Download the latest pre-built portable package from the [Releases](https://github.com/GarionAdiwilaga/guessthelist-quiz/releases) tab.

### Windows
1. Extract the downloaded `zip` archive.
2. Double-click `start.bat`.
3. Open your browser:
   - **Main Display (Proyektor / OBS):** [http://localhost:3001/](http://localhost:3001/)
   - **Host Controller (Operator):** [http://localhost:3001/controller](http://localhost:3001/controller)

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
3. Open [http://localhost:3001/](http://localhost:3001/) on your display and [http://localhost:3001/controller](http://localhost:3001/controller) on the controller.

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

# Run full test suite (7 automated test suites)
npm test

# Build production bundle
npm run build

# Start production server
npm start
```

The production server starts on port `3001` (or `PORT` environment variable) and serves both the REST API, WebSocket server, and static production bundle.

---

## 📂 Project Structure

```text
├── anime-family-database-ranked-top10.json         # Active databank file
├── anime-family-database-ranked-top10.default.json # Backup default databank
├── package.json                                    # Project metadata and scripts
├── public/
│   ├── audio/                                      # SFX and BGM audio assets
│   │   ├── applause.wav
│   │   ├── bgm.mp3
│   │   ├── buzzer.mp3
│   │   ├── correct.mp3
│   │   ├── intro.mp3
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
│   │   │   ├── SettingsModal.tsx
│   │   │   └── StrikeControls.tsx
│   │   └── MainDisplay/                            # Main Stage Display components
│   │       ├── BuzzerOverlay.tsx
│   │       ├── CluePopupModal.tsx
│   │       ├── FlipCard.tsx
│   │       ├── GameBoard.tsx
│   │       ├── HeaderBanner.tsx
│   │       ├── MainDisplay.tsx
│   │       ├── StrikeSlots.tsx
│   │       ├── TitleScreen.tsx
│   │       └── TransitionWipe.tsx
│   ├── services/
│   │   ├── audio.ts                                # Web Audio API & audio element controller
│   │   └── socket.ts                               # WebSocket client manager
│   ├── types/
│   │   └── quiz.ts                                 # Shared TypeScript interfaces & messages
│   └── index.css                                   # Cyberpunk arcade tokens & keyframe styles
└── tests/                                          # Automated unit and integration test suites
```

---

## 📥 Sample Databank (Contoh Data Kuis)

Repository ini menyertakan dataset contoh lengkap (**Family Wibu 100**) yang siap diunduh dan diimpor:

- **File**: [`samples/anime-family-databank.sample.json`](samples/anime-family-databank.sample.json) atau [`anime-family-database-ranked-top10.json`](anime-family-database-ranked-top10.json)
- **Direct Raw Download**: [Unduh Sample Databank JSON](https://raw.githubusercontent.com/GarionAdiwilaga/guessthelist-quiz/main/samples/anime-family-databank.sample.json)

### Cara Mengimpor ke Aplikasi:
1. Unduh file sample JSON di atas ke komputer Anda.
2. Buka **Host Controller** (`http://localhost:3001/?view=controller`).
3. Klik tombol **"Bank Data"** pada bilah aksi bagian atas.
4. Pilih tab **"Tab JSON"**, klik **"Impor File JSON"**, lalu pilih file JSON yang telah diunduh (atau salin-tempel isi JSON secara langsung).
5. Klik **"Terapkan & Simpan"**. Semua kategori dan jawaban kuis akan langsung aktif dan tersinkronisasi secara real-time ke Layar Utama (Display)!

---

## 🎮 Host Controller Shortcuts & Actions

| Button / Control | Description |
|---|---|
| **BUZZER (✕)** | Triggers fullscreen wrong buzzer overlay, shakes screen, and increments strike. |
| **🎲 Roll Petunjuk** | Starts roulette cycling on unrevealed cards and opens mystery clue popup. |
| **✕ Tutup Petunjuk** | Dismisses the clue pop-up on the main screen. |
| **Buka Semua Jawaban** | Reveals all 10 cards simultaneously with swoosh and chime SFX. |
| **Tutup Semua** | Flips all cards back to question marks. |
| **Layar Judul / Board** | Executes seamless 2-second holographic wipe transition between screens. |
| **👏 Tepuk Tangan** | Plays / stops `applause.wav` sound effect with smooth fade. |
| **🎵 Musik Intro** | Plays / stops `intro.mp3` theme music with smooth fade. |
| **📻 Putar / Stop BGM** | Toggles looping background music. |
| **📚 Bank Data** | Opens visual category/item editor and JSON import/export modal. |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
Copyright (c) 2026 Garion Adiwilaga.
