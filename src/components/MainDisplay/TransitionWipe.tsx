import React, { useEffect, useState, useRef } from 'react';
import { audioService } from '../../services/audio';

interface TransitionWipeProps {
  wipeTimestamp: number | null;
  onWipeCovered?: () => void;
}

export const TransitionWipe: React.FC<TransitionWipeProps> = ({
  wipeTimestamp,
  onWipeCovered
}) => {
  const [phase, setPhase] = useState<'idle' | 'covering' | 'uncovering'>('idle');

  const lastWipeTimestampRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!wipeTimestamp || wipeTimestamp <= lastWipeTimestampRef.current) return;
    lastWipeTimestampRef.current = wipeTimestamp;

    // Start Phase 1: Wipe In / Covering (0ms to 1000ms)
    setPhase('covering');

    // Play woosh transition SFX
    try {
      audioService.playWooshSound();
    } catch {
      // ignore
    }

    // At 1000ms: screen is completely covered -> swap content!
    const coverTimer = setTimeout(() => {
      if (onWipeCovered) {
        onWipeCovered();
      }
      setPhase('uncovering');
    }, 1000);

    // At 2000ms: transition is complete -> return to idle
    const endTimer = setTimeout(() => {
      setPhase('idle');
    }, 2000);

    return () => {
      clearTimeout(coverTimer);
      clearTimeout(endTimer);
    };
  }, [wipeTimestamp, onWipeCovered]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* 2-Second Sequential Holographic Cyan-Magenta Curtain */}
      <div
        className={`absolute inset-0 w-full h-full bg-gradient-to-r from-[#00F0FF] via-[#FF2E93] via-[#8C00FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_120px_rgba(0,240,255,0.9)] ${
          phase === 'covering'
            ? 'animate-wipe-in'
            : 'animate-wipe-out'
        }`}
      >
        {/* Holographic Speedlines and Shimmer */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#FFFFFF,#FFFFFF_2px,transparent_2px,transparent_20px)]" />

        {/* Center Glowing Banner */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-white text-3xl sm:text-5xl lg:text-6xl font-black tracking-widest uppercase italic drop-shadow-[0_6px_25px_rgba(0,0,0,0.9)] font-['Outfit',sans-serif] animate-pulse">
            FAMILY WIBU 100
          </span>
          <span className="mt-2 text-xs sm:text-sm font-black text-[#FFD600] tracking-widest uppercase bg-black/40 px-4 py-1 rounded-full border border-white/20">
            PLAZA COSPLAY DAY
          </span>
        </div>
      </div>
    </div>
  );
};
