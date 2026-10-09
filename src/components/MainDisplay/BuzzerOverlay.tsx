import React, { useEffect, useState, useRef } from 'react';

interface BuzzerOverlayProps {
  triggerTimestamp: number | null;
  durationMs?: number;
}

export const BuzzerOverlay: React.FC<BuzzerOverlayProps> = ({
  triggerTimestamp,
  durationMs = 1200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const lastHandledRef = useRef<number>(Math.max(Date.now(), triggerTimestamp || 0));

  useEffect(() => {
    if (!triggerTimestamp) {
      setIsVisible(false);
      return;
    }
    if (triggerTimestamp <= lastHandledRef.current) return;
    lastHandledRef.current = triggerTimestamp;

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
        <div className="absolute w-[450px] h-[450px] rounded-full bg-[#FF2E93]/35 blur-3xl pointer-events-none" />

        {/* Comic/Arcade Giant X Emblem (No "Salah" label) */}
        <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-b from-[#FF2E93] via-[#D10056] to-[#8F003A] border-4 border-white shadow-[0_0_60px_rgba(255,46,147,0.95)] flex items-center justify-center">
          <span className="text-[130px] sm:text-[170px] font-black text-white leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] font-['Fredoka',sans-serif]">
            ✕
          </span>
        </div>
      </div>
    </div>
  );
};
