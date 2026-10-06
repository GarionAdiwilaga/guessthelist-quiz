import React from 'react';

interface StrikeSlotsProps {
  enabled: boolean;
  maxSlots: number;
  currentStrikes: number;
}

export const StrikeSlots: React.FC<StrikeSlotsProps> = ({
  enabled,
  maxSlots,
  currentStrikes
}) => {
  if (!enabled) return null;

  const totalSlots = Math.max(2, Math.min(maxSlots, 5));
  const slotsArray = Array.from({ length: totalSlots }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-3 mt-2 sm:mt-3 mb-1 select-none">
      <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-xl bg-[#0C1032]/90 border border-[#FF2E93]/60 shadow-[0_0_15px_rgba(255,46,147,0.3)]">
        <span className="text-[11px] sm:text-xs font-black text-[#FF2E93] tracking-widest uppercase mr-1 font-['Outfit',sans-serif]">
          STRIKES
        </span>

        {slotsArray.map((slotNum) => {
          const isStruck = slotNum <= currentStrikes;
          return (
            <div
              key={slotNum}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${
                isStruck
                  ? 'border-[#FF2E93] bg-[#FF2E93]/25 shadow-[0_0_10px_rgba(255,46,147,0.8)]'
                  : 'border-[#202958] bg-[#090D28]/60'
              }`}
            >
              {isStruck ? (
                <span className="text-xl sm:text-2xl font-black text-[#FF2E93] drop-shadow-[0_0_8px_rgba(255,46,147,1)] font-['Fredoka',sans-serif] animate-pop-in">
                  ✕
                </span>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#202958]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
