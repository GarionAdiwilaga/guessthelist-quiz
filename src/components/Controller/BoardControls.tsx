import React from 'react';
import { Eye, RotateCcw, Lightbulb, Settings, Tv, Play, Sparkles, Database } from 'lucide-react';

interface BoardControlsProps {
  showClue: boolean;
  showTitleScreen: boolean;
  isCluePopupOpen?: boolean;
  onRevealAll: () => void;
  onHideAll: () => void;
  onToggleClue: () => void;
  onToggleTitleScreen: () => void;
  onRollClue?: () => void;
  onDismissClue?: () => void;
  onOpenDataEditor?: () => void;
  onOpenSettings: () => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  showClue,
  showTitleScreen,
  isCluePopupOpen = false,
  onRevealAll,
  onHideAll,
  onToggleClue,
  onToggleTitleScreen,
  onRollClue,
  onDismissClue,
  onOpenDataEditor,
  onOpenSettings
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0B0F2F] border border-[#1C255A]">
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Title / Game Board Screen */}
        <button
          onClick={onToggleTitleScreen}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border text-xs font-black transition-all cursor-pointer shadow-md ${
            showTitleScreen
              ? 'bg-[#00F0FF] text-[#0A0D26] border-white shadow-[0_0_12px_rgba(0,240,255,0.6)]'
              : 'bg-[#FF2E93] text-white border-[#FF2E93] shadow-[0_0_12px_rgba(255,46,147,0.5)] hover:brightness-110'
          }`}
        >
          {showTitleScreen ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Buka Layar Game (Board)</span>
            </>
          ) : (
            <>
              <Tv className="w-4 h-4" />
              <span>Transisi ke Layar Judul (Pause)</span>
            </>
          )}
        </button>

        {/* Reveal All */}
        <button
          onClick={onRevealAll}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/60 text-xs font-bold text-[#00F0FF] transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Buka Semua Jawaban</span>
        </button>

        {/* Hide All / Reset Board */}
        <button
          onClick={onHideAll}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/50 text-xs font-bold text-red-400 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tutup Semua</span>
        </button>

        {/* Toggle Subtitle / Theme Description */}
        <button
          onClick={onToggleClue}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            showClue
              ? 'bg-[#FFD600]/20 border-[#FFD600] text-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.3)]'
              : 'bg-[#182152] border-[#2A377A] text-gray-300 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{showClue ? 'Sembunyikan Subtitle' : 'Tampilkan Subtitle'}</span>
        </button>

        {/* Roll Clue / Dismiss Clue Button */}
        <button
          onClick={isCluePopupOpen ? onDismissClue : onRollClue}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border text-xs font-black transition-all cursor-pointer shadow-md ${
            isCluePopupOpen
              ? 'bg-[#FF2E93] text-white border-[#FF2E93] shadow-[0_0_12px_rgba(255,46,147,0.6)] animate-pulse'
              : 'bg-[#FFD600]/20 hover:bg-[#FFD600]/30 border-[#FFD600] text-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.3)]'
          }`}
          title={
            isCluePopupOpen
              ? 'Tutup Pop-up Petunjuk di Layar Display'
              : 'Acak & Tampilkan Petunjuk untuk Slot Belum Terbuka'
          }
        >
          <Sparkles className="w-4 h-4" />
          <span>{isCluePopupOpen ? '✕ Tutup Petunjuk' : '🎲 Roll Petunjuk'}</span>
        </button>
      </div>

      {/* Right Controls: Bank Data & Settings */}
      <div className="flex items-center space-x-2 ml-auto">
        {onOpenDataEditor && (
          <button
            onClick={onOpenDataEditor}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/60 text-xs font-bold text-[#00F0FF] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title="Buka Bank Data & Editor Kategori Soal"
          >
            <Database className="w-4 h-4" />
            <span>Bank Data Soal</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#182258] hover:bg-[#202C70] border border-[#2B3980] text-xs font-bold text-gray-200 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#00F0FF]" />
          <span>Pengaturan</span>
        </button>
      </div>
    </div>
  );
};
