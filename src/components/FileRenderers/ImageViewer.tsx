import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface ImageViewerProps {
  filePath: string;
}

export function ImageViewer({ filePath }: ImageViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

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
        <div className={styles.imageFrame}>
          <div className={styles.imageContent}>{content}</div>
        </div>
      </div>
    </div>
  );
}
