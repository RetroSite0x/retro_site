import { useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { useVFSStore } from '../../store/useVFS';
import { getRegisteredCommands } from './CommandRegistry';
import { getNode, normalizePath } from '../../lib/vfs';
import styles from '../../styles/components/terminal.module.css';

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

  const username = 'guest';
  const hostname = 'retro';
  const prompt = `${username}@${hostname}:${currentPath}$ `;

  const handleAutocomplete = useCallback(() => {
    const store = useTerminalStore.getState();
    const input = store.currentInput;
    const cpos = store.cursorPos;

    // Get text before cursor to determine what to complete
    const textBeforeCursor = input.slice(0, cpos);
    const textAfterCursor = input.slice(cpos);

    // Split on whitespace — but preserve leading spaces on the last token
    const trimmedBefore = textBeforeCursor.trimStart();
    const leadingSpace = textBeforeCursor.length - trimmedBefore.length;
    const parts = trimmedBefore.split(/\s+/);

    if (!trimmedBefore || parts.length <= 1) {
      // ── Complete command name ──
      const prefix = (parts[0] || '').toLowerCase();
      const commands = getRegisteredCommands().filter((c) =>
        c.startsWith(prefix) && c.length > prefix.length
      );

      if (commands.length === 0) {
        return;
      }

      if (commands.length === 1) {
        const newInput =
          ' '.repeat(leadingSpace) + commands[0] + ' ' + textAfterCursor;
        store.setInput(newInput);
      } else {
        store.appendHistory({
          type: 'output',
          content: commands.join('  '),
          timestamp: Date.now(),
        });
      }
      return;
    }

    // ── Complete file/directory path ──
    const pathPrefix = parts[parts.length - 1] || '';
    const restBeforeParts = parts.slice(0, -1).join(' ');

    // Determine directory and filename prefix
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
      store.appendHistory({
        type: 'output',
        content: matches.join('  '),
        timestamp: Date.now(),
      });
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // ── Ctrl+ shortcuts ──
      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'l':
          case 'L':
            e.preventDefault();
            useTerminalStore.getState().clear();
            return;
          case 'c':
          case 'C':
            e.preventDefault();
            useTerminalStore.getState().appendHistory({
              type: 'output',
              content: '^C',
              timestamp: Date.now(),
            });
            useTerminalStore.getState().setInput('');
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
            return;
          case 'k':
          case 'K':
            e.preventDefault();
            useTerminalStore.getState().deleteLineAfterCursor();
            return;
          case 'w':
          case 'W':
            e.preventDefault();
            useTerminalStore.getState().deleteWordBeforeCursor();
            return;
        }
      }

      // ── Tab autocomplete ──
      if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
        return;
      }

      // ── Regular keys ──
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(currentInput);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteBeforeCursor();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveCursorLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveCursorRight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        historyUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyDown();
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
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.inputLine} onClick={() => inputRef.current?.focus()}>
      <span className={styles.prompt}>{prompt}</span>
      <span className={styles.inputText}>
        {currentInput.slice(0, cursorPos)}
        <span className={styles.cursor}>&nbsp;</span>
        {currentInput.slice(cursorPos)}
      </span>
      {/* Hidden input for focus management */}
      <input
        ref={inputRef}
        type="text"
        className={styles.hiddenInput}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Terminal input"
      />
    </div>
  );
}
