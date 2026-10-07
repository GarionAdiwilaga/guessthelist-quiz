import React, { useEffect, useRef } from 'react';
import { audioService } from '../../services/audio';

interface TitleScreenProps {
  titleLogoUrl: string | null;
  isTransparent: boolean;
  bgmOffsetMs?: number;
}

function getHeartbeatTransform(phase: number): { scale: number; glowIntensity: number } {
  let scale = 1.0;
  let glowIntensity = 0.3;

  if (phase < 0.12) {
    // Pulse 1 rise: 0 -> 0.12
    const p = phase / 0.12;
    scale = 1.0 + 0.085 * Math.sin(p * Math.PI * 0.5);
    glowIntensity = 0.3 + 0.7 * p;
  } else if (phase < 0.22) {
    // Pulse 1 fall & dip: 0.12 -> 0.22
    const p = (phase - 0.12) / 0.10;
    scale = 1.085 - 0.10 * p;
    glowIntensity = 1.0 - 0.6 * p;
  } else if (phase < 0.34) {
    // Pulse 2 rise: 0.22 -> 0.34
    const p = (phase - 0.22) / 0.12;
    scale = 0.985 + 0.06 * Math.sin(p * Math.PI * 0.5);
    glowIntensity = 0.4 + 0.4 * p;
  } else if (phase < 0.46) {
    // Pulse 2 settle: 0.34 -> 0.46
    const p = (phase - 0.34) / 0.12;
    scale = 1.045 - 0.045 * p;
    glowIntensity = 0.8 - 0.5 * p;
  } else {
    // Rest
    scale = 1.0;
    glowIntensity = 0.3;
  }

  return { scale, glowIntensity };
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  titleLogoUrl,
  isTransparent,
  bgmOffsetMs = 0
}) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const circle0Ref = useRef<SVGCircleElement>(null);
  const circle1Ref = useRef<SVGCircleElement>(null);
  const circle2Ref = useRef<SVGCircleElement>(null);
  const circle3Ref = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let animId: number;
    const TEMPO_BPM = 177;
    const BEAT_DURATION = 60 / TEMPO_BPM; // ~0.338983s
    const BAR_DURATION = BEAT_DURATION * 4; // ~1.355932s (1 bar = 4 beats)
    const CYCLE_DURATION = BAR_DURATION * 4; // ~5.423728s (4 bars ripple cycle)
    const BASE_OFFSET = 0.030; // 30ms track audio onset calibration

    const circleRefs = [circle0Ref, circle1Ref, circle2Ref, circle3Ref];
    const fallbackStartTime = performance.now();

    function renderFrame() {
      let t: number;
      const isAudioActive = audioService.isBgmActive();

      if (isAudioActive) {
        const audioTime = audioService.getBgmCurrentTime();
        const userOffsetSec = bgmOffsetMs / 1000;
        t = audioTime - BASE_OFFSET - userOffsetSec;
      } else {
        const elapsed = (performance.now() - fallbackStartTime) / 1000;
        t = elapsed;
      }

      // Safe positive time
      const positiveTime = ((t % 10000) + 10000) % 10000;

      // 1. Heartbeat calculation (1 beat per bar = BAR_DURATION)
      const barTime = positiveTime % BAR_DURATION;
      const phase = barTime / BAR_DURATION; // 0.0 to 1.0

      const { scale, glowIntensity } = getHeartbeatTransform(phase);

      if (logoRef.current) {
        logoRef.current.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
        const cyanAlpha = (glowIntensity * 0.7).toFixed(2);
        const magAlpha = (glowIntensity * 0.5).toFixed(2);
        logoRef.current.style.filter = `drop-shadow(0 0 25px rgba(0, 240, 255, ${cyanAlpha})) drop-shadow(0 0 45px rgba(255, 46, 147, ${magAlpha}))`;
      }

      if (glowRef.current) {
        glowRef.current.setAttribute('r', (240 * scale).toFixed(1));
        glowRef.current.setAttribute('opacity', (0.12 + glowIntensity * 0.12).toFixed(2));
      }

      // 2. Ripple calculation (4 waves staggered by BAR_DURATION)
      const cycleTime = positiveTime % CYCLE_DURATION;

      for (let i = 0; i < 4; i++) {
        const circle = circleRefs[i].current;
        if (!circle) continue;

        const waveStartTime = i * BAR_DURATION;
        const waveAge = ((cycleTime - waveStartTime + CYCLE_DURATION) % CYCLE_DURATION);
        const progress = waveAge / CYCLE_DURATION; // 0.0 to 1.0

        // Expanding radius from 50 to 620
        const r = 50 + progress * 570;
        // Fade out smoothly as it expands
        const opacity = Math.max(0, 0.85 * Math.pow(1 - progress, 1.4));
        const strokeWidth = 2.8 * (1 - 0.7 * progress);

        circle.setAttribute('r', r.toFixed(1));
        circle.setAttribute('opacity', opacity.toFixed(3));
        circle.setAttribute('stroke-width', strokeWidth.toFixed(2));
      }

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [bgmOffsetMs]);

  return (
    <div
      className={`h-screen w-full flex flex-col items-center justify-between py-6 sm:py-8 px-4 sm:px-6 relative select-none overflow-hidden ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-[#0A0D28] via-[#101648] to-[#080B22]'
      }`}
    >
      {/* Soft Ambient Background Orbs */}
      {!isTransparent && (
        <>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#FF2E93]/10 blur-3xl pointer-events-none z-0" />
        </>
      )}

      {/* osu! Style Concentric Vector Ripple Circles (Direct Audio Clock Driven) */}
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

        {/* Center ambient glow synchronized with heartbeat */}
        <circle ref={glowRef} cx="50%" cy="50%" r="240" fill="url(#osuCenterGlow)" />

        {/* 4 Concentric expanding ripples locked to BGM currentTime */}
        <circle ref={circle0Ref} cx="50%" cy="50%" r="50" fill="none" stroke="#00F0FF" strokeWidth="2.8" opacity="0" />
        <circle ref={circle1Ref} cx="50%" cy="50%" r="50" fill="none" stroke="#FF2E93" strokeWidth="2.8" opacity="0" />
        <circle ref={circle2Ref} cx="50%" cy="50%" r="50" fill="none" stroke="#9D00FF" strokeWidth="2.8" opacity="0" />
        <circle ref={circle3Ref} cx="50%" cy="50%" r="50" fill="none" stroke="#FFD600" strokeWidth="2.8" opacity="0" />
      </svg>

      {/* Top Banner Tag */}
      <div className="z-10 flex items-center space-x-2 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00F0FF] border border-white/20">
        <span className="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase font-['Outfit',sans-serif]">
          MINIGAMES • FAMILY WIBU 100 • PLAZA COSPLAY DAY
        </span>
      </div>

      {/* Center Hero Title with Heartbeat Pulse Synced with Audio Beat */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center text-center my-4">
        <div ref={logoRef} className="max-w-xl px-4 flex flex-col items-center justify-center will-change-transform">
          {titleLogoUrl ? (
            <img
              src={titleLogoUrl}
              alt="Game Title Logo"
              className="max-h-64 sm:max-h-80 w-auto object-contain mx-auto"
            />
          ) : (
            <div className="flex flex-col items-center">
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
    </div>
  );
};
