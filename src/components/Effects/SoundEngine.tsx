import { useEffect, useRef } from 'react';
import { useSystemStore } from '../../store/useSystem';
import { useWindowsStore } from '../../store/useWindows';
import { soundEngine } from '../../lib/sound';

/**
 * React component wrapper for the SoundEngine.
 * Must be mounted once inside the app.
 * Listens for system sound-enabled state and window open/close events.
 */
export function SoundEngine() {
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const volume = useSystemStore((s) => s.volume);
  const windowCount = useRef(Object.keys(useWindowsStore.getState().windows).length);

  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const unlock = () => soundEngine.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Play sounds when windows open/close
  useEffect(() => {
    const unsub = useWindowsStore.subscribe((state) => {
      const currentCount = Object.keys(state.windows).length;
      if (soundEnabled) {
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

  return null;
}
