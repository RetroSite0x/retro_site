import { useEffect } from 'react';
import { useTerminalStore } from '../store/useTerminal';
import { useSystemStore } from '../store/useSystem';
import { soundEngine } from '../lib/sound';

/**
 * Routes stray keystrokes to the terminal when nothing else has focus.
 * If the page regains focus (or the terminal lost it) and the user starts
 * typing, the keystroke is inserted into the terminal instead of vanishing.
 */
export function useTypeToTerminal(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      if (e.key.length !== 1) return;

      const input = document.querySelector<HTMLInputElement>(
        'input[aria-label="Terminal input"]'
      );
      if (!input) return;

      e.preventDefault();
      input.focus();
      useTerminalStore.getState().insertAtCursor(e.key);
      if (useSystemStore.getState().soundEnabled) soundEngine.keyClick();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
