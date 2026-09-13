import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import { coolsize } from '../../lib/fileUtils';
import fm from '../../styles/components/file-manager.module.css';

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
  return { key: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
}

function parseConfig(content: string): ConfigLine[] {
  return content.split('\n').map((line) => {
    if (line.trim().startsWith('#')) return { type: 'comment' as const, text: line };
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
  const lines = useMemo(() => (content === null ? [] : parseConfig(content)), [content]);
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
          <span className={fm.editorTabIcon}>{'\u{2699}\u{FE0F}'}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* Editor toolbar */}
      <div className={fm.editorToolbar}>
        <span style={{ color: 'var(--phosphor-dim)' }}>{filePath}</span>
      </div>

      {/* Config content */}
      <div className={fm.configContent}>
        <table className={fm.configTable}>
          <tbody>
            {lines.map((line, i) => {
              if (line.type === 'comment') {
                return (
                  <tr key={i}>
                    <td colSpan={2} className={fm.configComment}>{line.text}</td>
                  </tr>
                );
              }
              if (line.type === 'kv') {
                return (
                  <tr key={i}>
                    <td className={fm.configKey}>{line.key}</td>
                    <td className={fm.configValue}>{line.value}</td>
                  </tr>
                );
              }
              return (
                <tr key={i}>
                  <td colSpan={2} className={fm.filePre} style={{ padding: '4px 12px' }}>{line.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className={fm.editorStatusBar}>
        <div className={fm.editorStatusLeft}>
          <span>Ln {totalLines}, Col 1</span>
          <span>{totalLines} lines</span>
        </div>
        <div className={fm.editorStatusRight}>
          <span>Config</span>
          <span>UTF-8</span>
          <span>{content.length > 0 ? coolsize(new TextEncoder().encode(content).length) : '0B'}</span>
        </div>
      </div>
    </div>
  );
}
