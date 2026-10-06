import React from 'react';
import { QuizItem } from '../../types/quiz';
import { Eye, EyeOff } from 'lucide-react';

interface AnswerCardProps {
  item: QuizItem;
  index: number;
  isRevealed: boolean;
  isHighlighted: boolean;
  onToggleReveal: (id: number) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  item,
  index,
  isRevealed,
  isHighlighted,
  onToggleReveal
}) => {
  return (
    <div
      className={`relative rounded-xl p-3 md:p-3.5 border transition-all duration-200 flex flex-col justify-between ${
        isHighlighted
          ? 'border-[#FFD600] bg-[#2E2814] shadow-[0_0_18px_rgba(255,214,0,0.45)] ring-2 ring-[#FFD600]/80'
          : isRevealed
          ? 'border-[#00F0FF]/80 bg-[#101F42] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
          : 'border-[#1E2656] bg-[#0E1336]/90 hover:border-[#2C387A]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Star / Question badge */}
        <div className="flex items-start space-x-3 min-w-0">
          <div
            className={`w-8 h-8 md:w-9 md:h-9 rounded-lg shrink-0 flex items-center justify-center font-black font-['Fredoka',sans-serif] text-sm md:text-base border ${
              isRevealed
                ? 'bg-[#00F0FF] text-[#0A0D26] border-white/60 shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                : 'bg-[#1C2554] text-[#FFD600] border-[#2B3878]'
            }`}
          >
            {isRevealed ? '★' : '?'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm md:text-base font-bold text-white tracking-wide font-['Outfit',sans-serif]">
                {item.answer}
              </span>
              {item.anime && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-medium">
                  {item.anime}
                </span>
              )}
            </div>

            {/* Aliases */}
            {item.aliases && item.aliases.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.aliases.map((alias, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-gray-300 border border-gray-700 font-mono"
                  >
                    alias: {alias}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Reveal / Hide Toggle Button */}
        <button
          onClick={() => onToggleReveal(item.id)}
          className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-md ${
            isRevealed
              ? 'bg-[#FF2E93] hover:bg-[#D91B74] text-white shadow-[0_0_10px_rgba(255,46,147,0.4)]'
              : 'bg-[#00F0FF] hover:bg-[#00C4D4] text-[#0A0D26] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
          }`}
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>HIDE</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>REVEAL</span>
            </>
          )}
        </button>
      </div>

      {/* Trivia / Context Snippet */}
      {item.reason && (
        <p className="mt-2 text-[11px] text-gray-400 line-clamp-2 italic bg-black/20 p-1.5 rounded border border-white/5">
          💬 {item.reason}
        </p>
      )}
    </div>
  );
};
