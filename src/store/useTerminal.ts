import { create } from 'zustand';
import type { HistoryEntry } from '../types/terminal';
import { executeCommand } from '../components/Terminal/CommandRegistry';

const MAX_HISTORY = 500;
const HISTORY_KEY = 'nabilos-terminal-history';

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-200)));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

interface TerminalState {
  history: HistoryEntry[];
  currentInput: string;
  cursorPos: number;
  commandHistory: string[];
  historyIndex: number;

  appendHistory: (entry: HistoryEntry) => void;
  executeCommand: (input: string) => void;
  setInput: (input: string) => void;
  setCursorPos: (pos: number) => void;
  insertAtCursor: (char: string) => void;
  deleteBeforeCursor: () => void;
  deleteLineBeforeCursor: () => void;
  deleteLineAfterCursor: () => void;
  deleteWordBeforeCursor: () => void;
  moveCursorLeft: () => void;
  moveCursorRight: () => void;
  historyUp: () => void;
  historyDown: () => void;
  clear: () => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  history: [],
  currentInput: '',
  cursorPos: 0,
  commandHistory: loadHistory(),
  historyIndex: -1,

  appendHistory: (entry) => {
    set((s) => ({
      history: [...s.history, entry].slice(-MAX_HISTORY),
    }));
  },

  executeCommand: (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const store = get();
    store.appendHistory({ type: 'input', content: trimmed, timestamp: Date.now() });

    // Add to command history
    set((s) => {
      const updated = [...s.commandHistory, trimmed].slice(-100);
      saveHistory(updated);
      return {
        commandHistory: updated,
        historyIndex: -1,
        currentInput: '',
        cursorPos: 0,
      };
    });

    // Execute via registry
    const result = executeCommand(trimmed);
    if (result) {
      store.appendHistory({ ...result, timestamp: Date.now() });
    }
  },

  setInput: (input: string) => set({ currentInput: input, cursorPos: input.length }),

  setCursorPos: (pos: number) => {
    set((s) => ({ cursorPos: Math.max(0, Math.min(s.currentInput.length, pos)) }));
  },

  insertAtCursor: (char: string) => {
    set((s) => {
      const newInput =
        s.currentInput.slice(0, s.cursorPos) +
        char +
        s.currentInput.slice(s.cursorPos);
      return { currentInput: newInput, cursorPos: s.cursorPos + char.length };
    });
  },

  deleteBeforeCursor: () => {
    set((s) => {
      if (s.cursorPos <= 0) return s;
      const newInput =
        s.currentInput.slice(0, s.cursorPos - 1) +
        s.currentInput.slice(s.cursorPos);
      return { currentInput: newInput, cursorPos: s.cursorPos - 1 };
    });
  },

  deleteLineBeforeCursor: () => {
    set((s) => {
      const after = s.currentInput.slice(s.cursorPos);
      return { currentInput: after, cursorPos: 0 };
    });
  },

  deleteLineAfterCursor: () => {
    set((s) => {
      const before = s.currentInput.slice(0, s.cursorPos);
      return { currentInput: before };
    });
  },

  deleteWordBeforeCursor: () => {
    set((s) => {
      const before = s.currentInput.slice(0, s.cursorPos);
      const after = s.currentInput.slice(s.cursorPos);

      // Scan backwards to find word boundary
      let end = before.length - 1;

      // Skip trailing spaces
      while (end >= 0 && before[end] === ' ') end--;

      // Skip non-space chars (the word)
      while (end >= 0 && before[end] !== ' ') end--;

      const newBefore = before.slice(0, end + 1);
      return { currentInput: newBefore + after, cursorPos: newBefore.length };
    });
  },

  moveCursorLeft: () => {
    set((s) => ({ cursorPos: Math.max(0, s.cursorPos - 1) }));
  },

  moveCursorRight: () => {
    set((s) => ({ cursorPos: Math.min(s.currentInput.length, s.cursorPos + 1) }));
  },

  historyUp: () => {
    set((s) => {
      const newIdx = s.historyIndex === -1
        ? s.commandHistory.length - 1
        : Math.max(0, s.historyIndex - 1);

      if (newIdx < 0 || !s.commandHistory[newIdx]) return s;

      const cmd = s.commandHistory[newIdx];
      return { historyIndex: newIdx, currentInput: cmd, cursorPos: cmd.length };
    });
  },

  historyDown: () => {
    set((s) => {
      if (s.historyIndex === -1) return s;

      const newIdx = s.historyIndex + 1;
      if (newIdx >= s.commandHistory.length) {
        return { historyIndex: -1, currentInput: '', cursorPos: 0 };
      }

      const cmd = s.commandHistory[newIdx];
      return { historyIndex: newIdx, currentInput: cmd, cursorPos: cmd.length };
    });
  },

  clear: () => set({ history: [] }),
}));
