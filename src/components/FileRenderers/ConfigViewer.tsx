import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface ConfigViewerProps {
  filePath: string;
}

interface ConfigLine {
  type: 'comment' | 'kv' | 'plain';
  text: string;
  key?: string;
  value?: string;
}

function isKeyValue(line: string): boolean {
  return line.includes(':') && !line.startsWith('#');
}

function splitKeyValue(line: string): { key: string; value: string } {
  const idx = line.indexOf(':');
  return {
    key: line.slice(0, idx).trim(),
    value: line.slice(idx + 1).trim(),
  };
}

function parseConfig(content: string): ConfigLine[] {
  return content.split('\n').map((line) => {
    if (line.trim().startsWith('#')) {
      return { type: 'comment' as const, text: line };
    }
    if (isKeyValue(line)) {
      const { key, value } = splitKeyValue(line);
      return { type: 'kv' as const, text: line, key, value };
    }
    return { type: 'plain' as const, text: line };
  });
}

export function ConfigViewer({ filePath }: ConfigViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

  const lines = useMemo(() => {
    if (content === null) return [];
    return parseConfig(content);
  }, [content]);

  if (content === null) {
    return (
      <div className={styles.fileViewer}>
        <div className={styles.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  return (
    <div className={styles.fileViewer}>
      <div className={styles.fileHeader}>
        <span className={styles.filePath}>{filePath}</span>
      </div>
      <div className={styles.fileContent}>
        <table className={styles.configTable}>
          <tbody>
            {lines.map((line, i) => {
              if (line.type === 'comment') {
                return (
                  <tr key={i}>
                    <td colSpan={2} className={styles.configComment}>{line.text}</td>
                  </tr>
                );
              }
              if (line.type === 'kv') {
                return (
                  <tr key={i}>
                    <td className={styles.configKey}>{line.key}</td>
                    <td className={styles.configValue}>{line.value}</td>
                  </tr>
                );
              }
              // Plain line
              return (
                <tr key={i}>
                  <td colSpan={2} className={styles.filePre}>{line.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
