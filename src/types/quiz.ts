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

export interface QuizState {
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
  customAudio: CustomAudioConfig;
  themeMode: 'stage' | 'transparent';
}

export type SoundEffectType = 'applause' | 'intro' | 'stop_music' | 'correct' | 'buzzer' | 'woosh';

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
  | { type: 'UPDATE_AUDIO_CONFIG'; settings: Partial<CustomAudioConfig & { soundEnabled: boolean; soundVolume: number }> }
  | { type: 'SET_THEME_MODE'; mode: 'stage' | 'transparent' }
  | { type: 'RESET_ROUND' };
