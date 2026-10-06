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
      {/* Decorative Orbs */}
      {!isTransparent && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-[#00F0FF]/15 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#FF2E93]/20 blur-[120px] pointer-events-none z-0" />
        </>
      )}

      {/* osu! Main Menu Style Concentric Expanding Background Ripple Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border-2 border-[#00F0FF] animate-osu-ripple-1 pointer-events-none" />
        <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border-2 border-[#FF2E93] animate-osu-ripple-2 pointer-events-none" />
        <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border-2 border-[#9D00FF] animate-osu-ripple-3 pointer-events-none" />
        <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border-2 border-[#00F0FF] animate-osu-ripple-4 pointer-events-none" />
      </div>

      {/* Top Banner Tag */}
      <div className="z-10 flex items-center space-x-2 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00F0FF] shadow-[0_0_20px_rgba(255,46,147,0.5)] animate-pulse">
        <span className="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MINIGAMES • FAMILY WIBU 100 • PLAZA COSPLAY DAY
        </span>
      </div>

      {/* Center Hero Title with Smooth Slow Pulsing */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center text-center my-4">
        {titleLogoUrl ? (
          <div className="animate-slow-pulse max-w-xl px-4 flex items-center justify-center">
            <img
              src={titleLogoUrl}
              alt="Game Title Logo"
              className="max-h-64 sm:max-h-80 w-auto object-contain drop-shadow-[0_0_35px_rgba(0,240,255,0.7)] mx-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center animate-slow-pulse">
            {/* Upper Badge */}
            <div className="px-5 py-1 rounded-xl bg-[#090D2A]/90 border border-[#FFD600] text-[#FFD600] font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_15px_rgba(255,214,0,0.4)] mb-2.5">
              MiniGames
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase font-['Outfit',sans-serif] leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FFFFFF] to-[#FF2E93] drop-shadow-[0_8px_30px_rgba(0,240,255,0.6)]">
              FAMILY WIBU
            </h1>
            <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#FFD600] font-['Fredoka',sans-serif] tracking-wider leading-none drop-shadow-[0_8px_30px_rgba(255,214,0,0.8)] -mt-2">
              100
            </div>

            <p className="mt-3 text-sm sm:text-lg font-bold text-[#00F0FF] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              TEBAK SEMUA YANG ADA DI DALAM DAFTAR!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
