import { useRef, useEffect, useCallback, useState } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { useSystemStore } from '../../store/useSystem';
import { useVFSStore } from '../../store/useVFS';
import { getRegisteredCommands } from './CommandRegistry';
import { getNode, normalizePath } from '../../lib/vfs';
import { soundEngine } from '../../lib/sound';
import styles from '../../styles/components/terminal.module.css';

interface CycleState {
  matches: string[];
  index: number;
  beforeToken: string;
  afterCursor: string;
  leadingSpace: number;
  snapshot: string;
}

interface ReverseSearchState {
  active: boolean;
  query: string;
  matchIndex: number;
  matches: string[];
  savedInput: string;
  savedCursorPos: number;
}

export function TerminalInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentInput = useTerminalStore((s) => s.currentInput);
  const cursorPos = useTerminalStore((s) => s.cursorPos);
  const currentPath = useVFSStore((s) => s.currentPath);

  const insertAtCursor = useTerminalStore((s) => s.insertAtCursor);
  const deleteBeforeCursor = useTerminalStore((s) => s.deleteBeforeCursor);
  const moveCursorLeft = useTerminalStore((s) => s.moveCursorLeft);
  const moveCursorRight = useTerminalStore((s) => s.moveCursorRight);
  const historyUp = useTerminalStore((s) => s.historyUp);
  const historyDown = useTerminalStore((s) => s.historyDown);
  const executeCommand = useTerminalStore((s) => s.executeCommand);

  const cycleRef = useRef<CycleState | null>(null);
  const [, setCycleTick] = useState(0);

  const [searchState, setSearchState] = useState<ReverseSearchState>({
    active: false,
    query: '',
    matchIndex: -1,
    matches: [],
    savedInput: '',
    savedCursorPos: 0,
  });

  const username = 'guest';
  const hostname = 'retro';
  const prompt = `${username}@${hostname}:${currentPath}$ `;

  function computeCommandMatches(prefix: string): string[] {
    const lower = prefix.toLowerCase();
    return getRegisteredCommands().filter(
      (c) => c.startsWith(lower) && c.length > lower.length
    );
  }

  function computePathMatches(pathPrefix: string): { completed: string; inputBefore: string } | null {
    const vfs = useVFSStore.getState();
    let dirSegment: string;
    let filePrefix: string;

    if (pathPrefix.endsWith('/')) {
      dirSegment = pathPrefix;
      filePrefix = '';
    } else {
      const lastSlash = pathPrefix.lastIndexOf('/');
      if (lastSlash === -1) {
        dirSegment = '';
        filePrefix = pathPrefix;
      } else {
        dirSegment = pathPrefix.slice(0, lastSlash + 1);
        filePrefix = pathPrefix.slice(lastSlash + 1);
      }
    }

    const resolvedDir = normalizePath(dirSegment || '.', vfs.currentPath);
    const dirNode = getNode(vfs.tree, resolvedDir);
    if (!dirNode || dirNode.type !== 'directory') return null;

    const children = dirNode.children ?? [];
    const matches = children
      .filter((child) => child.name.startsWith(filePrefix))
      .map((child) =>
        child.type === 'directory' ? child.name + '/' : child.name
      );

    if (matches.length !== 1) return null;

    const completed = pathPrefix + matches[0].slice(filePrefix.length);
    const trimmedBefore = currentInput.trimStart();
    const parts = trimmedBefore.split(/\s+/);
    const restBeforeParts = parts.slice(0, -1).join(' ');
    const leadingSpace = currentInput.length - trimmedBefore.length;
    const inputBefore = ' '.repeat(leadingSpace) + restBeforeParts + ' ';
    return { completed, inputBefore };
  }

  function startCycle(
    matches: string[],
    beforeToken: string,
    afterCursor: string,
    leadingSpace: number,
    startIndex: number
  ): void {
    const match = matches[startIndex];
    const newInput = beforeToken + match + afterCursor;
    useTerminalStore.getState().setInput(newInput);
    cycleRef.current = {
      matches,
      index: startIndex,
      beforeToken,
      afterCursor,
      leadingSpace,
      snapshot: newInput,
    };
    setCycleTick((t) => t + 1);
  }

  function clearCycle(): void {
    if (cycleRef.current) {
      cycleRef.current = null;
      setCycleTick((t) => t + 1);
    }
  }

  const handleAutocomplete = useCallback(() => {
    const store = useTerminalStore.getState();
    const input = store.currentInput;
    const cpos = store.cursorPos;

    const textBeforeCursor = input.slice(0, cpos);
    const textAfterCursor = input.slice(cpos);

    const trimmedBefore = textBeforeCursor.trimStart();
    const leadingSpace = textBeforeCursor.length - trimmedBefore.length;
    const parts = trimmedBefore.split(/\s+/);

    const existing = cycleRef.current;
    const isContinuingCycle =
      existing && existing.snapshot === input && textAfterCursor === existing.afterCursor;

    if (isContinuingCycle) {
      const nextIndex = (existing.index + 1) % existing.matches.length;
      startCycle(
        existing.matches,
        existing.beforeToken,
        existing.afterCursor,
        existing.leadingSpace,
        nextIndex
      );
      return;
    }

    clearCycle();

    if (!trimmedBefore || parts.length <= 1) {
      const prefix = parts[0] || '';
      const commands = computeCommandMatches(prefix);

      if (commands.length === 0) return;

      if (commands.length === 1) {
        const newInput =
          ' '.repeat(leadingSpace) + commands[0] + ' ' + textAfterCursor;
        store.setInput(newInput);
      } else {
        startCycle(commands, ' '.repeat(leadingSpace), textAfterCursor, leadingSpace, 0);
      }
      return;
    }

    const pathPrefix = parts[parts.length - 1] || '';
    const restBeforeParts = parts.slice(0, -1).join(' ');

    const result = computePathMatches(pathPrefix);
    if (result) {
      const newInput = result.inputBefore + result.completed + textAfterCursor;
      store.setInput(newInput);
      return;
    }

    let dirSegment: string;
    let filePrefix: string;

    if (pathPrefix.endsWith('/')) {
      dirSegment = pathPrefix;
      filePrefix = '';
    } else {
      const lastSlash = pathPrefix.lastIndexOf('/');
      if (lastSlash === -1) {
        dirSegment = '';
        filePrefix = pathPrefix;
      } else {
        dirSegment = pathPrefix.slice(0, lastSlash + 1);
        filePrefix = pathPrefix.slice(lastSlash + 1);
      }
    }

    const vfs = useVFSStore.getState();
    const resolvedDir = normalizePath(dirSegment || '.', vfs.currentPath);
    const dirNode = getNode(vfs.tree, resolvedDir);
    if (!dirNode || dirNode.type !== 'directory') return;

    const children = dirNode.children ?? [];
    const matches = children
      .filter((child) => child.name.startsWith(filePrefix))
      .map((child) =>
        child.type === 'directory' ? child.name + '/' : child.name
      );

    if (matches.length === 0) return;

    if (matches.length === 1) {
      const completed = pathPrefix + matches[0].slice(filePrefix.length);
      const inputBefore = ' '.repeat(leadingSpace) + restBeforeParts + ' ';
      const newInput = inputBefore + completed + textAfterCursor;
      store.setInput(newInput);
    } else {
      const beforePath = ' '.repeat(leadingSpace) + restBeforeParts + ' ';
      const afterCursor = textAfterCursor;
      const fullMatches = matches.map((m) => pathPrefix + m.slice(filePrefix.length));
      startCycle(fullMatches, beforePath, afterCursor, leadingSpace, 0);
    }
  }, []);

  const handleReverseSearch = useCallback(
    (e: React.KeyboardEvent) => {
      const s = useTerminalStore.getState();

      if (!searchState.active) {
        e.preventDefault();
        const allHistory = s.commandHistory;
        setSearchState({
          active: true,
          query: '',
          matchIndex: -1,
          matches: allHistory,
          savedInput: s.currentInput,
          savedCursorPos: s.cursorPos,
        });
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (searchState.matches.length === 0) return;
        const nextIdx =
          searchState.matchIndex === -1
            ? 0
            : (searchState.matchIndex + 1) % searchState.matches.length;
        const match = searchState.matches[nextIdx];
        s.setInput(match);
        setSearchState((prev) => ({ ...prev, matchIndex: nextIdx, query: prev.query }));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchState.matchIndex >= 0 && searchState.matches[searchState.matchIndex]) {
          s.setInput(searchState.matches[searchState.matchIndex]);
        } else {
          s.setInput(searchState.savedInput);
          s.setCursorPos(searchState.savedCursorPos);
        }
        setSearchState({
          active: false,
          query: '',
          matchIndex: -1,
          matches: [],
          savedInput: '',
          savedCursorPos: 0,
        });
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        s.setInput(searchState.savedInput);
        s.setCursorPos(searchState.savedCursorPos);
        setSearchState({
          active: false,
          query: '',
          matchIndex: -1,
          matches: [],
          savedInput: '',
          savedCursorPos: 0,
        });
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const newQuery = searchState.query + e.key;
        const allHistory = s.commandHistory;
        const filtered = allHistory.filter((cmd) =>
          cmd.toLowerCase().includes(newQuery.toLowerCase())
        );
        const matchIdx = filtered.length > 0 ? 0 : -1;
        if (matchIdx >= 0) {
          s.setInput(filtered[matchIdx]);
        }
        setSearchState((prev) => ({
          ...prev,
          query: newQuery,
          matchIndex: matchIdx,
          matches: filtered,
        }));
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        const newQuery = searchState.query.slice(0, -1);
        if (!newQuery) {
          s.setInput(searchState.savedInput);
          setSearchState((prev) => ({
            ...prev,
            query: '',
            matchIndex: -1,
            matches: prev.matches.length > 0 ? prev.matches : s.commandHistory,
          }));
          return;
        }
        const allHistory = s.commandHistory;
        const filtered = allHistory.filter((cmd) =>
          cmd.toLowerCase().includes(newQuery.toLowerCase())
        );
        const matchIdx = filtered.length > 0 ? 0 : -1;
        if (matchIdx >= 0) {
          s.setInput(filtered[matchIdx]);
        } else {
          s.setInput(searchState.savedInput);
        }
        setSearchState((prev) => ({
          ...prev,
          query: newQuery,
          matchIndex: matchIdx,
          matches: filtered,
        }));
        return;
      }
    },
    [searchState]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        const s = useTerminalStore.getState();
        if (searchState.active) {
          s.setInput(searchState.savedInput);
          s.setCursorPos(searchState.savedCursorPos);
          setSearchState({
            active: false,
            query: '',
            matchIndex: -1,
            matches: [],
            savedInput: '',
            savedCursorPos: 0,
          });
          return;
        }
        if (s.currentInput) {
          s.setInput('');
        }
        clearCycle();
        return;
      }

      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'r':
          case 'R':
            handleReverseSearch(e);
            return;
          case 'l':
          case 'L':
            e.preventDefault();
            useTerminalStore.getState().clear();
            return;
          case 'c':
          case 'C':
            e.preventDefault();
            if (searchState.active) {
              useTerminalStore.getState().setInput(searchState.savedInput);
              setSearchState({
                active: false,
                query: '',
                matchIndex: -1,
                matches: [],
                savedInput: '',
                savedCursorPos: 0,
              });
            } else {
              useTerminalStore.getState().appendHistory({
                type: 'output',
                content: '^C',
                timestamp: Date.now(),
              });
              useTerminalStore.getState().setInput('');
            }
            clearCycle();
            return;
          case 'a':
          case 'A':
            e.preventDefault();
            useTerminalStore.getState().setCursorPos(0);
            return;
          case 'e':
          case 'E':
            e.preventDefault();
            {
              const s = useTerminalStore.getState();
              s.setCursorPos(s.currentInput.length);
            }
            return;
          case 'u':
          case 'U':
            e.preventDefault();
            useTerminalStore.getState().deleteLineBeforeCursor();
            clearCycle();
            return;
          case 'k':
          case 'K':
            e.preventDefault();
            useTerminalStore.getState().deleteLineAfterCursor();
            clearCycle();
            return;
          case 'w':
          case 'W':
            e.preventDefault();
            useTerminalStore.getState().deleteWordBeforeCursor();
            clearCycle();
            return;
        }
      }

      if (searchState.active && e.key !== 'Tab') {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace' || e.key === 'r' || e.key === 'R') {
          handleReverseSearch(e);
          return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          handleReverseSearch(e);
          return;
        }
        e.preventDefault();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        clearCycle();
        executeCommand(currentInput);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteBeforeCursor();
        clearCycle();
        if (useSystemStore.getState().soundEnabled) soundEngine.keyClick();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveCursorLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveCursorRight();
        clearCycle();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        historyUp();
        clearCycle();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyDown();
        clearCycle();
      } else if (e.key === 'Home') {
        e.preventDefault();
        useTerminalStore.getState().setCursorPos(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        const s = useTerminalStore.getState();
        s.setCursorPos(s.currentInput.length);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        insertAtCursor(e.key);
        clearCycle();
        if (useSystemStore.getState().soundEnabled) soundEngine.keyClick();
      }
    },
    [
      currentInput,
      executeCommand,
      deleteBeforeCursor,
      insertAtCursor,
      moveCursorLeft,
      moveCursorRight,
      historyUp,
      historyDown,
      handleAutocomplete,
      handleReverseSearch,
      searchState,
    ]
  );

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as InputEvent).isComposing) return;
    const el = e.currentTarget;
    const value = el.value;
    if (!value) return;
    el.value = '';
    const store = useTerminalStore.getState();
    for (const ch of value) {
      store.insertAtCursor(ch);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, []);

  const ghostText = (() => {
    if (cycleRef.current) return null;
    if (searchState.active) return null;

    const trimmed = currentInput.trimStart();
    const parts = trimmed.split(/\s+/);

    if (parts.length <= 1) {
      const prefix = parts[0] || '';
      if (!prefix) return null;
      const commands = computeCommandMatches(prefix);
      if (commands.length === 1) {
        return commands[0].slice(prefix.length);
      }
    }

    if (parts.length > 1) {
      const pathPrefix = parts[parts.length - 1] || '';
      if (!pathPrefix) return null;
      const result = computePathMatches(pathPrefix);
      if (result) {
        return result.completed.slice(pathPrefix.length);
      }
    }

    return null;
  })();

  const searchPrefix = searchState.active
    ? `(reverse-i-search)\`${searchState.query}': `
    : null;

  return (
    <div className={styles.inputLine} onClick={() => inputRef.current?.focus()}>
      {searchPrefix ? (
        <span className={styles.reverseSearchPrefix}>{searchPrefix}</span>
      ) : (
        <span className={styles.prompt}>{prompt}</span>
      )}
      <span className={styles.inputText}>
        {currentInput.slice(0, cursorPos)}
        <span className={styles.cursor}>&nbsp;</span>
        {currentInput.slice(cursorPos)}
        {ghostText && (
          <span className={styles.ghostText}>{ghostText}</span>
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        className={styles.hiddenInput}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        autoFocus
        aria-label="Terminal input"
      />
    </div>
  );
}
