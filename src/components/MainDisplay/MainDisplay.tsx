import React, { useEffect, useRef, useState, useCallback } from 'react';
import { QuizState, QuizCategory } from '../../types/quiz';
import { HeaderBanner } from './HeaderBanner';
import { GameBoard } from './GameBoard';
import { StrikeSlots } from './StrikeSlots';
import { BuzzerOverlay } from './BuzzerOverlay';
import { TitleScreen } from './TitleScreen';
import { TransitionWipe } from './TransitionWipe';
import { audioService } from '../../services/audio';
import { socketClient } from '../../services/socket';
import { Volume2 } from 'lucide-react';

interface MainDisplayProps {
  state: QuizState;
  categories: QuizCategory[];
}

export const MainDisplay: React.FC<MainDisplayProps> = ({ state, categories }) => {
  // Buffered screen state for seamless wipe transitions
  const [displayedCategoryState, setDisplayedCategoryState] = useState({
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen
  });

  const pendingStateRef = useRef({
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen
  });
  pendingStateRef.current = {
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen
  };

  const prevWipeTimestampRef = useRef<number | null>(state.transitionWipeTimestamp);

  // If state updates without a wipe, sync immediately
  useEffect(() => {
    if (state.transitionWipeTimestamp === prevWipeTimestampRef.current) {
      setDisplayedCategoryState({
        categoryId: state.categoryId,
        showTitleScreen: state.showTitleScreen
      });
    }
    prevWipeTimestampRef.current = state.transitionWipeTimestamp;
  }, [state.categoryId, state.showTitleScreen, state.transitionWipeTimestamp]);

  const handleWipeCovered = useCallback(() => {
    setDisplayedCategoryState(pendingStateRef.current);
  }, []);

  const currentCategory =
    categories.find((c) => c.id === displayedCategoryState.categoryId) || categories[0];
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

  // Listen for broadcasted sounds (applause, intro, woosh, etc.)
  useEffect(() => {
    const unsubscribeSound = socketClient.subscribeSound((sound) => {
      switch (sound) {
        case 'applause':
          audioService.playApplauseSound();
          break;
        case 'intro':
          audioService.playIntroMusic();
          break;
        case 'stop_music':
          audioService.stopIntroMusic();
          break;
        case 'correct':
          audioService.playCorrectSound();
          break;
        case 'buzzer':
          audioService.playBuzzerSound();
          break;
        case 'woosh':
          audioService.playWooshSound();
          break;
      }
    });

    return () => {
      unsubscribeSound();
    };
  }, []);

  // Answer reveal chime
  const prevRevealedCountRef = useRef(revealedCount);
  useEffect(() => {
    if (revealedCount > prevRevealedCountRef.current) {
      audioService.playCorrectSound();
    }
    prevRevealedCountRef.current = revealedCount;
  }, [revealedCount]);

  // Buzzer audio triggering only for NEW real-time triggers after mount
  const prevBuzzerTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    if (
      state.quickBuzzerTriggerTime &&
      state.quickBuzzerTriggerTime > prevBuzzerTimeRef.current
    ) {
      audioService.playBuzzerSound();
      prevBuzzerTimeRef.current = state.quickBuzzerTriggerTime;
    }
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
      className={`h-screen max-h-screen w-full relative overflow-hidden select-none ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D26] via-[#0D1236] to-[#070A1E]'
      }`}
    >
      {/* Background Neon Glow Ornaments (Stage mode only) */}
      {!isTransparent && (
        <>
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#00F0FF]/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-[#FF2E93]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-[#00F0FF]/10 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Floating Audio Unlock Badge */}
      {!audioUnlocked && !isTransparent && (
        <div className="absolute top-2.5 right-2.5 z-30">
          <button
            onClick={unlockAudio}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFD600]/20 border border-[#FFD600]/60 text-[11px] font-bold text-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.4)] animate-pulse hover:bg-[#FFD600]/30 transition cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            <span>Aktifkan Audio</span>
          </button>
        </div>
      )}

      {/* Main Content Router */}
      {displayedCategoryState.showTitleScreen ? (
        <TitleScreen
          titleLogoUrl={state.titleLogoUrl}
          isTransparent={isTransparent}
        />
      ) : (
        <div className="h-full w-full flex flex-col justify-between pt-3 sm:pt-4 pb-2 px-3 sm:px-6 relative z-10">
          {/* Top Header */}
          <div className="w-full max-w-5xl mx-auto shrink-0">
            <HeaderBanner
              category={currentCategory}
              showClue={state.showClue}
            />
          </div>

          {/* Center: 10-Slot Game Board */}
          <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto min-h-0 my-auto">
            <GameBoard items={items} revealedItemIds={state.revealedItemIds} />
          </div>

          {/* Bottom Area: Strike Slots (No footer) */}
          <div className="shrink-0 w-full max-w-5xl mx-auto flex flex-col items-center">
            <StrikeSlots
              enabled={state.strikeSlotsEnabled}
              maxSlots={state.maxStrikeSlots}
              currentStrikes={state.currentStrikes}
            />
          </div>
        </div>
      )}

      {/* Fullscreen Buzzer Overlay (Persists across view swaps without unmounting) */}
      <BuzzerOverlay triggerTimestamp={activeBuzzerTime} />

      {/* Holographic Wipe Transition (Midpoint swap callback) */}
      <TransitionWipe
        wipeTimestamp={state.transitionWipeTimestamp}
        onWipeCovered={handleWipeCovered}
      />
    </div>
  );
};
