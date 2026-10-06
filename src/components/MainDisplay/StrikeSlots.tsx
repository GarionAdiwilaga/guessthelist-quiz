import React, { useEffect, useState } from 'react';

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
  const [prevStrikes, setPrevStrikes] = useState(currentStrikes);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (currentStrikes === 0 && prevStrikes > 0) {
      // Trigger reset dissolve animation
      setIsResetting(true);
      const timer = setTimeout(() => {
        setIsResetting(false);
      }, 500);
      setPrevStrikes(0);
      return () => clearTimeout(timer);
    }
    setPrevStrikes(currentStrikes);
  }, [currentStrikes, prevStrikes]);

  if (!enabled) return null;

  const totalSlots = Math.max(2, Math.min(maxSlots, 5));
  const slotsArray = Array.from({ length: totalSlots }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-1.5 sm:mt-2 mb-0.5 select-none">
      <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-[#0C1032]/90 border border-[#FF2E93]/60 shadow-[0_0_12px_rgba(255,46,147,0.3)]">
        {slotsArray.map((slotNum) => {
          const isStruck = slotNum <= currentStrikes;
          return (
            <div
              key={slotNum}
              className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-400 ${
                isStruck
                  ? 'border-[#FF2E93] bg-[#FF2E93]/25 shadow-[0_0_10px_rgba(255,46,147,0.85)] scale-100'
                  : isResetting
                  ? 'border-[#202958] bg-[#090D28]/60 opacity-40 transition-opacity duration-500'
                  : 'border-[#202958] bg-[#090D28]/60'
              }`}
            >
              {isStruck ? (
                <span className="text-lg sm:text-xl font-black text-[#FF2E93] drop-shadow-[0_0_8px_rgba(255,46,147,1)] font-['Fredoka',sans-serif] animate-pop-in">
                  ✕
                </span>
              ) : (
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-[#202958] transition-all duration-300 ${
                    isResetting ? 'scale-0' : 'scale-100'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
