import React from 'react';
import { MillionaireQuestion, MillionaireState } from '../../types/quiz';
import { Lightbulb, Sparkles, Lock, CheckCircle2, XCircle } from 'lucide-react';

export type OptionVisualState =
  | 'idle'
  | 'highlighted'
  | 'locked'
  | 'revealed-correct'
  | 'revealed-wrong'
  | 'revealed-idle';

export interface OptionStateParams {
  optionIndex: number;
  selectedOptionIndex: number | null;
  isLocked: boolean;
  isRevealed: boolean;
  correctOptionIndex: number;
}

export function getCorrectOptionIndex(question?: MillionaireQuestion | null): number {
  if (!question || !Array.isArray(question.options)) return -1;
  const matchIdx = question.options.findIndex((opt) => opt.trim() === question.answer.trim());
  if (matchIdx !== -1) return matchIdx;

  const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const upper = question.answer.trim().toUpperCase();
  if (upper in letterMap) {
    return letterMap[upper];
  }

  return -1;
}

export function getOptionVisualState({
  optionIndex,
  selectedOptionIndex,
  isLocked,
  isRevealed,
  correctOptionIndex
}: OptionStateParams): OptionVisualState {
  if (isRevealed) {
    if (optionIndex === correctOptionIndex) {
      return 'revealed-correct';
    }
    if (selectedOptionIndex === optionIndex) {
      return 'revealed-wrong';
    }
    return 'revealed-idle';
  }

  if (selectedOptionIndex === optionIndex) {
    return isLocked ? 'locked' : 'highlighted';
  }

  return 'idle';
}

export function getOptionClasses(
  state: OptionVisualState,
  isTransparent: boolean = false
): {
  container: string;
  badge: string;
  text: string;
} {
  switch (state) {
    case 'highlighted':
      return {
        container: isTransparent
          ? 'border-[#FF9F0A] ring-2 ring-[#FF9F0A] bg-transparent backdrop-blur-md text-white shadow-[0_0_25px_rgba(255,159,10,0.6)] scale-[1.01]'
          : 'border-[#FF9F0A] ring-2 ring-[#FF9F0A] bg-gradient-to-r from-[#2E1D05] via-[#4D3308] to-[#2E1D05] text-white shadow-[0_0_25px_rgba(255,159,10,0.6)] scale-[1.01]',
        badge: 'bg-[#FF9F0A] text-[#120B02] border border-[#FFD600] font-black shadow-[0_0_12px_rgba(255,159,10,0.8)]',
        text: 'text-[#FFE7A3] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'
      };
    case 'locked':
      return {
        container: isTransparent
          ? 'border-[#FFD600] ring-4 ring-[#FFD600] bg-transparent backdrop-blur-md text-white shadow-[0_0_35px_rgba(255,214,0,0.85)] animate-pulse scale-[1.02]'
          : 'border-[#FFD600] ring-4 ring-[#FFD600] bg-gradient-to-r from-[#3D2C04] via-[#5C4306] to-[#3D2C04] text-white shadow-[0_0_35px_rgba(255,214,0,0.85)] animate-pulse scale-[1.02]',
        badge: 'bg-[#FFD600] text-black border border-white font-black shadow-[0_0_15px_rgba(255,214,0,0.9)]',
        text: 'text-white font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
      };
    case 'revealed-correct':
      return {
        container: isTransparent
          ? 'border-[#00FF88] ring-4 ring-[#00FF88] bg-transparent backdrop-blur-md text-white shadow-[0_0_35px_rgba(0,255,136,0.85)] scale-[1.02]'
          : 'border-[#00FF88] ring-4 ring-[#00FF88] bg-gradient-to-r from-[#033B1E] via-[#085A2E] to-[#033B1E] text-white shadow-[0_0_35px_rgba(0,255,136,0.85)] scale-[1.02]',
        badge: 'bg-[#00FF88] text-black border border-white font-black shadow-[0_0_16px_rgba(0,255,136,0.9)]',
        text: 'text-[#A3FFD2] font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
      };
    case 'revealed-wrong':
      return {
        container: isTransparent
          ? 'border-[#FF2E55] ring-2 ring-[#FF2E55] bg-transparent backdrop-blur-md text-white/90 shadow-[0_0_25px_rgba(255,46,85,0.7)]'
          : 'border-[#FF2E55] ring-2 ring-[#FF2E55] bg-gradient-to-r from-[#3B0713] via-[#5A0C1E] to-[#3B0713] text-white/90 shadow-[0_0_25px_rgba(255,46,85,0.7)]',
        badge: 'bg-[#FF2E55] text-white border border-[#FF2E55] font-black shadow-[0_0_12px_rgba(255,46,85,0.8)]',
        text: 'text-white/80 line-through drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
      };
    case 'revealed-idle':
      return {
        container: isTransparent
          ? 'border-white/10 bg-transparent backdrop-blur-sm text-white/30 opacity-40 shadow-none'
          : 'border-[#00F0FF]/15 bg-[#0C1236]/30 text-white/40 opacity-40 shadow-none',
        badge: 'bg-[#080C26]/60 border border-white/10 text-white/30',
        text: 'text-white/30'
      };
    case 'idle':
    default:
      return {
        container: isTransparent
          ? 'border-[#00F0FF]/40 bg-transparent backdrop-blur-md text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
          : 'border-[#00F0FF]/40 bg-gradient-to-r from-[#0C1236] via-[#141C48] to-[#0C1236] text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
        badge: 'bg-[#080C26] border border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]',
        text: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
      };
  }
}

export function getQuestionFontSize(text: string): string {
  const len = text.trim().length;
  if (len <= 60) {
    return 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl';
  } else if (len <= 110) {
    return 'text-lg sm:text-xl lg:text-2xl xl:text-3xl';
  } else {
    return 'text-base sm:text-lg lg:text-xl xl:text-2xl';
  }
}

export function getOptionFontSize(text: string): string {
  const len = text.trim().length;
  if (len <= 25) {
    return 'text-base sm:text-lg lg:text-xl';
  } else if (len <= 50) {
    return 'text-sm sm:text-base lg:text-lg';
  } else {
    return 'text-xs sm:text-sm lg:text-base';
  }
}

export interface MillionaireBoardProps {
  question?: MillionaireQuestion | null;
  state?: MillionaireState;
  themeMode?: 'stage' | 'transparent';
  isTransparent?: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const MillionaireBoard: React.FC<MillionaireBoardProps> = ({
  question,
  state,
  themeMode,
  isTransparent: isTransparentProp
}) => {
  const isTransparent = isTransparentProp ?? themeMode === 'transparent';
  const correctOptionIndex = getCorrectOptionIndex(question);

  const selectedOptionIndex = state?.selectedOptionIndex ?? null;
  const isLocked = state?.isLocked ?? false;
  const isRevealed = state?.isRevealed ?? false;
  const showHint = state?.showHint ?? false;

  const questionText = question?.question || 'Menunggu soal dari host...';
  const categoryText = (question?.category || 'Quiz Wibu').toUpperCase();
  const options = question?.options || ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'];

  return (
    <div className="h-full w-full flex flex-col justify-between py-3 sm:py-6 lg:py-8 px-4 sm:px-8 lg:px-12 relative z-10 select-none max-w-6xl mx-auto">
      {/* 1. Header Area: Brand Tag and Category Badge */}
      <header className="w-full flex flex-col items-center shrink-0 mb-3 sm:mb-4 lg:mb-5">
        <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#7B00FF] to-[#00F0FF] shadow-[0_0_14px_rgba(255,46,147,0.45)] mb-2.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
            MiniGames • Quiz Wibu • Plaza Cosplay Day
          </span>
        </div>

        {/* Category Pill: Clean display with NO question index or numbers for players */}
        <div
          className={`px-6 sm:px-8 py-2 rounded-full border border-[#00F0FF]/70 shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center ${
            isTransparent
              ? 'bg-transparent backdrop-blur-md'
              : 'bg-gradient-to-r from-[#0E1542] via-[#172266] to-[#0E1542]'
          }`}
        >
          <span className="text-xs sm:text-sm lg:text-base font-black text-[#00F0FF] tracking-widest font-['Outfit',sans-serif] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {categoryText}
          </span>
        </div>
      </header>

      {/* 2. Question Container: Central Stadium Hexagonal Box */}
      <div className="w-full flex flex-col items-center my-auto min-h-0">
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border-2 sm:border-3 border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.35),inset_0_0_18px_rgba(0,240,255,0.15)] flex items-center justify-center text-center transition-all duration-300 min-h-[140px] sm:min-h-[170px] ${
            isTransparent
              ? 'bg-transparent backdrop-blur-md'
              : 'bg-gradient-to-r from-[#0C1236]/95 via-[#151D52]/95 to-[#0C1236]/95'
          }`}
        >
          {/* Subtle horizontal scanline */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-10 bg-[repeating-linear-gradient(0deg,#00F0FF,#00F0FF_1px,transparent_1px,transparent_6px)] pointer-events-none" />

          {/* Left Decorative Wing */}
          <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col items-center space-y-1 text-[#00F0FF]/40 text-xs">
            <span>◆</span>
            <div className="w-1 h-8 bg-[#00F0FF]/30 rounded-full" />
            <span>◆</span>
          </div>

          {/* Question Text */}
          <h2
            className={`font-black text-white tracking-wide font-['Outfit',sans-serif] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] max-w-4xl px-2 sm:px-8 ${getQuestionFontSize(
              questionText
            )}`}
          >
            {questionText}
          </h2>

          {/* Right Decorative Wing */}
          <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col items-center space-y-1 text-[#00F0FF]/40 text-xs">
            <span>◆</span>
            <div className="w-1 h-8 bg-[#00F0FF]/30 rounded-full" />
            <span>◆</span>
          </div>
        </div>

        {/* 3. Hint Banner: Collapsible card when state.showHint is true */}
        {showHint && question?.anime && (
          <div
            className={`w-full max-w-4xl mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#FFD600]/80 shadow-[0_0_20px_rgba(255,214,0,0.3)] animate-pop-in flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 ${
              isTransparent
                ? 'bg-transparent backdrop-blur-md'
                : 'bg-gradient-to-r from-[#201A04] via-[#3B3008] to-[#201A04]'
            }`}
          >
            <div className="flex items-center space-x-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-[#FFD600]/20 flex items-center justify-center text-[#FFD600]">
                <Lightbulb className="w-4 h-4" />
              </span>
              <span className="text-xs sm:text-sm font-black text-[#FFD600] tracking-wider uppercase font-['Outfit',sans-serif]">
                Petunjuk:
              </span>
              <span className="text-xs sm:text-sm font-black text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-[#FFD600]/40">
                {question.anime}
              </span>
            </div>

            {question.hint && (
              <p className="text-xs sm:text-sm text-[#FFE7A3] font-medium italic text-center sm:text-right drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                &ldquo;{question.hint}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* 4. Explanation Card: Shown upon reveal */}
        {isRevealed && question?.explanation && (
          <div
            className={`w-full max-w-4xl mt-3 sm:mt-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-[#00FF88]/70 shadow-[0_0_25px_rgba(0,255,136,0.35)] animate-pop-in flex flex-col items-center text-center ${
              isTransparent
                ? 'bg-transparent backdrop-blur-md'
                : 'bg-gradient-to-r from-[#032616] via-[#083D24] to-[#032616]'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#00FF88]" />
              <span className="text-xs sm:text-sm font-black text-[#00FF88] tracking-widest uppercase font-['Outfit',sans-serif]">
                Penjelasan Jawaban
              </span>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-white font-semibold leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] max-w-3xl">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* 5. 4 Options Grid: 2x2 on Desktop, Stacked on Mobile */}
      <div className="w-full shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full">
          {options.map((optionText, idx) => {
            const visualState = getOptionVisualState({
              optionIndex: idx,
              selectedOptionIndex,
              isLocked,
              isRevealed,
              correctOptionIndex
            });
            const classes = getOptionClasses(visualState, isTransparent);
            const letter = OPTION_LETTERS[idx] || String.fromCharCode(65 + idx);

            return (
              <div
                key={idx}
                className={`w-full h-14 sm:h-16 lg:h-18 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 relative flex items-center px-4 sm:px-6 overflow-hidden ${classes.container}`}
              >
                {/* Subtle horizontal scanline */}
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,#00F0FF,#00F0FF_1px,transparent_1px,transparent_6px)] pointer-events-none" />

                {/* Option Letter Marker (A, B, C, D) */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg flex items-center justify-center font-['Outfit',sans-serif] font-black text-base sm:text-lg mr-3 sm:mr-4 transition-all duration-300 z-10 ${classes.badge}`}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <div className="flex-1 min-w-0 z-10">
                  <span
                    className={`font-['Outfit',sans-serif] tracking-wide leading-tight line-clamp-2 break-words ${
                      classes.text
                    } ${getOptionFontSize(optionText)}`}
                  >
                    {optionText}
                  </span>
                </div>

                {/* State Tag/Badge on Right */}
                <div className="shrink-0 ml-2 z-10 flex items-center">
                  {visualState === 'locked' && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#FFD600] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_8px_rgba(255,214,0,0.8)]">
                      <Lock className="w-3 h-3" />
                      <span>Kunci</span>
                    </div>
                  )}

                  {visualState === 'revealed-correct' && (
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#00FF88] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,136,0.9)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Benar</span>
                    </div>
                  )}

                  {visualState === 'revealed-wrong' && (
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#FF2E55] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,46,85,0.9)]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Salah</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
