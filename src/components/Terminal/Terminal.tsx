import { useRef, useEffect } from 'react';
import { useTerminalStore } from '../../store/useTerminal';
import { CommandOutput } from './CommandOutput';
import { TerminalInput } from './TerminalInput';
import styles from '../../styles/components/terminal.module.css';

export function Terminal() {
  const history = useTerminalStore((s) => s.history);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    <div ref={terminalRef} className={styles.terminal} onClick={handleClick}>
      <CommandOutput history={history} />
      <TerminalInput />
    </div>
  );
}
