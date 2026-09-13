import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import { coolsize } from '../../lib/fileUtils';
import fm from '../../styles/components/file-manager.module.css';

interface TextViewerProps {
  filePath: string;
}

function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

function getLanguageLabel(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
    py: 'Python', go: 'Go', rs: 'Rust', c: 'C', cpp: 'C++', h: 'C',
    java: 'Java', rb: 'Ruby', php: 'PHP', sh: 'Shell', css: 'CSS',
    html: 'HTML', json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
    md: 'Markdown', txt: 'Plain Text', conf: 'Config',
  };
  return map[ext] || ext.toUpperCase() || 'Text';
}

export function TextViewer({ filePath }: TextViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

  const fileName = getFileName(filePath);
  const lang = getLanguageLabel(filePath);

  if (content === null) {
    return (
      <div className={fm.fileViewer}>
        <div className={fm.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  const lines = content.split('\n');
  const totalLines = lines.length;

  return (
    <div className={fm.fileViewer}>
      {/* Tab bar */}
      <div className={fm.editorTabs}>
        <div className={`${fm.editorTab} ${fm.editorTabActive}`}>
          <span className={fm.editorTabIcon}>{'\u{1F4C4}'}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* Editor toolbar */}
      <div className={fm.editorToolbar}>
        <span style={{ color: 'var(--phosphor-dim)' }}>{filePath}</span>
      </div>

      {/* Content with line numbers */}
      <div className={fm.fileContent}>
        <div className={fm.lineNumbers}>
          {lines.map((_, i) => (
            <div key={i} className={fm.lineNum}>{i + 1}</div>
          ))}
        </div>
        <div className={fm.codeContent}>
          <pre className={fm.filePre}>
            {lines.map((line, i) => (
              <div key={i} className={fm.codeLine}>
                <span className={fm.codeLineNum}>{i + 1}</span>
                <span>{line || ' '}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Status bar */}
      <div className={fm.editorStatusBar}>
        <div className={fm.editorStatusLeft}>
          <span>Ln {totalLines}, Col 1</span>
          <span>{totalLines} lines</span>
        </div>
        <div className={fm.editorStatusRight}>
          <span>{lang}</span>
          <span>UTF-8</span>
          <span>{content.length > 0 ? coolsize(new TextEncoder().encode(content).length) : '0B'}</span>
        </div>
      </div>
    </div>
  );
}
