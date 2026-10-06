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
    <header className="w-full flex flex-col items-center mb-6 select-none">
      {/* Top Brand Pill */}
      <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#00F0FF] shadow-[0_0_15px_rgba(255,46,147,0.5)] mb-3">
        <span className="text-xs md:text-sm font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MiniGames • Family Wibu 100
        </span>
      </div>

      {/* Main Category Banner Box */}
      <div className="relative w-full max-w-5xl px-6 py-4 rounded-2xl bg-gradient-to-r from-[#141A4B] via-[#1E2669] to-[#141A4B] border-2 border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.35)] flex items-center justify-between">
        {/* Left Glow Ornament */}
        <div className="hidden sm:flex items-center space-x-1 text-[#FFD600] text-xl drop-shadow-[0_0_8px_rgba(255,214,0,0.8)]">
          <span>✦</span>
          <span>✦</span>
        </div>

        {/* Center: Emoji & Title */}
        <div className="flex-1 text-center px-4">
          <div className="flex items-center justify-center space-x-3">
            {category?.emoji && (
              <span className="text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {category.emoji}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide font-['Outfit',sans-serif] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase">
              {category?.category || 'Memuat Kategori...'}
            </h1>
          </div>
        </div>

        {/* Right: Score/Progress Chip */}
        <div className="shrink-0 px-4 py-1.5 rounded-xl bg-[#0A0D26]/80 border border-[#FFD600]/80 shadow-[0_0_12px_rgba(255,214,0,0.4)]">
          <span className="text-sm md:text-base font-black text-[#FFD600] font-['Fredoka',sans-serif]">
            {revealedCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Optional Clue Banner */}
      {showClue && category?.clue && (
        <div className="w-full max-w-4xl mt-3 px-6 py-2.5 rounded-xl bg-[#FF2E93]/15 border border-[#FF2E93]/60 shadow-[0_0_20px_rgba(255,46,147,0.3)] animate-pop-in">
          <p className="text-center text-sm md:text-base font-medium text-[#FFE6F2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <span className="font-bold text-[#FF2E93] mr-2">💡 CLUE:</span>
            {category.clue}
          </p>
        </div>
      )}
    </header>
  );
};
