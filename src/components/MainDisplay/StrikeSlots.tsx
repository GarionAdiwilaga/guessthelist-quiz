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
    <div className="flex items-center justify-center space-x-3 md:space-x-4 my-4 select-none">
      <div className="flex items-center space-x-3 px-6 py-2.5 rounded-2xl bg-[#0E133A]/90 border border-[#FF2E93]/50 shadow-[0_0_20px_rgba(255,46,147,0.3)]">
        <span className="text-xs md:text-sm font-black text-[#FF2E93] tracking-widest uppercase mr-2 font-['Outfit',sans-serif]">
          STRIKES
        </span>

        {slotsArray.map((slotNum) => {
          const isStruck = slotNum <= currentStrikes;
          return (
            <div
              key={slotNum}
              className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                isStruck
                  ? 'border-[#FF2E93] bg-gradient-to-br from-[#FF2E93]/30 to-[#800A40]/40 shadow-[0_0_15px_rgba(255,46,147,0.8)]'
                  : 'border-[#242E64] bg-[#0A0D26]/60'
              }`}
            >
              {isStruck ? (
                <span className="text-3xl md:text-4xl font-black text-[#FF2E93] drop-shadow-[0_0_12px_rgba(255,46,147,1)] font-['Fredoka',sans-serif] animate-pop-in">
                  ✕
                </span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#242E64]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
