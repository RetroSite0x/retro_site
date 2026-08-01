import { useRef, useEffect } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { CommandOutput } from './CommandOutput';
import { TerminalInput } from './TerminalInput';
import styles from '../../styles/components/terminal.module.css';

const MOTD = `
AI ENGINEER WORKSTATION v2.4
============================
Last login: ${new Date().toLocaleString()} from 192.168.1.42

Type 'help' for available commands.
Type 'projects' to view AI, ML, and systems work.
Type 'about' to learn about Ann Naser Nabil.
`;

let motdShown = false;

export function Terminal() {
  const history = useTerminalStore((s) => s.history);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
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
      <CommandOutput history={history} />
      <TerminalInput />
    </div>
  );
}
