import { useEffect } from 'react';
import { useSystemStore } from '../store/useSystem';

/**
 * Applies the effective motion state to `document.documentElement.dataset.motion`.
 * Resolution logic:
 *   'auto' → follows `prefers-reduced-motion` (reduce → 'off', else → 'on')
 *   'on'   → forces animations on ('on')
 *   'off'  → forces animations off ('off')
 *
 * Reacts to both the store value and the media query changing at runtime.
 */
export function useMotion() {
  const motion = useSystemStore((s) => s.motion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    function apply() {
      let effective: 'on' | 'off';
      if (motion === 'on') {
        effective = 'on';
      } else if (motion === 'off') {
        effective = 'off';
      } else {
        // 'auto' — defer to OS media query
        effective = mq.matches ? 'off' : 'on';
      }
      document.documentElement.dataset.motion = effective;
    }

    apply();

    // Only listen for OS preference changes when in 'auto' mode
    if (motion !== 'auto') return;

    const handler = () => apply();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [motion]);
}
