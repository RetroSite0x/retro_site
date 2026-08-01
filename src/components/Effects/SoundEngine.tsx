import { useEffect, useRef } from 'react';
import { useSystemStore } from '../../store/useSystem';
import { useWindowsStore } from '../../store/useWindows';
import { soundEngine } from '../../lib/sound';

/**
 * React component wrapper for the SoundEngine.
 * Must be mounted once inside the app.
 * Listens for system sound-enabled state and plays boot sequence.
 */
export function SoundEngine() {
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const hasUserGesture = useRef(false);
  const windowCount = useRef(Object.keys(useWindowsStore.getState().windows).length);

  useEffect(() => {
    const markUserGesture = () => {
      hasUserGesture.current = true;
    };

    window.addEventListener('pointerdown', markUserGesture, { once: true });
    window.addEventListener('keydown', markUserGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', markUserGesture);
      window.removeEventListener('keydown', markUserGesture);
    };
  }, []);

  // Play sounds when windows open/close
  useEffect(() => {
    const unsub = useWindowsStore.subscribe((state) => {
      const currentCount = Object.keys(state.windows).length;
      if (soundEnabled && hasUserGesture.current) {
        if (currentCount > windowCount.current) {
          soundEngine.windowOpen();
        } else if (currentCount < windowCount.current) {
          soundEngine.windowClose();
        }
      }
      windowCount.current = currentCount;
    });
    return unsub;
  }, [soundEnabled]);

  return null; // No visual output
}
