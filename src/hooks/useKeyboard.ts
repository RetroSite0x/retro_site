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
        const target = e.target as HTMLElement | null;
        const isEditable =
          !!target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        const menuOpen = document.querySelector('[role="menubar"] [aria-expanded="true"]');
        if (isEditable || menuOpen) return;
        const store = useWindowsStore.getState();
        if (store.focusedId) {
          store.closeWindow(store.focusedId);
        }
      }

      // Clipboard shortcuts (Ctrl+C/V/X/A)
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const isInput = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

        if (e.key === 'c' && !isInput) {
          const selection = window.getSelection()?.toString();
          if (selection) {
            navigator.clipboard?.writeText(selection).catch(() => {});
          }
        }

        if (e.key === 'x' && isInput) {
          const input = target as HTMLInputElement | HTMLTextAreaElement;
          const start = input.selectionStart ?? 0;
          const end = input.selectionEnd ?? 0;
          if (start !== end) {
            const text = input.value.substring(start, end);
            navigator.clipboard?.writeText(text).catch(() => {});
            input.value = input.value.substring(0, start) + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start;
          }
        }

        if (e.key === 'v' && isInput) {
          navigator.clipboard?.readText().then(text => {
            const input = target as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;
            input.value = input.value.substring(0, start) + text + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + text.length;
          }).catch(() => {});
        }

        if (e.key === 'a' && isInput) {
          const input = target as HTMLInputElement | HTMLTextAreaElement;
          input.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
