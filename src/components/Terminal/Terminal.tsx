import { useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { CommandOutput } from './CommandOutput';
import { TerminalInput } from './TerminalInput';
import { TerminalCRT } from '../Effects/TerminalCRT';
import { SnakeGame } from '../Snake/SnakeGame';
import styles from '../../styles/components/terminal.module.css';

const MOTD = `
NABIL/86 v2.4 — Bangla NLP Edition
====================================
Last login: ${new Date().toLocaleString()} from 192.168.1.42

Type 'help' for available commands.
Type 'about' to learn about Ann Naser Nabil.
`;

let motdShown = false;

export function Terminal() {
  const history = useTerminalStore((s) => s.history);
  const activeGame = useTerminalStore((s) => s.activeGame);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGameExit = useCallback((score: number) => {
    const store = useTerminalStore.getState();
    store.endGame();
    store.appendHistory({
      type: 'system',
      content: `snake: game ended, final score ${score}.`,
      timestamp: Date.now(),
    });
  }, []);

  // Show MOTD once on first mount
  useEffect(() => {
    if (!motdShown) {
      motdShown = true;
      const store = useTerminalStore.getState();
      if (store.history.length === 0) {
        for (const line of MOTD.split('\n')) {
          store.appendHistory({
            type: 'system',
            content: line,
            timestamp: Date.now(),
          });
        }
      }
    }
  }, []);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleClick = () => {
    terminalRef.current?.querySelector<HTMLElement>('input')?.focus();
  };

  return (
    <div
      ref={terminalRef}
      className={styles.terminal}
      onClick={handleClick}
      role="region"
      aria-label="Terminal"
      aria-live="polite"
      aria-atomic="false"
    >
      <div ref={scrollRef} className={styles.terminalScroll}>
        <CommandOutput history={history} />
        <TerminalInput />
      </div>
      {activeGame === 'snake' && (
        <div className={styles.gameOverlay}>
          <SnakeGame onExit={handleGameExit} />
        </div>
      )}
      <TerminalCRT />
    </div>
  );
}
