import React from 'react';
import { QuizItem } from '../../types/quiz';

interface FlipCardProps {
  item?: QuizItem;
  slotNumber: number;
  isRevealed: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({ item, slotNumber, isRevealed }) => {
  const displayRank = item ? item.rank : slotNumber;
  const formattedSlot = String(slotNumber).padStart(2, '0');

  return (
    <div className="w-full h-20 md:h-24 perspective-1000 select-none">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isRevealed ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT: Covered Slot */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border-2 border-[#00F0FF]/60 bg-gradient-to-b from-[#161D4C] to-[#0D1236] shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center justify-between px-6 transition-all duration-300">
          {/* Subtle mechanical horizontal lines */}
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,#00F0FF,#00F0FF_2px,transparent_2px,transparent_10px)] pointer-events-none" />

          {/* Left indicator icon */}
          <div className="flex items-center space-x-2 z-10">
            <span className="text-xl md:text-2xl text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">★</span>
            <div className="h-6 w-1 bg-[#00F0FF]/40 rounded-full" />
          </div>

          {/* Center Slot Number */}
          <div className="z-10 flex items-center justify-center">
            <div className="px-5 py-1.5 rounded-lg bg-[#0A0D26]/80 border border-[#00F0FF]/40 shadow-inner">
              <span className="text-3xl md:text-4xl font-extrabold text-[#FFD600] tracking-wider drop-shadow-[0_2px_10px_rgba(255,214,0,0.5)] font-['Fredoka',sans-serif]">
                {formattedSlot}
              </span>
            </div>
          </div>

          {/* Right indicator icon */}
          <div className="flex items-center space-x-2 z-10">
            <div className="h-6 w-1 bg-[#00F0FF]/40 rounded-full" />
            <span className="text-xl md:text-2xl text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">★</span>
          </div>
        </div>

        {/* BACK: Revealed Answer */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border-2 border-[#FFD600] bg-gradient-to-r from-[#1A1F52] via-[#242A68] to-[#1A1F52] shadow-[0_8px_25px_rgba(255,214,0,0.3)] flex items-center justify-between px-4 md:px-6">
          {/* Rank Badge */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg bg-gradient-to-br from-[#FFD600] to-[#FFAA00] flex items-center justify-center shadow-[0_0_12px_rgba(255,214,0,0.6)] border border-white/50">
              <span className="text-xl md:text-2xl font-black text-[#0A0D26] font-['Fredoka',sans-serif]">
                {displayRank}
              </span>
            </div>

            {/* Answer Title */}
            <div className="truncate">
              <span className="text-xl md:text-2xl font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-['Outfit',sans-serif] uppercase block truncate">
                {item?.answer || '???'}
              </span>
            </div>
          </div>

          {/* Anime Tag / Subtitle */}
          {item?.anime && (
            <div className="ml-2 shrink-0 max-w-[40%]">
              <span className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/60 truncate shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                {item.anime}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
