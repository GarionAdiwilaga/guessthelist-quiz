import React from 'react';
import { QuizState } from '../../types/quiz';
import { X, Volume2, ShieldAlert, Monitor, Image, Upload, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  state: QuizState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStrikeConfig: (enabled: boolean, maxSlots: number) => void;
  onUpdateThemeMode: (mode: 'stage' | 'transparent') => void;
  onUpdateTitleLogo: (logoUrl: string | null) => void;
  onUpdateAudioConfig: (
    settings: Partial<
      QuizState['customAudio'] & {
        soundEnabled: boolean;
        soundVolume: number;
        bgmEnabled?: boolean;
        bgmVolume?: number;
        bgmPlaying?: boolean;
      }
    >
  ) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdateStrikeConfig,
  onUpdateThemeMode,
  onUpdateTitleLogo,
  onUpdateAudioConfig
}) => {
  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'correct' | 'wrong'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === 'correct') {
        onUpdateAudioConfig({ correctAudioDataUrl: dataUrl, useCustomSound: true });
      } else {
        onUpdateAudioConfig({ wrongAudioDataUrl: dataUrl, useCustomSound: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateTitleLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1236] border-2 border-[#00F0FF]/60 shadow-[0_0_35px_rgba(0,240,255,0.3)] p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E265C] mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-xl text-[#00F0FF]">⚙️</span>
            <h2 className="text-lg md:text-xl font-black text-white font-['Outfit',sans-serif] uppercase tracking-wide">
              PENGATURAN QUIZ & OBS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section: Custom PNG Logo for Title Screen */}
        <div className="mb-5 p-4 rounded-xl bg-[#141A48] border border-[#232F72]">
          <div className="flex items-center space-x-2 mb-2">
            <Image className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Logo Layar Judul (Custom PNG)
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Ganti teks judul tengah di layar transisi dengan gambar/logo PNG kustom.
          </p>

          {state.titleLogoUrl ? (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-black/40 border border-[#00F0FF]/40">
              <img
                src={state.titleLogoUrl}
                alt="Logo preview"
                className="h-12 w-auto object-contain bg-white/5 rounded p-1"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-green-400 font-bold block">
                  Logo PNG Aktif
                </span>
                <span className="text-[11px] text-gray-400">
                  Akan ditampilkan di layar transisi.
                </span>
              </div>
              <button
                onClick={() => onUpdateTitleLogo(null)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-400 transition cursor-pointer"
                title="Hapus Logo & Gunakan Teks Default"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-[#0E133A] border-2 border-dashed border-[#2A3778] hover:border-[#00F0FF] cursor-pointer text-xs font-semibold text-gray-300 transition">
              <Upload className="w-4 h-4 text-[#00F0FF]" />
              <span>Pilih Gambar PNG Logo</span>
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Section 1: Strike Slots Configuration */}
        <div className="mb-5 p-4 rounded-xl bg-[#141A48] border border-[#232F72]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#FF2E93]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Slot Strike (Salah)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.strikeSlotsEnabled}
                onChange={(e) =>
                  onUpdateStrikeConfig(e.target.checked, state.maxStrikeSlots)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2E93]"></div>
            </label>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Default dinonaktifkan (hanya buzzer instan). Jika diaktifkan, layar menampilkan slot strike (2–5 slot) di bawah board.
          </p>

          {state.strikeSlotsEnabled && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">
                Jumlah Slot Strike:
              </span>
              <div className="flex items-center space-x-1.5">
                {[2, 3, 4, 5].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onUpdateStrikeConfig(true, slot)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer border ${
                      state.maxStrikeSlots === slot
                        ? 'bg-[#FF2E93] text-white border-white shadow-[0_0_8px_rgba(255,46,147,0.8)]'
                        : 'bg-[#0E133A] text-gray-300 border-[#2A3778] hover:border-white/50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Display Canvas & OBS Mode */}
        <div className="mb-5 p-4 rounded-xl bg-[#141A48] border border-[#232F72]">
          <div className="flex items-center space-x-2 mb-2">
            <Monitor className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Tampilan Background Layar
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Pilih "OBS Transparan" jika board ingin ditumpuk langsung di atas video kamera/stream di OBS Studio.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateThemeMode('stage')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                state.themeMode === 'stage'
                  ? 'border-[#00F0FF] bg-[#1E2B6D] text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'border-[#222E68] bg-[#0E133A] text-gray-400 hover:text-white'
              }`}
            >
              Stage Gelap (Default)
            </button>
            <button
              onClick={() => onUpdateThemeMode('transparent')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                state.themeMode === 'transparent'
                  ? 'border-[#00F0FF] bg-[#1E2B6D] text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'border-[#222E68] bg-[#0E133A] text-gray-400 hover:text-white'
              }`}
            >
              OBS Transparan
            </button>
          </div>
        </div>

        {/* Section 3: Background Music (BGM Loop) */}
        <div className="mb-5 p-4 rounded-xl bg-[#141A48] border border-[#232F72]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-base leading-none">📻</span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Musik Latar (BGM Loop)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.bgmPlaying}
                onChange={(e) =>
                  onUpdateAudioConfig({ bgmPlaying: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F0FF]"></div>
            </label>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Memutar <code className="text-[#00F0FF] font-mono">bgm.mp3</code> secara berulang. Otomatis 100% volume di Layar Judul dan turun ke 50% di Layar Game kuis.
          </p>

          {/* BGM Volume Slider */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Volume Induk BGM:</span>
              <span className="font-mono text-[#00F0FF] font-bold">
                {Math.round(state.bgmVolume * 100)}%
                <span className="text-gray-400 font-normal ml-1.5">
                  ({Math.round(state.bgmVolume * 100)}% Judul / {Math.round(state.bgmVolume * 50)}% Game)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.bgmVolume}
              onChange={(e) =>
                onUpdateAudioConfig({ bgmVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          {/* BGM Beat Sync Calibration (Latency Offset) */}
          <div className="mt-3.5 pt-3 border-t border-[#1E265C]">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Kalibrasi Beat / Ketukan (Offset):</span>
              <span className="font-mono text-[#FFD600] font-bold">
                {(state.bgmOffsetMs || 0) > 0 ? `+${state.bgmOffsetMs}ms` : `${state.bgmOffsetMs || 0}ms`}
                <span className="text-gray-400 font-normal ml-1">
                  ({(state.bgmOffsetMs || 0) === 0 ? 'Tepat' : (state.bgmOffsetMs || 0) > 0 ? 'Lebih Cepat' : 'Lebih Lambat'})
                </span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
              Sesuaikan jika efek detak logo dan gelombang ripple terasa sedikit mendahului atau tertinggal dari audio speaker / Bluetooth.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-400 font-mono">-200ms</span>
              <input
                type="range"
                min="-200"
                max="200"
                step="10"
                value={state.bgmOffsetMs || 0}
                onChange={(e) =>
                  onUpdateAudioConfig({ bgmOffsetMs: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#FFD600] cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 font-mono">+200ms</span>
            </div>
          </div>
        </div>

        {/* Section 4: Sound Effects (SFX) */}
        <div className="p-4 rounded-xl bg-[#141A48] border border-[#232F72]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#FFD600]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Efek Suara (Audio)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.soundEnabled}
                onChange={(e) =>
                  onUpdateAudioConfig({ soundEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD600]"></div>
            </label>
          </div>

          {/* Volume Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Volume:</span>
              <span>{Math.round(state.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.soundVolume}
              onChange={(e) =>
                onUpdateAudioConfig({ soundVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-[#FFD600] cursor-pointer"
            />
          </div>

          {/* Sound Source: Synthesizer vs Custom File */}
          <div className="pt-3 border-t border-white/10">
            <span className="text-xs font-semibold text-gray-300 block mb-2">
              Sumber Audio:
            </span>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => onUpdateAudioConfig({ useCustomSound: false })}
                className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  !state.customAudio.useCustomSound
                    ? 'border-[#FFD600] bg-[#2E2814] text-[#FFD600]'
                    : 'border-[#222E68] bg-[#0E133A] text-gray-400'
                }`}
              >
                Synthesizer Bawaan
              </button>
              <button
                onClick={() => onUpdateAudioConfig({ useCustomSound: true })}
                className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  state.customAudio.useCustomSound
                    ? 'border-[#FFD600] bg-[#2E2814] text-[#FFD600]'
                    : 'border-[#222E68] bg-[#0E133A] text-gray-400'
                }`}
              >
                File Audio Kustom
              </button>
            </div>

            {state.customAudio.useCustomSound && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Suara Benar (Chime/Ding):
                  </label>
                  <label className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0E133A] border border-[#2A3778] hover:border-[#00F0FF] cursor-pointer text-xs text-gray-300">
                    <Upload className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>
                      {state.customAudio.correctAudioDataUrl
                        ? 'Audio Benar Terpasang (Ganti File)'
                        : 'Pilih file .mp3 / .wav'}
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, 'correct')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Suara Salah (Buzzer):
                  </label>
                  <label className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0E133A] border border-[#2A3778] hover:border-[#FF2E93] cursor-pointer text-xs text-gray-300">
                    <Upload className="w-3.5 h-3.5 text-[#FF2E93]" />
                    <span>
                      {state.customAudio.wrongAudioDataUrl
                        ? 'Audio Salah Terpasang (Ganti File)'
                        : 'Pilih file .mp3 / .wav'}
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, 'wrong')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Done Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A8B5] text-[#0A0D26] font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
