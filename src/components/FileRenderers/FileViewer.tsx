import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import { MarkdownViewer } from './MarkdownViewer';
import { ConfigViewer } from './ConfigViewer';
import { TextViewer } from './TextViewer';
import { ImageViewer } from './ImageViewer';
import styles from '../../styles/components/menu-bar.module.css';

interface FileViewerProps {
  filePath: string;
}

function getExtension(filePath: string): string {
  const idx = filePath.lastIndexOf('.');
  if (idx === -1) return '';
  return filePath.slice(idx).toLowerCase();
}

function getRenderer(filePath: string): 'md' | 'conf' | 'txt' | 'image' | 'text' {
  const ext = getExtension(filePath);
  switch (ext) {
    case '.md':
      return 'md';
    case '.conf':
      return 'conf';
    case '.txt':
      return 'txt';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
      return 'image';
    default:
      return 'text';
  }
}

export function FileViewer({ filePath }: FileViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

  if (content === null) {
    return (
      <div className={styles.fileViewer}>
        <div className={styles.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  const renderer = getRenderer(filePath);

  switch (renderer) {
    case 'md':
      return <MarkdownViewer filePath={filePath} />;
    case 'conf':
      return <ConfigViewer filePath={filePath} />;
    case 'txt':
      return <TextViewer filePath={filePath} />;
    case 'image':
      return <ImageViewer filePath={filePath} />;
    default:
      return <TextViewer filePath={filePath} />;
  }
}
