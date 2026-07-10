import type { HistoryEntry } from '../../types/terminal';
import { useVFSStore } from '../../store/useVFS';
import styles from '../../styles/components/terminal.module.css';

interface CommandOutputProps {
  history: HistoryEntry[];
}

export function CommandOutput({ history }: CommandOutputProps) {
  const currentPath = useVFSStore((s) => s.currentPath);
  const username = 'guest';
  const hostname = 'retro';

  return (
    <div className={styles.output} role="log" aria-label="Terminal output" aria-live="polite">
      {history.map((entry, i) => {
        if (entry.type === 'input') {
          const prompt = `${username}@${hostname}:${currentPath}$ `;
          return (
            <div key={i} className={styles.inputLine}>
              <span className={styles.prompt} aria-hidden="true">{prompt}</span>
              <span className={styles.inputText}>{entry.content}</span>
            </div>
          );
        }

        if (entry.type === 'error') {
          return (
            <div key={i} className={styles.errorLine} role="alert" aria-live="assertive">
              {entry.content}
            </div>
          );
        }

        if (entry.type === 'system') {
          return (
            <div key={i} className={styles.systemLine} aria-label="System message">
              {entry.content}
            </div>
          );
        }

        // output
        if (!entry.content) return <div key={i} className={styles.outputLine} aria-hidden="true">&nbsp;</div>;
        return (
          <div key={i} className={styles.outputLine}>
            <pre className={styles.outputPre} role="document" tabIndex={-1}>{entry.content}</pre>
          </div>
        );
      })}
    </div>
  );
}
