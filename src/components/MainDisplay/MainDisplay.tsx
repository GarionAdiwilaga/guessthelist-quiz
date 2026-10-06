import React, { useEffect, useRef } from 'react';
import { QuizState, QuizCategory } from '../../types/quiz';
import { HeaderBanner } from './HeaderBanner';
import { GameBoard } from './GameBoard';
import { StrikeSlots } from './StrikeSlots';
import { BuzzerOverlay } from './BuzzerOverlay';
import { audioService } from '../../services/audio';

interface MainDisplayProps {
  state: QuizState;
  categories: QuizCategory[];
}

export const MainDisplay: React.FC<MainDisplayProps> = ({ state, categories }) => {
  const currentCategory = categories.find((c) => c.id === state.categoryId) || categories[0];
  const items = currentCategory?.items || [];
  const revealedCount = state.revealedItemIds.length;
  const isTransparent = state.themeMode === 'transparent';

  // Audio settings sync
  useEffect(() => {
    audioService.updateSettings({
      soundEnabled: state.soundEnabled,
      soundVolume: state.soundVolume,
      customAudio: state.customAudio
    });
  }, [state.soundEnabled, state.soundVolume, state.customAudio]);

  // Track previous reveals to play chime only when new item is revealed
  const prevRevealedCountRef = useRef(revealedCount);
  useEffect(() => {
    if (revealedCount > prevRevealedCountRef.current) {
      audioService.playCorrectSound();
    }
    prevRevealedCountRef.current = revealedCount;
  }, [revealedCount]);

  // Track quick buzzer triggers
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

  // Track strike increments to trigger buzzer and overlay
  const prevStrikesRef = useRef(state.currentStrikes);
  const [strikeOverlayTime, setStrikeOverlayTime] = React.useState<number | null>(null);

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
      className={`min-h-screen w-full flex flex-col justify-between py-6 px-4 md:px-8 relative overflow-hidden ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D26] via-[#0E133A] to-[#080B21]'
      }`}
    >
      {/* Background Neon Glow Ornaments (Stage mode only) */}
      {!isTransparent && (
        <>
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00F0FF]/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FF2E93]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#00F0FF]/10 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 w-full max-w-7xl mx-auto">
        <HeaderBanner
          category={currentCategory}
          revealedCount={revealedCount}
          totalCount={items.length}
          showClue={state.showClue}
        />

        <StrikeSlots
          enabled={state.strikeSlotsEnabled}
          maxSlots={state.maxStrikeSlots}
          currentStrikes={state.currentStrikes}
        />

        <GameBoard items={items} revealedItemIds={state.revealedItemIds} />
      </div>

      {/* Fullscreen Buzzer Overlay */}
      <BuzzerOverlay triggerTimestamp={activeBuzzerTime} />

      {/* Bottom Stage Footer */}
      <footer className="w-full text-center py-2 z-10">
        <span className="text-xs text-[#00F0FF]/40 tracking-wider font-semibold uppercase">
          Wibu Gameshow Screen • Plaza Cosplay Day
        </span>
      </footer>
    </div>
  );
};
