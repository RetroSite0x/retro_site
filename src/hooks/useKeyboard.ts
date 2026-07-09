import { useEffect } from 'react';
import { useWindowsStore } from '../store/useWindows';
import { soundEngine } from '../lib/sound';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useKeyboard() {
  useEffect(() => {
    const keyBuffer: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Track key presses for Konami code detection
      keyBuffer.push(e.code);
      if (keyBuffer.length > 10) {
        keyBuffer.shift();
      }
      if (keyBuffer.length === 10 && keyBuffer.every((k, i) => k === KONAMI_CODE[i])) {
        useWindowsStore.getState().openWindow({
          title: 'secret',
          content: { type: 'directoryViewer', path: '/secret' },
          width: 560,
          height: 380,
        });
        soundEngine.bootChirp();
        keyBuffer.length = 0;
        return;
      }

      // Alt+Tab: cycle through windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const store = useWindowsStore.getState();
        const windows = Object.values(store.windows).filter(w => !w.isMinimized);
        if (windows.length === 0) return;

        const currentIdx = windows.findIndex(w => w.id === store.focusedId);
        const nextIdx = (currentIdx + 1) % windows.length;
        store.focusWindow(windows[nextIdx].id);
      }

      // Escape: close focused window
      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
        const store = useWindowsStore.getState();
        if (store.focusedId) {
          store.closeWindow(store.focusedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
