import React, { useEffect, useRef, useState } from 'react';
import { QuizState, QuizCategory } from '../../types/quiz';
import { HeaderBanner } from './HeaderBanner';
import { GameBoard } from './GameBoard';
import { StrikeSlots } from './StrikeSlots';
import { BuzzerOverlay } from './BuzzerOverlay';
import { audioService } from '../../services/audio';
import { Volume2 } from 'lucide-react';

interface MainDisplayProps {
  state: QuizState;
  categories: QuizCategory[];
}

export const MainDisplay: React.FC<MainDisplayProps> = ({ state, categories }) => {
  const currentCategory = categories.find((c) => c.id === state.categoryId) || categories[0];
  const items = currentCategory?.items || [];
  const revealedCount = state.revealedItemIds.length;
  const isTransparent = state.themeMode === 'transparent';
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Audio settings sync
  useEffect(() => {
    audioService.updateSettings({
      soundEnabled: state.soundEnabled,
      soundVolume: state.soundVolume,
      customAudio: state.customAudio
    });
  }, [state.soundEnabled, state.soundVolume, state.customAudio]);

  const unlockAudio = () => {
    if (!audioUnlocked) {
      audioService.playCorrectSound();
      setAudioUnlocked(true);
    }
  };

  useEffect(() => {
    const handleGesture = () => {
      setAudioUnlocked(true);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const prevRevealedCountRef = useRef(revealedCount);
  useEffect(() => {
    if (revealedCount > prevRevealedCountRef.current) {
      audioService.playCorrectSound();
    }
    prevRevealedCountRef.current = revealedCount;
  }, [revealedCount]);

  const prevBuzzerTimeRef = useRef(state.quickBuzzerTriggerTime);
  useEffect(() => {
    if (
      state.quickBuzzerTriggerTime &&
      state.quickBuzzerTriggerTime !== prevBuzzerTimeRef.current
    ) {
      audioService.playBuzzerSound();
    }
    prevBuzzerTimeRef.current = state.quickBuzzerTriggerTime;
  }, [state.quickBuzzerTriggerTime]);

  const prevStrikesRef = useRef(state.currentStrikes);
  const [strikeOverlayTime, setStrikeOverlayTime] = useState<number | null>(null);

  useEffect(() => {
    if (state.currentStrikes > prevStrikesRef.current) {
      audioService.playBuzzerSound();
      setStrikeOverlayTime(Date.now());
    }
    prevStrikesRef.current = state.currentStrikes;
  }, [state.currentStrikes]);

  const activeBuzzerTime = state.quickBuzzerTriggerTime || strikeOverlayTime;

  return (
    <div
      onClick={unlockAudio}
      className={`h-screen max-h-screen w-full flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6 relative overflow-hidden select-none ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D26] via-[#0D1236] to-[#070A1E]'
      }`}
    >
      {/* Background Neon Glow Ornaments (Stage mode only) */}
      {!isTransparent && (
        <>
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#00F0FF]/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#FF2E93]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-28 bg-[#00F0FF]/10 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Floating Audio Unlock Badge */}
      {!audioUnlocked && !isTransparent && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={unlockAudio}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFD600]/20 border border-[#FFD600]/60 text-[11px] font-bold text-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.4)] animate-pulse hover:bg-[#FFD600]/30 transition cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            <span>Aktifkan Audio</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="z-10 w-full max-w-6xl mx-auto shrink-0">
        <HeaderBanner
          category={currentCategory}
          revealedCount={revealedCount}
          totalCount={items.length}
          showClue={state.showClue}
        />
      </div>

      {/* Center: 10-Slot Game Board */}
      <div className="flex-1 flex items-center justify-center z-10 w-full max-w-6xl mx-auto min-h-0">
        <GameBoard items={items} revealedItemIds={state.revealedItemIds} />
      </div>

      {/* Bottom Area: Strike Slots (at the bottom) & Footer */}
      <div className="shrink-0 z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <StrikeSlots
          enabled={state.strikeSlotsEnabled}
          maxSlots={state.maxStrikeSlots}
          currentStrikes={state.currentStrikes}
        />

        <footer className="w-full text-center py-1">
          <span className="text-[10px] text-[#00F0FF]/40 tracking-wider font-semibold uppercase">
            Wibu Gameshow Screen • Plaza Cosplay Day
          </span>
        </footer>
      </div>

      {/* Fullscreen Buzzer Overlay */}
      <BuzzerOverlay triggerTimestamp={activeBuzzerTime} />
    </div>
  );
};
