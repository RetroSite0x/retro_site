import { useSystemStore } from '../../store/useSystem';

export function CRTOverlay() {
  const crtFlicker = useSystemStore((s) => s.crtFlicker);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            var(--phosphor-scanline, rgba(0,0,0,0.12)) 2px,
            var(--phosphor-scanline, rgba(0,0,0,0.12)) 4px
          )`,
        }}
      />
      {/* Phosphor flicker (optional) */}
      {crtFlicker && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            background: 'var(--phosphor)',
            animation: 'flicker var(--crt-flicker-speed, 0.15s) infinite',
          }}
        />
      )}
      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes flicker {
          0%   { opacity: 0.03; }
          10%  { opacity: 0.01; }
          20%  { opacity: 0.04; }
          30%  { opacity: 0.00; }
          40%  { opacity: 0.03; }
          50%  { opacity: 0.01; }
          60%  { opacity: 0.04; }
          70%  { opacity: 0.02; }
          80%  { opacity: 0.01; }
          90%  { opacity: 0.03; }
          100% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}
