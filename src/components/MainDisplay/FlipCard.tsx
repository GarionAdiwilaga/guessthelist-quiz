import React from 'react';
import { QuizItem } from '../../types/quiz';

interface FlipCardProps {
  item?: QuizItem;
  slotIndex: number;
  isRevealed: boolean;
  isHighlighted?: boolean;
}

export function getAnswerFontSize(text: string): string {
  const len = text.trim().length;
  if (len <= 14) {
    return 'text-base sm:text-lg lg:text-xl';
  } else if (len <= 26) {
    return 'text-sm sm:text-base lg:text-lg';
  } else {
    return 'text-xs sm:text-sm lg:text-base';
  }
}

export const FlipCard: React.FC<FlipCardProps> = ({ item, isRevealed, isHighlighted = false }) => {
  const answerText = item?.answer || '???';
  const fontSizeClass = getAnswerFontSize(answerText);

  return (
    <div
      className={`w-full h-12.5 sm:h-14 lg:h-16 select-none relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
        isHighlighted ? 'scale-[1.03] z-20 ring-4 ring-[#FFD600] shadow-[0_0_30px_rgba(255,214,0,0.9)]' : ''
      }`}
    >
      {/* State 1: Covered / Mystery Slot */}
      <div
        className={`absolute inset-0 w-full h-full rounded-2xl border-2 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
          isRevealed
            ? 'opacity-0 scale-95 pointer-events-none'
            : isHighlighted
            ? 'opacity-100 scale-100 border-[#FFD600] bg-gradient-to-r from-[#251C05] via-[#423108] to-[#251C05]'
            : 'opacity-100 scale-100 border-[#00F0FF]/60 bg-gradient-to-r from-[#111742] via-[#1A235E] to-[#111742] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Subtle horizontal scanline */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,#00F0FF,#00F0FF_1px,transparent_1px,transparent_6px)] pointer-events-none" />

        {/* Left Deco */}
        <div className="flex items-center space-x-1.5 z-10 text-[#00F0FF]/40 text-sm">
          <span>◆</span>
          <div className="w-4 h-0.5 bg-[#00F0FF]/30 rounded-full" />
        </div>

        {/* Center Mystery Mark "?" */}
        <div className="z-10 flex items-center justify-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#090D28]/90 border border-[#00F0FF]/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.35)]">
            <span className="text-2xl sm:text-3xl font-black text-[#FFD600] font-['Fredoka',sans-serif] drop-shadow-[0_0_8px_rgba(255,214,0,0.6)]">
              ?
            </span>
          </div>
        </div>

        {/* Right Deco */}
        <div className="flex items-center space-x-1.5 z-10 text-[#00F0FF]/40 text-sm">
          <div className="w-4 h-0.5 bg-[#00F0FF]/30 rounded-full" />
          <span>◆</span>
        </div>
      </div>

      {/* State 2: Revealed Answer (No left box/star, right-aligned wrapped anime name) */}
      <div
        className={`absolute inset-0 w-full h-full rounded-2xl border-2 transition-all duration-500 flex items-center justify-between px-4 sm:px-6 ${
          isRevealed
            ? 'opacity-100 scale-100 border-[#FFD600] bg-gradient-to-r from-[#171D50] via-[#222A6E] to-[#171D50] shadow-[0_0_20px_rgba(255,214,0,0.35)]'
            : 'opacity-0 scale-105 pointer-events-none'
        }`}
      >
        {/* Left: Answer Text Only (No box or star) */}
        <div className="min-w-0 flex-1 mr-3 flex items-center">
          <span
            className={`font-black text-white tracking-wide font-['Outfit',sans-serif] uppercase line-clamp-2 break-words leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${fontSizeClass}`}
          >
            {answerText}
          </span>
        </div>

        {/* Right: Anime Tag (Wrapped cleanly, right-horizontal, center-vertical) */}
        {item?.anime && (
          <div className="shrink-0 max-w-[45%] flex items-center justify-end">
            <span className="inline-block px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/50 text-right whitespace-normal break-words leading-tight shadow-[0_0_6px_rgba(0,240,255,0.25)]">
              {item.anime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
