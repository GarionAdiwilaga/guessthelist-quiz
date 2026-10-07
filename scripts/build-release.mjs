import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.resolve(rootDir, 'release');
const targetDir = path.resolve(releaseDir, 'guessthelist-quiz');

console.log('🚀 Building production frontend bundle (Vite)...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

console.log('📦 Preparing release directory...');
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📂 Copying runtime files to release...');
copyDirSync(path.join(rootDir, 'dist'), path.join(targetDir, 'dist'));
copyDirSync(path.join(rootDir, 'server'), path.join(targetDir, 'server'));

if (fs.existsSync(path.join(rootDir, 'public/audio'))) {
  copyDirSync(path.join(rootDir, 'public/audio'), path.join(targetDir, 'public/audio'));
}
if (fs.existsSync(path.join(rootDir, 'public/logo.png'))) {
  fs.copyFileSync(path.join(rootDir, 'public/logo.png'), path.join(targetDir, 'public/logo.png'));
}

// Clean default starter databank for portable release (sample database is kept in GitHub repo)
const cleanStarterDb = {
  quizType: 'top10_list',
  title: 'Guess The List Quiz',
  language: 'id',
  instructions: 'Tebak semua item yang masuk ke dalam daftar ini.',
  categories: [
    {
      id: 1,
      category: 'Daftar Contoh (Silakan Ubah di Bank Data)',
      emoji: '🎯',
      clue: 'Ini adalah daftar contoh bawaan. Buka Bank Data di Host Controller untuk mengimpor sample data dari repo GitHub atau menambah soal Anda sendiri.',
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

fs.writeFileSync(
  path.join(targetDir, 'anime-family-database-ranked-top10.json'),
  JSON.stringify(cleanStarterDb, null, 2),
  'utf8'
);
fs.writeFileSync(
  path.join(targetDir, 'anime-family-database-ranked-top10.default.json'),
  JSON.stringify(cleanStarterDb, null, 2),
  'utf8'
);

if (fs.existsSync(path.join(rootDir, 'LICENSE'))) {
  fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(targetDir, 'LICENSE'));
}

// Minimal Production package.json
const prodPkg = {
  name: 'guessthelist-quiz',
  version: '1.0.0',
  private: true,
  type: 'module',
  description: 'Guess The List Quiz - Standalone Portable Server',
  scripts: {
    start: 'node server/index.js'
  },
  dependencies: {
    express: '^4.21.2',
    ws: '^8.18.1'
  }
};
fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify(prodPkg, null, 2),
  'utf8'
);

// Windows 1-Click Launcher (start.bat)
const startBat = `@echo off
title Guess The List Quiz - Server
echo ===================================================
echo   Guess The List Quiz - Family Wibu 100
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di komputer ini.
    echo Silakan unduh dan pasang Node.js (v18 ke atas) dari:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install dependencies if missing
if not exist "node_modules" (
    echo [INFO] Menginstal dependensi awal server...
    call npm install --omit=dev
)

echo [INFO] Memulai server kuis di port 3001...
echo Display Screen (Proyektor/OBS) : http://localhost:3001/
echo Host Controller (Operator)     : http://localhost:3001/controller
echo.
echo Tekan Ctrl+C untuk menghentikan server.
echo.

node server/index.js
pause
`;
fs.writeFileSync(path.join(targetDir, 'start.bat'), startBat, 'utf8');

// Linux / macOS 1-Click Launcher (start.sh)
const startSh = `#!/bin/bash
set -e
echo "==================================================="
echo "  Guess The List Quiz - Family Wibu 100"
echo "==================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing server dependencies..."
    npm install --omit=dev
fi

echo "[INFO] Starting quiz server on port 3001..."
echo "Display Screen (Stage/OBS) : http://localhost:3001/"
echo "Host Controller (Operator) : http://localhost:3001/controller"
echo ""
echo "Press Ctrl+C to stop."
echo ""

node server/index.js
`;
fs.writeFileSync(path.join(targetDir, 'start.sh'), startSh, { encoding: 'utf8', mode: 0o755 });

// README.txt for quick user reference
const readmeTxt = `===================================================
 GUESS THE LIST QUIZ - PORTABLE RELEASE v1.0.0
===================================================

Prerequisite:
- Node.js (v18 or higher) installed on your system.
  Download from: https://nodejs.org/

Cara Menjalankan:
-----------------
[WINDOWS]
1. Dobel klik "start.bat".
2. Buka browser:
   - Layar Utama (Stage / TV / OBS): http://localhost:3001/
   - Layar Pengendali (Host Controller): http://localhost:3001/controller

[LINUX / macOS]
1. Buka terminal di folder ini.
2. Jalankan:
   ./start.sh
3. Buka browser pada alamat di atas.

Penggunaan Multi-Device (Jaringan Lokal / Wi-Fi):
-------------------------------------------------
Laptop controller dan laptop display dapat terhubung secara bersamaan:
Cari alamat IP lokal komputer server (misal 192.168.1.10), lalu buka:
- Display   : http://192.168.1.10:3001/
- Controller: http://192.168.1.10:3001/controller

Semua perubahan data dan klik jawaban akan tersinkronisasi secara instan melalui WebSocket.

Mengimpor Data Sampel (Sample Databank):
----------------------------------------
Rilis portabel ini menyertakan bank data contoh bawaan yang bersih.
Untuk mengunduh dataset contoh lengkap (Anime / Family Wibu 100):
1. Unduh file sample databank JSON dari repositori resmi:
   https://github.com/GarionAdiwilaga/guessthelist-quiz
2. Di Host Controller (http://localhost:3001/controller), klik tombol "Bank Data".
3. Pilih "Tab JSON" -> klik "Impor File JSON" dan pilih file yang diunduh.
4. Klik "Terapkan & Simpan" untuk langsung memainkan kuis dengan data tersebut.
`;
fs.writeFileSync(path.join(targetDir, 'README.txt'), readmeTxt, 'utf8');

console.log('📦 Installing lightweight production dependencies in release...');
execSync('npm install --omit=dev', { cwd: targetDir, stdio: 'inherit' });

console.log('🗜️ Creating archives...');
execSync(`cd "${releaseDir}" && zip -r -9 guessthelist-quiz-v1.0.0-portable.zip guessthelist-quiz`, { stdio: 'inherit' });
execSync(`cd "${releaseDir}" && tar -czf guessthelist-quiz-v1.0.0-portable.tar.gz guessthelist-quiz`, { stdio: 'inherit' });

const zipStats = fs.statSync(path.join(releaseDir, 'guessthelist-quiz-v1.0.0-portable.zip'));
const tarStats = fs.statSync(path.join(releaseDir, 'guessthelist-quiz-v1.0.0-portable.tar.gz'));

console.log(`\n✅ Release build completed!`);
console.log(`📁 Portable Folder : ${targetDir}`);
console.log(`📦 ZIP Archive     : ${path.join(releaseDir, 'guessthelist-quiz-v1.0.0-portable.zip')} (${(zipStats.size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`📦 TAR.GZ Archive  : ${path.join(releaseDir, 'guessthelist-quiz-v1.0.0-portable.tar.gz')} (${(tarStats.size / 1024 / 1024).toFixed(2)} MB)`);
