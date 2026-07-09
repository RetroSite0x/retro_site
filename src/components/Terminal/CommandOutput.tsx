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
    <div className={styles.output}>
      {history.map((entry, i) => {
        if (entry.type === 'input') {
          const prompt = `${username}@${hostname}:${currentPath}$ `;
          return (
            <div key={i} className={styles.inputLine}>
              <span className={styles.prompt}>{prompt}</span>
              <span className={styles.inputText}>{entry.content}</span>
            </div>
          );
        }

        if (entry.type === 'error') {
          return (
            <div key={i} className={styles.errorLine}>
              {entry.content}
            </div>
          );
        }

        if (entry.type === 'system') {
          return (
            <div key={i} className={styles.systemLine}>
              {entry.content}
            </div>
          );
        }

        // output
        if (!entry.content) return <div key={i} className={styles.outputLine}>&nbsp;</div>;
        return (
          <div key={i} className={styles.outputLine}>
            <pre className={styles.outputPre}>{entry.content}</pre>
          </div>
        );
      })}
    </div>
  );
}
