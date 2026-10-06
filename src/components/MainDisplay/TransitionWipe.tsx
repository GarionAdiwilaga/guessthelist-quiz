import React, { useEffect, useState } from 'react';

interface TransitionWipeProps {
  wipeTimestamp: number | null;
}

export const TransitionWipe: React.FC<TransitionWipeProps> = ({ wipeTimestamp }) => {
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (!wipeTimestamp) return;

    setIsWiping(true);
    const timer = setTimeout(() => {
      setIsWiping(false);
    }, 900); // 900ms total wipe cycle

    return () => clearTimeout(timer);
  }, [wipeTimestamp]);

  if (!isWiping) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Primary Holographic Cyan/Magenta Diagonal Wipe Wave */}
      <div className="absolute inset-y-0 -inset-x-[30%] w-[160%] bg-gradient-to-r from-transparent via-[#00F0FF] via-[#FF2E93] to-transparent opacity-95 animate-wipe-sweep shadow-[0_0_80px_rgba(0,240,255,0.8)]" />

      {/* Core Solid Holographic Block */}
      <div className="absolute inset-y-0 -inset-x-[20%] w-[140%] bg-gradient-to-r from-[#00F0FF] via-[#FF2E93] via-[#8C00FF] to-[#00F0FF] animate-wipe-sweep-delay shadow-[0_0_100px_rgba(255,46,147,0.9)] flex items-center justify-center">
        <div className="text-white text-3xl md:text-5xl font-black tracking-widest uppercase italic drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-['Outfit',sans-serif] animate-pulse">
          FAMILY WIBU 100
        </div>
      </div>

      {/* Sparkling Edge Line */}
      <div className="absolute inset-y-0 -inset-x-[15%] w-[130%] bg-white/40 blur-sm animate-wipe-sweep" />
    </div>
  );
};
