import React, { useEffect, useRef, useState, useCallback } from 'react';
import { QuizState, QuizCategory, MillionaireQuestion } from '../../types/quiz';
import { HeaderBanner } from './HeaderBanner';
import { GameBoard } from './GameBoard';
import { StrikeSlots } from './StrikeSlots';
import { BuzzerOverlay } from './BuzzerOverlay';
import { TitleScreen } from './TitleScreen';
import { TransitionWipe } from './TransitionWipe';
import { CluePopupModal } from './CluePopupModal';
import { MillionaireBoard } from './MillionaireBoard';
import { audioService } from '../../services/audio';
import { socketClient } from '../../services/socket';
import { Volume2 } from 'lucide-react';

interface MainDisplayProps {
  state: QuizState;
  categories: QuizCategory[];
  millionaireQuestions?: MillionaireQuestion[];
}

export const MainDisplay: React.FC<MainDisplayProps> = ({
  state,
  categories,
  millionaireQuestions = []
}) => {
  const targetGameMode = state.gameMode || 'quiz';
  const targetQuestionId = state.millionaireState?.currentQuestionId ?? 1;

  // Buffered screen state for seamless wipe transitions
  const [displayedCategoryState, setDisplayedCategoryState] = useState({
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen,
    gameMode: targetGameMode,
    currentQuestionId: targetQuestionId
  });

  const pendingStateRef = useRef({
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen,
    gameMode: targetGameMode,
    currentQuestionId: targetQuestionId
  });
  pendingStateRef.current = {
    categoryId: state.categoryId,
    showTitleScreen: state.showTitleScreen,
    gameMode: targetGameMode,
    currentQuestionId: targetQuestionId
  };

  const prevWipeTimestampRef = useRef<number | null>(state.transitionWipeTimestamp);

  // If state updates without a wipe, sync immediately
  useEffect(() => {
    if (state.transitionWipeTimestamp === prevWipeTimestampRef.current) {
      setDisplayedCategoryState({
        categoryId: state.categoryId,
        showTitleScreen: state.showTitleScreen,
        gameMode: targetGameMode,
        currentQuestionId: targetQuestionId
      });
    }
    prevWipeTimestampRef.current = state.transitionWipeTimestamp;
  }, [
    state.categoryId,
    state.showTitleScreen,
    state.transitionWipeTimestamp,
    targetGameMode,
    targetQuestionId
  ]);

  const handleWipeCovered = useCallback(() => {
    setDisplayedCategoryState(pendingStateRef.current);
  }, []);

  const currentCategory =
    categories.find((c) => c.id === displayedCategoryState.categoryId) || categories[0];
  const items = currentCategory?.items || [];
  const revealedCount = state.revealedItemIds.length;
  const isTransparent = state.themeMode === 'transparent';
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const activeQuestion =
    millionaireQuestions.find((q) => q.id === displayedCategoryState.currentQuestionId) ||
    millionaireQuestions[0] ||
    null;

  // Audio settings sync
  useEffect(() => {
    audioService.updateSettings({
      soundEnabled: state.soundEnabled,
      soundVolume: state.soundVolume,
      bgmEnabled: state.bgmEnabled,
      bgmVolume: state.bgmVolume,
      bgmPlaying: state.bgmPlaying,
      bgmOffsetMs: state.bgmOffsetMs,
      customAudio: state.customAudio
    });
  }, [
    state.soundEnabled,
    state.soundVolume,
    state.bgmEnabled,
    state.bgmVolume,
    state.bgmPlaying,
    state.bgmOffsetMs,
    state.customAudio
  ]);

  // Synchronize active screen for BGM ducking (100% Layar Judul, 50% Game screen)
  useEffect(() => {
    audioService.setScreen(displayedCategoryState.showTitleScreen);
  }, [displayedCategoryState.showTitleScreen]);

  const unlockAudio = () => {
    if (!audioUnlocked) {
      audioService.playCorrectSound();
      audioService.ensureBgmPlaying();
      setAudioUnlocked(true);
    }
  };

  useEffect(() => {
    const handleGesture = () => {
      setAudioUnlocked(true);
      audioService.ensureBgmPlaying();
      audioService.preloadClickSound().catch(() => {});
      audioService.preloadLockSound().catch(() => {});
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

  const lastRevealAllTimeRef = useRef<number>(0);

  // Listen for broadcasted sounds (applause, intro, woosh, swoosh, reveal_all, etc.)
  useEffect(() => {
    const unsubscribeSound = socketClient.subscribeSound((sound) => {
      switch (sound) {
        case 'applause':
          audioService.playApplauseSound();
          break;
        case 'stop_applause':
          audioService.stopApplauseSound();
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
        case 'swoosh':
          audioService.playSwooshSound();
          break;
        case 'reveal_all':
          lastRevealAllTimeRef.current = Date.now();
          audioService.playRevealAllSound();
          break;
        case 'click':
          audioService.playClickSound();
          break;
        case 'lock':
          audioService.playLockSound();
          break;
      }
    });

    return () => {
      unsubscribeSound();
    };
  }, []);

  // Answer reveal chime (guarantees only 1 reveal sound on reveal_all)
  const prevRevealedCountRef = useRef(revealedCount);
  useEffect(() => {
    if (revealedCount > prevRevealedCountRef.current) {
      if (Date.now() - lastRevealAllTimeRef.current > 500) {
        if (revealedCount - prevRevealedCountRef.current > 1) {
          // Multiple opened at once -> swoosh layered with single reveal chime
          audioService.playRevealAllSound();
        } else {
          audioService.playCorrectSound();
        }
      }
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


  // Clue roll modal state & synchronization
  const [showClueModal, setShowClueModal] = useState(false);
  const prevRollTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.clueRollTimestamp && state.clueRollTimestamp !== prevRollTimeRef.current) {
      prevRollTimeRef.current = state.clueRollTimestamp;
      setShowClueModal(false);
    }
  }, [state.clueRollTimestamp]);

  useEffect(() => {
    if (state.isCluePopupOpen) {
      const isFreshRoll = state.clueRollTimestamp && Date.now() - state.clueRollTimestamp < 3000;
      if (!isFreshRoll) {
        setShowClueModal(true);
      }
    } else {
      setShowClueModal(false);
    }
  }, [state.isCluePopupOpen, state.clueRollTimestamp]);

  const handleRollComplete = useCallback(() => {
    if (state.isCluePopupOpen) {
      setShowClueModal(true);
    }
  }, [state.isCluePopupOpen]);

  const handleDismissClue = useCallback(() => {
    setShowClueModal(false);
    socketClient.send({ type: 'DISMISS_CLUE' });
  }, []);

  const targetItem = items.find((it) => it.id === state.clueRollTargetItemId);
  const sortedItems = [...items].sort((a, b) => a.rank - b.rank);
  const targetSlotIndex = targetItem ? sortedItems.findIndex((it) => it.id === targetItem.id) : undefined;

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
          bgmOffsetMs={state.bgmOffsetMs || 0}
        />
      ) : displayedCategoryState.gameMode === 'quiz' ? (
        <MillionaireBoard
          question={activeQuestion}
          state={state.millionaireState}
          isTransparent={isTransparent}
        />
      ) : (
        <div className="h-full w-full flex flex-col justify-between pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Top Header */}
          <div className="w-full max-w-5xl mx-auto shrink-0">
            <HeaderBanner
              category={currentCategory}
              showClue={state.showClue}
            />
          </div>

          {/* Center: 10-Slot Game Board */}
          <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto min-h-0 my-auto">
            <GameBoard
              items={items}
              revealedItemIds={state.revealedItemIds}
              clueRollTimestamp={state.clueRollTimestamp}
              clueRollTargetItemId={state.clueRollTargetItemId}
              isCluePopupOpen={state.isCluePopupOpen}
              onRollComplete={handleRollComplete}
            />
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

      {/* Clue Popup Modal (Triggered after roulette roll stops) */}
      <CluePopupModal
        isOpen={showClueModal && Boolean(targetItem)}
        item={targetItem}
        slotIndex={targetSlotIndex}
        category={currentCategory}
        onClose={handleDismissClue}
      />

      {/* Fullscreen Buzzer Overlay (Persists across view swaps without unmounting) */}
      <BuzzerOverlay triggerTimestamp={state.quickBuzzerTriggerTime} />

      {/* Holographic Wipe Transition (Midpoint swap callback) */}
      <TransitionWipe
        wipeTimestamp={state.transitionWipeTimestamp}
        onWipeCovered={handleWipeCovered}
      />
    </div>
  );
};
