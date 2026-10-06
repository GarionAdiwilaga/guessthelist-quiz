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

export type WSMessage =
  | { type: 'STATE_SNAPSHOT'; state: QuizState; categories: QuizCategory[] }
  | { type: 'CLIENT_HELLO' }
  | { type: 'SELECT_CATEGORY'; categoryId: number }
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
