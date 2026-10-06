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
      className={`h-screen w-full flex flex-col items-center justify-between py-10 px-6 relative select-none overflow-hidden ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D28] via-[#101648] to-[#080B22]'
      }`}
    >
      {/* Decorative Orbs */}
      {!isTransparent && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#00F0FF]/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#FF2E93]/20 blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Top Banner Tag */}
      <div className="z-10 flex items-center space-x-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00F0FF] shadow-[0_0_20px_rgba(255,46,147,0.5)] animate-pulse">
        <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          PLAZA COSPLAY DAY • SPECIAL EVENT
        </span>
      </div>

      {/* Center Hero Title */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center text-center my-6">
        {titleLogoUrl ? (
          <div className="animate-pop-in max-w-2xl px-4">
            <img
              src={titleLogoUrl}
              alt="Game Title Logo"
              className="max-h-72 sm:max-h-96 w-auto object-contain drop-shadow-[0_0_35px_rgba(0,240,255,0.7)] mx-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center animate-pop-in">
            {/* Upper Badge */}
            <div className="px-6 py-1 rounded-xl bg-[#090D2A]/90 border border-[#FFD600] text-[#FFD600] font-black text-sm tracking-wider uppercase shadow-[0_0_15px_rgba(255,214,0,0.4)] mb-3">
              MiniGames
            </div>

            {/* Giant Title */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase font-['Outfit',sans-serif] leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FFFFFF] to-[#FF2E93] drop-shadow-[0_8px_30px_rgba(0,240,255,0.6)]">
              FAMILY WIBU
            </h1>
            <div className="text-6xl sm:text-8xl lg:text-9xl font-black text-[#FFD600] font-['Fredoka',sans-serif] tracking-wider leading-none drop-shadow-[0_8px_30px_rgba(255,214,0,0.8)] -mt-2">
              100
            </div>

            <p className="mt-4 text-base sm:text-xl font-bold text-[#00F0FF] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              TEBAK SEMUA YANG ADA DI DALAM DAFTAR!
            </p>
          </div>
        )}

        {/* Ready / Waiting Badge */}
        <div className="mt-8 px-6 py-2 rounded-full bg-[#0C1236]/90 border-2 border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-gray-200 tracking-wider uppercase font-['Outfit',sans-serif]">
            MENUNGGU KATEGORI DIMULAI...
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 text-center py-2">
        <span className="text-xs text-[#00F0FF]/40 tracking-wider font-semibold uppercase">
          Wibu Gameshow Screen • Plaza Cosplay Day
        </span>
      </footer>
    </div>
  );
};
