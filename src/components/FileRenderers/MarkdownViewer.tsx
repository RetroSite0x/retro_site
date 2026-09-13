import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import { coolsize } from '../../lib/fileUtils';
import fm from '../../styles/components/file-manager.module.css';

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
        codeLines.push(line);
        entries.push({ type: 'code', text: codeLines.join('\n') });
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLines = [line];
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }
    if (line.startsWith('### ')) entries.push({ type: 'h3', text: line.slice(4) });
    else if (line.startsWith('## ')) entries.push({ type: 'h2', text: line.slice(3) });
    else if (line.startsWith('# ')) entries.push({ type: 'h1', text: line.slice(2) });
    else entries.push({ type: 'text', text: line });
  }
  if (inCodeBlock && codeLines.length > 0) entries.push({ type: 'code', text: codeLines.join('\n') });
  return entries;
}

export function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);
  const entries = useMemo(() => (content === null ? [] : parseMarkdown(content)), [content]);
  const fileName = filePath.split('/').pop() || filePath;

  if (content === null) {
    return (
      <div className={fm.fileViewer}>
        <div className={fm.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  const totalLines = content.split('\n').length;

  return (
    <div className={fm.fileViewer}>
      {/* Tab bar */}
      <div className={fm.editorTabs}>
        <div className={`${fm.editorTab} ${fm.editorTabActive}`}>
          <span className={fm.editorTabIcon}>{'\u{1F4DD}'}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* Editor toolbar */}
      <div className={fm.editorToolbar}>
        <span style={{ color: 'var(--phosphor-dim)' }}>{filePath}</span>
      </div>

      {/* Markdown rendered content */}
      <div className={fm.mdContent}>
        {entries.map((entry, i) => {
          switch (entry.type) {
            case 'h1': return <div key={i} className={fm.mdH1}>{entry.text}</div>;
            case 'h2': return <div key={i} className={fm.mdH2}>{entry.text}</div>;
            case 'h3': return <div key={i} className={fm.mdH3}>{entry.text}</div>;
            case 'code': return <pre key={i} className={fm.mdCode}>{entry.text}</pre>;
            default: return <div key={i} className={fm.mdText}><pre className={fm.filePre}>{entry.text}</pre></div>;
          }
        })}
      </div>

      {/* Status bar */}
      <div className={fm.editorStatusBar}>
        <div className={fm.editorStatusLeft}>
          <span>Ln {totalLines}, Col 1</span>
          <span>{totalLines} lines</span>
        </div>
        <div className={fm.editorStatusRight}>
          <span>Markdown</span>
          <span>UTF-8</span>
          <span>{content.length > 0 ? coolsize(new TextEncoder().encode(content).length) : '0B'}</span>
        </div>
      </div>
    </div>
  );
}
