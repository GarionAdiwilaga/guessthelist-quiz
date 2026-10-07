import React, { useEffect } from 'react';
import { QuizItem, QuizCategory } from '../../types/quiz';
import { Sparkles, HelpCircle } from 'lucide-react';

interface CluePopupModalProps {
  isOpen: boolean;
  item?: QuizItem;
  slotIndex?: number;
  category?: QuizCategory;
  onClose?: () => void;
}

export const CluePopupModal: React.FC<CluePopupModalProps> = ({
  isOpen,
  item,
  slotIndex,
  category,
  onClose
}) => {
  // Close with Escape key if display keyboard is used
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#131A4D] via-[#101642] to-[#0A0D28] border-2 border-[#00F0FF] shadow-[0_0_35px_rgba(0,240,255,0.4)] overflow-hidden animate-pop-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clue-modal-title"
      >
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FF2E93]/20 via-[#00F0FF]/20 to-[#FFD600]/20 border-b border-[#00F0FF]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <Sparkles className="w-4 h-4 text-[#FFD600]" />
            </div>
            <div>
              <h2
                id="clue-modal-title"
                className="text-sm sm:text-base font-black text-white tracking-wider uppercase font-['Outfit',sans-serif]"
              >
                PETUNJUK JAWABAN KUIS
              </h2>
              {slotIndex !== undefined && (
                <span className="text-[11px] font-bold text-[#00F0FF]">
                  Misteri Slot #{slotIndex + 1}
                </span>
              )}
            </div>
          </div>

          {category && (
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shrink-0 max-w-[200px] truncate">
              {category.emoji ? `${category.emoji} ` : ''}{category.category}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Clue Text Box */}
          <div className="p-5 rounded-2xl bg-[#090D26]/90 border border-[#00F0FF]/50 shadow-[inset_0_0_20px_rgba(0,240,255,0.15)] relative">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-6 h-6 text-[#FFD600] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-['Outfit',sans-serif]">
                  "{item.reason || 'Karakter atau jawaban ini merupakan salah satu pilihan utama dalam kategori ini.'}"
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-medium">
            Tebak jawaban apa yang berada di slot ini berdasarkan petunjuk di atas!
          </p>
        </div>
      </div>
    </div>
  );
};
