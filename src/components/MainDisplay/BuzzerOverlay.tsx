import React, { useEffect, useState } from 'react';

interface BuzzerOverlayProps {
  triggerTimestamp: number | null;
  durationMs?: number;
}

export const BuzzerOverlay: React.FC<BuzzerOverlayProps> = ({
  triggerTimestamp,
  durationMs = 1200
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!triggerTimestamp) return;

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [triggerTimestamp, durationMs]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-950/30 backdrop-blur-[2px] animate-screen-shake">
      {/* Outer Glowing Pulsing Container */}
      <div className="relative flex flex-col items-center justify-center animate-pop-in">
        {/* Radial Red Glow */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-[#FF2E93]/30 blur-3xl pointer-events-none" />

        {/* Comic/Arcade Giant X Emblem */}
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-b from-[#FF2E93] via-[#D10056] to-[#8F003A] border-4 border-white shadow-[0_0_50px_rgba(255,46,147,0.9)] flex items-center justify-center">
          <span className="text-[140px] md:text-[180px] font-black text-white leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] font-['Fredoka',sans-serif]">
            ✕
          </span>
        </div>

        {/* Wrong Label Banner */}
        <div className="mt-4 px-8 py-2 rounded-full bg-black/90 border-2 border-[#FF2E93] shadow-[0_0_20px_rgba(255,46,147,0.8)]">
          <span className="text-xl md:text-2xl font-black text-[#FFD600] tracking-widest uppercase font-['Outfit',sans-serif]">
            SALAH!
          </span>
        </div>
      </div>
    </div>
  );
};
