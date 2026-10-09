import React, { useState, useRef, useEffect } from 'react';
import { QuizState, QuizCategory, WSMessage, QuizDatabase } from '../../types/quiz';
import { socketClient } from '../../services/socket';
import { CategorySelector } from './CategorySelector';
import { AnswerRoster } from './AnswerRoster';
import { StrikeControls } from './StrikeControls';
import { BoardControls } from './BoardControls';
import { SettingsModal } from './SettingsModal';
import { DataEditorModal } from './DataEditorModal';

interface ControllerViewProps {
  state: QuizState;
  categories: QuizCategory[];
  sendMessage: (msg: WSMessage) => void;
}

export const ControllerView: React.FC<ControllerViewProps> = ({
  state,
  categories,
  sendMessage
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [isApplausePlaying, setIsApplausePlaying] = useState(false);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlaySound = (
    sound: 'applause' | 'stop_applause' | 'intro' | 'stop_music'
  ) => {
    sendMessage({ type: 'PLAY_SOUND', sound });

    if (sound === 'intro') {
      setIsIntroPlaying(true);
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      // intro.mp3 duration ~7.13s -> auto reset button when finished
      introTimerRef.current = setTimeout(() => {
        setIsIntroPlaying(false);
      }, 7200);
    } else if (sound === 'stop_music') {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      setIsIntroPlaying(false);
    } else if (sound === 'applause') {
      setIsApplausePlaying(true);
      if (applauseTimerRef.current) clearTimeout(applauseTimerRef.current);
      // applause.wav duration ~8.84s -> auto reset button when finished
      applauseTimerRef.current = setTimeout(() => {
        setIsApplausePlaying(false);
      }, 8900);
    } else if (sound === 'stop_applause') {
      if (applauseTimerRef.current) clearTimeout(applauseTimerRef.current);
      setIsApplausePlaying(false);
    }
  };

  // Sync state if another controller or external trigger stops audio
  useEffect(() => {
    const unsub = socketClient.subscribeSound((sound) => {
      if (sound === 'stop_music') {
        if (introTimerRef.current) clearTimeout(introTimerRef.current);
        setIsIntroPlaying(false);
      } else if (sound === 'stop_applause') {
        if (applauseTimerRef.current) clearTimeout(applauseTimerRef.current);
        setIsApplausePlaying(false);
      } else if (sound === 'intro') {
        setIsIntroPlaying(true);
        if (introTimerRef.current) clearTimeout(introTimerRef.current);
        introTimerRef.current = setTimeout(() => setIsIntroPlaying(false), 7200);
      } else if (sound === 'applause') {
        setIsApplausePlaying(true);
        if (applauseTimerRef.current) clearTimeout(applauseTimerRef.current);
        applauseTimerRef.current = setTimeout(() => setIsApplausePlaying(false), 8900);
      }
    });

    return () => {
      unsub();
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (applauseTimerRef.current) clearTimeout(applauseTimerRef.current);
    };
  }, []);

  const currentCategory =
    categories.find((c) => c.id === state.categoryId) || categories[0];

  const handleSelectCategory = (categoryId: number) => {
    sendMessage({ type: 'SELECT_CATEGORY', categoryId });
  };

  const handleToggleReveal = (itemId: number) => {
    if (state.revealedItemIds.includes(itemId)) {
      sendMessage({ type: 'HIDE_ITEM', itemId });
    } else {
      sendMessage({ type: 'REVEAL_ITEM', itemId });
    }
  };

  const handleSetStrikes = (strikes: number) => {
    sendMessage({ type: 'SET_STRIKES', strikes });
  };

  const handleTriggerQuickBuzzer = () => {
    sendMessage({ type: 'TRIGGER_QUICK_BUZZER' });
  };

  const handleRevealAll = () => {
    sendMessage({ type: 'REVEAL_ALL' });
  };

  const handleHideAll = () => {
    sendMessage({ type: 'HIDE_ALL' });
  };

  const handleToggleClue = () => {
    sendMessage({ type: 'TOGGLE_CLUE', showClue: !state.showClue });
  };

  const handleToggleTitleScreen = () => {
    sendMessage({
      type: 'SET_SHOW_TITLE_SCREEN',
      show: !state.showTitleScreen
    });
  };

  const handleUpdateTitleLogo = (logoUrl: string | null) => {
    sendMessage({ type: 'UPDATE_TITLE_LOGO', logoUrl });
  };

  const handleUpdateStrikeConfig = (enabled: boolean, maxSlots: number) => {
    sendMessage({ type: 'UPDATE_STRIKE_CONFIG', enabled, maxSlots });
  };

  const handleUpdateThemeMode = (mode: 'stage' | 'transparent') => {
    sendMessage({ type: 'SET_THEME_MODE', mode });
  };

  const handleToggleBgm = () => {
    sendMessage({ type: 'TOGGLE_BGM' });
  };

  const handleSetBgmVolume = (volume: number) => {
    sendMessage({ type: 'SET_BGM_VOLUME', volume });
  };

  const handleUpdateAudioConfig = (
    settings: Partial<
      QuizState['customAudio'] & {
        soundEnabled: boolean;
        soundVolume: number;
        bgmEnabled: boolean;
        bgmVolume: number;
        bgmPlaying: boolean;
      }
    >
  ) => {
    sendMessage({ type: 'UPDATE_AUDIO_CONFIG', settings });
  };

  const handleRollClue = () => {
    sendMessage({ type: 'ROLL_CLUE' });
  };

  const handleDismissClue = () => {
    sendMessage({ type: 'DISMISS_CLUE' });
  };

  const handleSaveCategories = (updatedCategories: QuizCategory[]) => {
    sendMessage({ type: 'SAVE_CATEGORIES', categories: updatedCategories });
  };

  const handleUpdateDatabank = (updatedDatabase: QuizDatabase) => {
    sendMessage({ type: 'UPDATE_DATABANK', database: updatedDatabase });
  };

  return (
    <div className="min-h-screen bg-[#070A1E] text-white p-4 md:p-6 max-w-7xl mx-auto flex flex-col space-y-5">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2656] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl text-[#00F0FF]">🎮</span>
            <h1 className="text-xl md:text-2xl font-black text-[#00F0FF] tracking-wide font-['Outfit',sans-serif]">
              HOST CONTROLLER • FAMILY WIBU 100
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Layar Pengendali: Transisi judul, buka jawaban, buzzer salah, dan pengaturan OBS.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#0E1540] border border-[#00F0FF]/40 text-[#00F0FF] font-black">
            {state.showTitleScreen ? '📺 Layar Judul (Pause)' : '🎮 Layar Game (Board)'}
          </span>
          <button
            onClick={() => setIsDataEditorOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/50 text-[#00F0FF] hover:text-white font-bold transition cursor-pointer"
            title="Buka Bank Data & Editor Soal"
          >
            📚 Bank Data
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#201A54] border border-[#FF2E93]/50 text-[#FF2E93] hover:text-white font-bold transition"
          >
            Buka Display ↗
          </a>
        </div>
      </header>

      {/* Strike & Buzzer Action Panel */}
      <StrikeControls
        strikeSlotsEnabled={state.strikeSlotsEnabled}
        maxStrikeSlots={state.maxStrikeSlots}
        currentStrikes={state.currentStrikes}
        onSetStrikes={handleSetStrikes}
        onTriggerQuickBuzzer={handleTriggerQuickBuzzer}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPlaySound={handlePlaySound}
        isIntroPlaying={isIntroPlaying}
        isApplausePlaying={isApplausePlaying}
        bgmPlaying={state.bgmPlaying}
        bgmVolume={state.bgmVolume}
        onToggleBgm={handleToggleBgm}
        onSetBgmVolume={handleSetBgmVolume}
      />

      {/* Board Utility Actions Bar (Includes Title Screen Toggle) */}
      <BoardControls
        showClue={state.showClue}
        showTitleScreen={state.showTitleScreen}
        isCluePopupOpen={state.isCluePopupOpen}
        onRevealAll={handleRevealAll}
        onHideAll={handleHideAll}
        onToggleClue={handleToggleClue}
        onToggleTitleScreen={handleToggleTitleScreen}
        onRollClue={handleRollClue}
        onDismissClue={handleDismissClue}
        onOpenDataEditor={() => setIsDataEditorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Category Tabs */}
      <CategorySelector
        categories={categories}
        activeCategoryId={state.categoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* Top 10 Answer Roster with Live Search Filter */}
      <AnswerRoster
        items={currentCategory?.items || []}
        revealedItemIds={state.revealedItemIds}
        onToggleReveal={handleToggleReveal}
      />

      {/* Settings Modal */}
      <SettingsModal
        state={state}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateStrikeConfig={handleUpdateStrikeConfig}
        onUpdateThemeMode={handleUpdateThemeMode}
        onUpdateTitleLogo={handleUpdateTitleLogo}
        onUpdateAudioConfig={handleUpdateAudioConfig}
      />

      {/* Bank Data & Category Editor Modal */}
      <DataEditorModal
        isOpen={isDataEditorOpen}
        categories={categories}
        onClose={() => setIsDataEditorOpen(false)}
        onSaveCategories={handleSaveCategories}
        onUpdateDatabank={handleUpdateDatabank}
      />
    </div>
  );
};
