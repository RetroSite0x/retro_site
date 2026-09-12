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
      {/* SVG noise filter definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      {/* Film grain noise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#noiseFilter)',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />
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
    </div>
  );
}
