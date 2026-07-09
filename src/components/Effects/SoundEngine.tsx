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
  const bootPhase = useSystemStore((s) => s.bootPhase);
  const hasPlayed = useRef(false);
  const windowCount = useRef(Object.keys(useWindowsStore.getState().windows).length);

  // Play boot sequence when entering boot phase
  useEffect(() => {
    if (bootPhase === 'boot' && soundEnabled && !hasPlayed.current) {
      hasPlayed.current = true;
      soundEngine.bootSequence();
    }

    // Reset flag when returning to bios (reboot)
    if (bootPhase === 'bios') {
      hasPlayed.current = false;
    }
  }, [bootPhase, soundEnabled]);

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

  return null; // No visual output
}
