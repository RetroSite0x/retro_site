import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import fm from '../../styles/components/file-manager.module.css';

interface ImageViewerProps {
  filePath: string;
}

export function ImageViewer({ filePath }: ImageViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);
  const fileName = filePath.split('/').pop() || filePath;

  if (content === null) {
    return (
      <div className={fm.fileViewer}>
        <div className={fm.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  return (
    <div className={fm.fileViewer}>
      {/* Tab bar */}
      <div className={fm.editorTabs}>
        <div className={`${fm.editorTab} ${fm.editorTabActive}`}>
          <span className={fm.editorTabIcon}>{'\u{1F5BC}'}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* Editor toolbar */}
      <div className={fm.editorToolbar}>
        <span style={{ color: 'var(--phosphor-dim)' }}>{filePath}</span>
      </div>

      {/* Image content */}
      <div className={fm.imageContent}>
        <div className={fm.imageFrame}>
          <pre className={fm.imageAscii}>{content}</pre>
        </div>
        <div className={fm.imageInfo}>{fileName}</div>
      </div>

      {/* Status bar */}
      <div className={fm.editorStatusBar}>
        <div className={fm.editorStatusLeft}>
          <span>Image</span>
        </div>
        <div className={fm.editorStatusRight}>
          <span>Preview</span>
        </div>
      </div>
    </div>
  );
}
