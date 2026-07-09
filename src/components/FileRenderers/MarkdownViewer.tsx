import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface MarkdownViewerProps {
  filePath: string;
}

interface LineEntry {
  type: 'h1' | 'h2' | 'h3' | 'code' | 'text';
  text: string;
}

function parseMarkdown(content: string): LineEntry[] {
  const lines = content.split('\n');
  const entries: LineEntry[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        codeLines.push(line);
        entries.push({ type: 'code', text: codeLines.join('\n') });
        codeLines = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLines = [line];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      entries.push({ type: 'h3', text: line.slice(4) });
    } else if (line.startsWith('## ')) {
      entries.push({ type: 'h2', text: line.slice(3) });
    } else if (line.startsWith('# ')) {
      entries.push({ type: 'h1', text: line.slice(2) });
    } else {
      entries.push({ type: 'text', text: line });
    }
  }

  // If code block was never closed, flush accumulated lines
  if (inCodeBlock && codeLines.length > 0) {
    entries.push({ type: 'code', text: codeLines.join('\n') });
  }

  return entries;
}

export function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

  const entries = useMemo(() => {
    if (content === null) return [];
    return parseMarkdown(content);
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
        {entries.map((entry, i) => {
          switch (entry.type) {
            case 'h1':
              return <div key={i} className={styles.mdH1}>{entry.text}</div>;
            case 'h2':
              return <div key={i} className={styles.mdH2}>{entry.text}</div>;
            case 'h3':
              return <div key={i} className={styles.mdH3}>{entry.text}</div>;
            case 'code':
              return <pre key={i} className={styles.mdCode}>{entry.text}</pre>;
            default:
              return <pre key={i} className={styles.filePre}>{entry.text}</pre>;
          }
        })}
      </div>
    </div>
  );
}
