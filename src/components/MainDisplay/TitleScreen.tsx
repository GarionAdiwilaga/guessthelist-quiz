import React from 'react';

interface TitleScreenProps {
  titleLogoUrl: string | null;
  isTransparent: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  titleLogoUrl,
  isTransparent
}) => {
  return (
    <div
      className={`h-screen w-full flex flex-col items-center justify-between py-6 sm:py-8 px-4 sm:px-6 relative select-none overflow-hidden ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D28] via-[#101648] to-[#080B22]'
      }`}
    >
      {/* Soft Ambient Background Orbs (Optimized blur, no clipping lines) */}
      {!isTransparent && (
        <>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#FF2E93]/10 blur-3xl pointer-events-none z-0" />
        </>
      )}

      {/* osu! Style Concentric Vector Ripple Circles (Zero Artifacts, Pure 60fps Vector) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="osuCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#FF2E93" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0A0D28" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center ambient glow */}
        <circle cx="50%" cy="50%" r="240" fill="url(#osuCenterGlow)" />

        {/* Concentric expanding ripples - Staggered 1.1s intervals */}
        <circle cx="50%" cy="50%" r="50" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0">
          <animate attributeName="r" from="50" to="560" dur="4.4s" repeatCount="indefinite" begin="0s" />
          <animate attributeName="opacity" values="0.85;0.35;0" keyTimes="0;0.5;1" dur="4.4s" repeatCount="indefinite" begin="0s" />
          <animate attributeName="stroke-width" values="2.5;1.2;0.4" dur="4.4s" repeatCount="indefinite" begin="0s" />
        </circle>

        <circle cx="50%" cy="50%" r="50" fill="none" stroke="#FF2E93" strokeWidth="2" opacity="0">
          <animate attributeName="r" from="50" to="560" dur="4.4s" repeatCount="indefinite" begin="1.1s" />
          <animate attributeName="opacity" values="0.85;0.35;0" keyTimes="0;0.5;1" dur="4.4s" repeatCount="indefinite" begin="1.1s" />
          <animate attributeName="stroke-width" values="2.5;1.2;0.4" dur="4.4s" repeatCount="indefinite" begin="1.1s" />
        </circle>

        <circle cx="50%" cy="50%" r="50" fill="none" stroke="#9D00FF" strokeWidth="2" opacity="0">
          <animate attributeName="r" from="50" to="560" dur="4.4s" repeatCount="indefinite" begin="2.2s" />
          <animate attributeName="opacity" values="0.85;0.35;0" keyTimes="0;0.5;1" dur="4.4s" repeatCount="indefinite" begin="2.2s" />
          <animate attributeName="stroke-width" values="2.5;1.2;0.4" dur="4.4s" repeatCount="indefinite" begin="2.2s" />
        </circle>

        <circle cx="50%" cy="50%" r="50" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0">
          <animate attributeName="r" from="50" to="560" dur="4.4s" repeatCount="indefinite" begin="3.3s" />
          <animate attributeName="opacity" values="0.85;0.35;0" keyTimes="0;0.5;1" dur="4.4s" repeatCount="indefinite" begin="3.3s" />
          <animate attributeName="stroke-width" values="2.5;1.2;0.4" dur="4.4s" repeatCount="indefinite" begin="3.3s" />
        </circle>
      </svg>

      {/* Top Banner Tag */}
      <div className="z-10 flex items-center space-x-2 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00F0FF] border border-white/20">
        <span className="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MINIGAMES • FAMILY WIBU 100 • PLAZA COSPLAY DAY
        </span>
      </div>

      {/* Center Hero Title with Smooth GPU Slow Pulsing (Zero Artifacts) */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center text-center my-4">
        {titleLogoUrl ? (
          <div className="animate-slow-pulse max-w-xl px-4 flex items-center justify-center">
            <img
              src={titleLogoUrl}
              alt="Game Title Logo"
              className="max-h-64 sm:max-h-80 w-auto object-contain mx-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center animate-slow-pulse">
            {/* Upper Badge */}
            <div className="px-5 py-1 rounded-xl bg-[#090D2A]/90 border border-[#FFD600] text-[#FFD600] font-black text-xs sm:text-sm tracking-wider uppercase mb-2.5">
              MiniGames
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase font-['Outfit',sans-serif] leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FFFFFF] to-[#FF2E93]">
              FAMILY WIBU
            </h1>
            <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#FFD600] font-['Fredoka',sans-serif] tracking-wider leading-none -mt-2">
              100
            </div>

            <p className="mt-3 text-sm sm:text-lg font-bold text-[#00F0FF] tracking-widest uppercase">
              TEBAK SEMUA YANG ADA DI DALAM DAFTAR!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
