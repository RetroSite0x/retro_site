import { useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { useVFSStore } from '../../store/useVFS';
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
      useTerminalStore.getState().setInput(currentInput); // Move cursor to start
    } else if (e.key === 'End') {
      e.preventDefault();
      // Move cursor to end
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      insertAtCursor(e.key);
    }
  }, [currentInput, executeCommand, deleteBeforeCursor, insertAtCursor, moveCursorLeft, moveCursorRight, historyUp, historyDown]);

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
