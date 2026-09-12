import { useSystemStore } from '../../store/useSystem';

export function CRTOverlay() {
  const crtFlicker = useSystemStore((s) => s.crtFlicker);
  const motion = useSystemStore((s) => s.motion);

  const isMotionOff =
    motion === 'off' ||
    (motion === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

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
          animation: isMotionOff || !crtFlicker ? 'none' : 'refresh 8s linear infinite',
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
      {/* RGB phosphor stripe mask — vertical sub-pixel emulation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            rgba(255,0,0,0.03) 0px,
            rgba(0,255,0,0.03) 1px,
            rgba(0,0,255,0.03) 2px,
            transparent 3px
          )`,
          opacity: 0.4,
          mixBlendMode: 'screen',
        }}
      />
      {/* Phosphor flicker (optional) — more subtle range */}
      {crtFlicker && !isMotionOff && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            willChange: 'opacity',
            background: 'var(--phosphor)',
            animation: 'flicker var(--crt-flicker-speed, 0.4s) infinite',
          }}
        />
      )}
      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.02; }
          50%      { opacity: 0.00; }
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
