import React, { useEffect, useRef, useState } from 'react';
import { QuizState, QuizCategory } from '../../types/quiz';
import { HeaderBanner } from './HeaderBanner';
import { GameBoard } from './GameBoard';
import { StrikeSlots } from './StrikeSlots';
import { BuzzerOverlay } from './BuzzerOverlay';
import { audioService } from '../../services/audio';
import { Volume2, VolumeX } from 'lucide-react';

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

  // Audio gesture unlock for non-OBS standard browser environments
  const unlockAudio = () => {
    if (!audioUnlocked) {
      audioService.playCorrectSound(); // Resumes Web Audio context
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
      className={`min-h-screen w-full flex flex-col justify-between py-6 px-4 md:px-8 relative overflow-hidden select-none ${
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

      {/* Floating Audio Unlock Badge (visible only in browser until clicked, invisible in OBS stream overlays) */}
      {!audioUnlocked && !isTransparent && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={unlockAudio}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FFD600]/20 border border-[#FFD600]/60 text-xs font-bold text-[#FFD600] shadow-[0_0_12px_rgba(255,214,0,0.4)] animate-pulse hover:bg-[#FFD600]/30 transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Aktifkan Audio</span>
          </button>
        </div>
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
