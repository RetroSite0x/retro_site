import { useEffect, useState } from 'react';
import { useSystemStore } from '../../store/useSystem';

export function CRTOverlay() {
  const crtFlicker = useSystemStore((s) => s.crtFlicker);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      aria-hidden="true"
    >
      {/* Finer scanlines — 1px transparent, 1px overlay for subtlety */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'opacity',
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            var(--phosphor-scanline, rgba(0,0,0,0.12)) 1px,
            var(--phosphor-scanline, rgba(0,0,0,0.12)) 2px
          )`,
        }}
      />
      {/* Horizontal refresh line — a subtle single-line sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'opacity',
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 540px,
            rgba(255,255,255,0.015) 540px,
            rgba(255,255,255,0.015) 542px
          )`,
          animation: reducedMotion || !crtFlicker ? 'none' : 'refresh 8s linear infinite',
        }}
      />
      {/* Vignette — radial gradient darkening edges like a real CRT */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'opacity',
          background: `radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(0,0,0,0.35) 100%
          )`,
        }}
      />
      {/* Subtle phosphor glow on the whole screen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'opacity',
          background: 'var(--phosphor)',
          opacity: 0.02,
        }}
      />
      {/* Phosphor flicker (optional) — more subtle range */}
      {crtFlicker && !reducedMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            willChange: 'opacity',
            background: 'var(--phosphor)',
            animation: 'flicker var(--crt-flicker-speed, 0.15s) infinite',
          }}
        />
      )}
      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes flicker {
          0%   { opacity: 0.02; }
          15%  { opacity: 0.00; }
          30%  { opacity: 0.01; }
          45%  { opacity: 0.02; }
          60%  { opacity: 0.00; }
          75%  { opacity: 0.015; }
          90%  { opacity: 0.01; }
          100% { opacity: 0.02; }
        }
        @keyframes refresh {
          0%   { opacity: 0; }
          10%  { opacity: 0; }
          10.1% { opacity: 0.008; }
          10.5% { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
