import React from 'react';
import { Eye, RotateCcw, Lightbulb, Settings, Tv, Play } from 'lucide-react';

interface BoardControlsProps {
  showClue: boolean;
  showTitleScreen: boolean;
  onRevealAll: () => void;
  onHideAll: () => void;
  onToggleClue: () => void;
  onToggleTitleScreen: () => void;
  onOpenSettings: () => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  showClue,
  showTitleScreen,
  onRevealAll,
  onHideAll,
  onToggleClue,
  onToggleTitleScreen,
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
      </div>

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#182258] hover:bg-[#202C70] border border-[#2B3980] text-xs font-bold text-gray-200 transition-all cursor-pointer ml-auto"
      >
        <Settings className="w-4 h-4 text-[#00F0FF]" />
        <span>Pengaturan</span>
      </button>
    </div>
  );
};
