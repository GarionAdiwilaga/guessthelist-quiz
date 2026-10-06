import React from 'react';
import { VolumeX, Plus, Minus, RotateCcw } from 'lucide-react';

interface StrikeControlsProps {
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  currentStrikes: number;
  onSetStrikes: (strikes: number) => void;
  onTriggerQuickBuzzer: () => void;
  onOpenSettings: () => void;
}

export const StrikeControls: React.FC<StrikeControlsProps> = ({
  strikeSlotsEnabled,
  maxStrikeSlots,
  currentStrikes,
  onSetStrikes,
  onTriggerQuickBuzzer,
  onOpenSettings
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl bg-[#0E143C] border border-[#232F6E] gap-4 select-none">
      {/* Quick Buzzer (Instant X Popup) */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onTriggerQuickBuzzer}
          className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#D6005D] text-white font-black text-sm tracking-wide shadow-[0_0_20px_rgba(255,46,147,0.5)] hover:from-[#FF45A1] hover:to-[#E80065] active:scale-95 transition-all cursor-pointer"
        >
          <VolumeX className="w-5 h-5" />
          <span>BUZZER SALAH (✕)</span>
        </button>
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
