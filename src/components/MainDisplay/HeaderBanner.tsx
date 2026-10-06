import React from 'react';
import { QuizCategory } from '../../types/quiz';

interface HeaderBannerProps {
  category?: QuizCategory;
  revealedCount: number;
  totalCount: number;
  showClue: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  category,
  revealedCount,
  totalCount,
  showClue
}) => {
  return (
    <header className="w-full flex flex-col items-center select-none mb-3 sm:mb-4">
      {/* Top Brand Tag */}
      <div className="flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#00F0FF] shadow-[0_0_12px_rgba(255,46,147,0.4)] mb-2">
        <span className="text-[10px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MiniGames • Family Wibu 100
        </span>
      </div>

      {/* Main Header Container */}
      <div className="relative w-full max-w-5xl px-5 py-3 rounded-2xl bg-gradient-to-r from-[#121744] via-[#1B2362] to-[#121744] border-2 border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.3)] flex items-center justify-between gap-4">
        {/* Left / Center: Category Emoji + Title + Subtitle Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {category?.emoji && (
              <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                {category.emoji}
              </span>
            )}
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-wide font-['Outfit',sans-serif] uppercase leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] truncate">
              {category?.category || 'Memuat Kategori...'}
            </h1>
          </div>

          {/* Subtitle: Theme Description / Clue */}
          {showClue && category?.clue && (
            <p className="mt-1 text-xs sm:text-sm text-[#00F0FF]/90 font-medium leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-2">
              {category.clue}
            </p>
          )}
        </div>

        {/* Right: Counter Badge */}
        <div className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#090D28]/90 border border-[#FFD600]/80 shadow-[0_0_10px_rgba(255,214,0,0.3)]">
          <span className="text-xs sm:text-sm font-black text-[#FFD600] font-['Fredoka',sans-serif]">
            {revealedCount} / {totalCount}
          </span>
        </div>
      </div>
    </header>
  );
};
