import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface TextViewerProps {
  filePath: string;
}

export function TextViewer({ filePath }: TextViewerProps) {
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
        <pre className={styles.filePre}>{content}</pre>
      </div>
    </div>
  );
}
