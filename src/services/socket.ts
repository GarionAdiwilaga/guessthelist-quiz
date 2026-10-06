import { QuizState, QuizCategory, WSMessage, SoundEffectType } from '../types/quiz';

type SnapshotCallback = (snapshot: {
  state: QuizState;
  categories: QuizCategory[];
}) => void;

type SoundCallback = (sound: SoundEffectType) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<SnapshotCallback> = new Set();
  private soundListeners: Set<SoundCallback> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting: boolean = false;

  private getSocketUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:3001/ws';
    const loc = window.location;
    if (loc.port === '5173') {
      return `ws://${loc.hostname}:3001/ws`;
    }
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${loc.host}/ws`;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const url = this.getSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STATE_SNAPSHOT') {
            for (const listener of this.listeners) {
              listener({ state: data.state, categories: data.categories });
            }
          } else if (data.type === 'PLAY_SOUND') {
            for (const listener of this.soundListeners) {
              listener(data.sound);
            }
          }
        } catch (err) {
          console.error('[QuizWS] Message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[QuizWS] Socket error:', err);
        this.ws?.close();
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  public subscribe(callback: SnapshotCallback): () => void {
    this.listeners.add(callback);
    this.connect();

    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeSound(callback: SoundCallback): () => void {
    this.soundListeners.add(callback);
    this.connect();

    return () => {
      this.soundListeners.delete(callback);
    };
  }

  public send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[QuizWS] Cannot send message, socket not open');
    }
  }
}

export const socketClient = new SocketClient();
