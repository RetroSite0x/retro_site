import { create } from 'zustand';
import type { HistoryEntry } from '../types/terminal';
import { executeCommand } from '../components/Terminal/CommandRegistry';

const MAX_HISTORY = 500;

interface TerminalState {
  history: HistoryEntry[];
  currentInput: string;
  cursorPos: number;
  commandHistory: string[];
  historyIndex: number;

  appendHistory: (entry: HistoryEntry) => void;
  executeCommand: (input: string) => void;
  setInput: (input: string) => void;
  insertAtCursor: (char: string) => void;
  deleteBeforeCursor: () => void;
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
  commandHistory: [],
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
    set((s) => ({
      commandHistory: [...s.commandHistory, trimmed].slice(-100),
      historyIndex: -1,
      currentInput: '',
      cursorPos: 0,
    }));

    // Execute via registry
    const result = executeCommand(trimmed);
    if (result) {
      store.appendHistory({ ...result, timestamp: Date.now() });
    }
  },

  setInput: (input: string) => set({ currentInput: input, cursorPos: input.length }),

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
