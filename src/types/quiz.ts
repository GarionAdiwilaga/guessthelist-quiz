export interface QuizItem {
  id: number;
  answer: string;
  anime?: string;
  aliases?: string[];
  reason?: string;
  rank: number;
  difficulty?: string;
}

export interface QuizCategory {
  id: number;
  category: string;
  emoji?: string;
  clue?: string;
  answerType?: string;
  items: QuizItem[];
}

export interface CustomAudioConfig {
  useCustomSound: boolean;
  correctAudioDataUrl: string | null;
  wrongAudioDataUrl: string | null;
}

export type GameMode = 'quiz' | 'family';

export interface MillionaireQuestion {
  id: number;
  category: string;
  anime: string;
  question: string;
  options: string[]; // Exactly 4 options: [A, B, C, D]
  answer: string;    // String matching one of the options
  hint?: string;     // Optional hint (defaults to empty string if not provided)
  explanation: string;
}

export interface MillionaireState {
  currentQuestionId: number;
  selectedOptionIndex: number | null; // 0..3 (A, B, C, D) or null
  isLocked: boolean;                  // Answer locked ("Final Answer")
  isRevealed: boolean;                // Result revealed (true/false)
  showHint: boolean;                  // Hint banner open on Main Display
}

export interface QuizConfigPersistent {
  gameMode: GameMode;
  currentMillionaireQuestionId: number;
  familyCategoryId: number;
  soundEnabled: boolean;
  soundVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmOffsetMs: number;
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  themeMode: 'stage' | 'transparent';
  titleLogoUrl: string | null;
  customAudio: CustomAudioConfig;
}

export interface QuizState {
  gameMode?: GameMode;
  millionaireState?: MillionaireState;
  categoryId: number;
  showTitleScreen: boolean;
  titleLogoUrl: string | null;
  transitionWipeTimestamp: number | null;
  revealedItemIds: number[];
  showClue: boolean;
  strikeSlotsEnabled: boolean;
  maxStrikeSlots: number;
  currentStrikes: number;
  quickBuzzerTriggerTime: number | null;
  soundEnabled: boolean;
  soundVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmPlaying: boolean;
  customAudio: CustomAudioConfig;
  themeMode: 'stage' | 'transparent';
  clueRollTimestamp: number | null;
  clueRollTargetItemId: number | null;
  isCluePopupOpen: boolean;
  bgmOffsetMs?: number;
}

export interface QuizDatabase {
  quizType?: string;
  title?: string;
  language?: string;
  instructions?: string;
  categories: QuizCategory[];
}

export type SoundEffectType =
  | 'applause'
  | 'stop_applause'
  | 'intro'
  | 'stop_music'
  | 'correct'
  | 'buzzer'
  | 'woosh'
  | 'swoosh'
  | 'reveal_all'
  | 'click'
  | 'lock';

export type WSMessage =
  | { type: 'STATE_SNAPSHOT'; state: QuizState; categories: QuizCategory[] }
  | { type: 'CLIENT_HELLO' }
  | { type: 'SELECT_CATEGORY'; categoryId: number; transitionViaTitle?: boolean }
  | { type: 'SET_SHOW_TITLE_SCREEN'; show: boolean }
  | { type: 'UPDATE_TITLE_LOGO'; logoUrl: string | null }
  | { type: 'TRIGGER_WIPE' }
  | { type: 'PLAY_SOUND'; sound: SoundEffectType }
  | { type: 'REVEAL_ITEM'; itemId: number }
  | { type: 'HIDE_ITEM'; itemId: number }
  | { type: 'REVEAL_ALL' }
  | { type: 'HIDE_ALL' }
  | { type: 'TOGGLE_CLUE'; showClue?: boolean }
  | { type: 'SET_STRIKES'; strikes: number }
  | { type: 'TRIGGER_QUICK_BUZZER' }
  | { type: 'UPDATE_STRIKE_CONFIG'; enabled: boolean; maxSlots: number }
  | { type: 'TOGGLE_BGM' }
  | { type: 'SET_BGM_PLAYING'; playing: boolean }
  | { type: 'SET_BGM_VOLUME'; volume: number }
  | { type: 'UPDATE_AUDIO_CONFIG'; settings: Partial<CustomAudioConfig & { soundEnabled: boolean; soundVolume: number; bgmEnabled?: boolean; bgmVolume?: number; bgmPlaying?: boolean; bgmOffsetMs?: number }> }
  | { type: 'ROLL_CLUE' }
  | { type: 'DISMISS_CLUE' }
  | { type: 'UPDATE_DATABANK'; database: QuizDatabase }
  | { type: 'SAVE_CATEGORIES'; categories: QuizCategory[] }
  | { type: 'SET_THEME_MODE'; mode: 'stage' | 'transparent' }
  | { type: 'RESET_ROUND' };
