import React from 'react';
import { VolumeX, Plus, Minus, RotateCcw } from 'lucide-react';

interface StrikeControlsProps {
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  currentStrikes: number;
  onSetStrikes: (strikes: number) => void;
  onTriggerQuickBuzzer: () => void;
  onOpenSettings: () => void;
  onPlaySound?: (sound: 'applause' | 'stop_applause' | 'intro' | 'stop_music') => void;
  isIntroPlaying?: boolean;
  isApplausePlaying?: boolean;
  bgmPlaying?: boolean;
  bgmVolume?: number;
  onToggleBgm?: () => void;
  onSetBgmVolume?: (volume: number) => void;
}

export const StrikeControls: React.FC<StrikeControlsProps> = ({
  strikeSlotsEnabled,
  maxStrikeSlots,
  currentStrikes,
  onSetStrikes,
  onTriggerQuickBuzzer,
  onOpenSettings,
  onPlaySound,
  isIntroPlaying = false,
  isApplausePlaying = false,
  bgmPlaying = true,
  bgmVolume = 0.8,
  onToggleBgm,
  onSetBgmVolume
}) => {
  const handleAddStrike = () => {
    if (currentStrikes < maxStrikeSlots) {
      onSetStrikes(currentStrikes + 1);
    }
  };

  const handleReduceStrike = () => {
    if (currentStrikes > 0) {
      onSetStrikes(currentStrikes - 1);
    }
  };

  const handleResetStrikes = () => {
    onSetStrikes(0);
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#0E143C] border border-[#232F6E] gap-3.5 select-none">
      {/* Left: Buzzer + Soundboard Triggers */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Quick Buzzer (Instant X Popup) */}
        <button
          onClick={onTriggerQuickBuzzer}
          className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#D6005D] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_0_16px_rgba(255,46,147,0.5)] hover:from-[#FF45A1] hover:to-[#E80065] active:scale-95 transition-all cursor-pointer"
        >
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>BUZZER (✕)</span>
        </button>

        {/* Soundboard Button: Clap (applause.wav) */}
        <button
          onClick={() => {
            if (onPlaySound) {
              onPlaySound(isApplausePlaying ? 'stop_applause' : 'applause');
            }
          }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
            isApplausePlaying
              ? 'bg-[#FF2E93] text-white border-[#FF2E93] animate-pulse shadow-[0_0_12px_rgba(255,46,147,0.7)]'
              : 'bg-[#1C2555] hover:bg-[#2A377D] text-yellow-300 border-[#304192]'
          }`}
          title={isApplausePlaying ? 'Hentikan Tepuk Tangan' : 'Putar Efek Tepuk Tangan (applause.wav)'}
        >
          <span className="text-base leading-none">👏</span>
          <span>{isApplausePlaying ? 'Stop Tepuk Tangan' : 'Tepuk Tangan'}</span>
        </button>

        {/* Soundboard Button: Intro Music (intro.mp3 toggle) */}
        <button
          onClick={() => {
            if (onPlaySound) {
              onPlaySound(isIntroPlaying ? 'stop_music' : 'intro');
            }
          }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
            isIntroPlaying
              ? 'bg-[#FF2E93] text-white border-[#FF2E93] animate-pulse shadow-[0_0_12px_rgba(255,46,147,0.7)]'
              : 'bg-[#1C2555] hover:bg-[#2A377D] text-[#00F0FF] border-[#304192]'
          }`}
          title={isIntroPlaying ? 'Hentikan Musik Intro' : 'Putar Musik Intro (intro.mp3)'}
        >
          <span className="text-base leading-none">🎵</span>
          <span>{isIntroPlaying ? 'Stop Musik' : 'Musik Intro'}</span>
        </button>

        {/* Soundboard Button: BGM Loop Toggle */}
        <button
          onClick={onToggleBgm}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
            bgmPlaying
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:bg-[#00F0FF]/30'
              : 'bg-[#1C2555] hover:bg-[#2A377D] text-gray-400 border-[#304192]'
          }`}
          title={bgmPlaying ? 'Hentikan BGM Loop (bgm.mp3)' : 'Putar BGM Loop (bgm.mp3)'}
        >
          <span className="text-base leading-none">📻</span>
          <span>{bgmPlaying ? 'Stop BGM' : 'Putar BGM'}</span>
        </button>

        {/* Quick BGM Volume Slider Control */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#141B4A] border border-[#2B3980] text-xs">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
            BGM:
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => onSetBgmVolume && onSetBgmVolume(parseFloat(e.target.value))}
            className="w-14 sm:w-18 accent-[#00F0FF] cursor-pointer h-1.5"
            title={`Volume BGM: ${Math.round(bgmVolume * 100)}% (100% Layar Judul, 50% Layar Game)`}
          />
          <span className="text-[11px] font-mono font-black text-[#00F0FF] min-w-[28px] text-right">
            {Math.round(bgmVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Strike Slot Adjustment Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {strikeSlotsEnabled ? (
          <>
            <div className="flex items-center space-x-2 mr-2">
              <span className="text-xs font-bold text-gray-400 uppercase">
                Strikes:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-[#FF2E93]/60 text-sm font-black text-[#FF2E93]">
                {currentStrikes} / {maxStrikeSlots}
              </span>
            </div>

            <button
              onClick={handleAddStrike}
              disabled={currentStrikes >= maxStrikeSlots}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#212C63] hover:bg-[#2B3980] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer"
              title="Tambah 1 Strike"
            >
              <Plus className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>+ Strike</span>
            </button>

            <button
              onClick={handleReduceStrike}
              disabled={currentStrikes <= 0}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#212C63] hover:bg-[#2B3980] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer"
              title="Kurangi 1 Strike"
            >
              <Minus className="w-3.5 h-3.5 text-[#FFD600]" />
              <span>- Strike</span>
            </button>

            <button
              onClick={handleResetStrikes}
              disabled={currentStrikes <= 0}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-gray-300 transition-all cursor-pointer"
              title="Reset Strikes ke 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Slot strike dinonaktifkan</span>
            <button
              onClick={onOpenSettings}
              className="text-[#00F0FF] underline hover:text-white cursor-pointer font-semibold"
            >
              (Aktifkan di Pengaturan)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
