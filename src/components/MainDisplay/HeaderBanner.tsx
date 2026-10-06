import React from 'react';
import { QuizCategory } from '../../types/quiz';

interface HeaderBannerProps {
  category?: QuizCategory;
  showClue: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  category,
  showClue
}) => {
  return (
    <header className="w-full flex flex-col items-center select-none mb-2 sm:mb-3">
      {/* Top Brand Tag with Sub-brand */}
      <div className="flex items-center space-x-2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#7B00FF] to-[#00F0FF] shadow-[0_0_12px_rgba(255,46,147,0.4)] mb-1.5">
        <span className="text-[10px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MiniGames • Family Wibu 100 • Plaza Cosplay Day
        </span>
      </div>

      {/* Main Header Container (Full Title, No Truncation, No Counter Pill) */}
      <div className="relative w-full max-w-4xl px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#121744] via-[#1B2362] to-[#121744] border-2 border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)] flex flex-col items-center text-center">
        {/* Category Emoji + Full Title */}
        <div className="flex items-center justify-center space-x-3 w-full">
          {category?.emoji && (
            <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
              {category.emoji}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide font-['Outfit',sans-serif] uppercase leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] whitespace-normal">
            {category?.category || 'Memuat Kategori...'}
          </h1>
        </div>

        {/* Subtitle: Theme Description */}
        {showClue && category?.clue && (
          <p className="mt-1.5 text-xs sm:text-sm text-[#00F0FF]/95 font-medium leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] max-w-4xl">
            {category.clue}
          </p>
        )}
      </div>
    </header>
  );
};
