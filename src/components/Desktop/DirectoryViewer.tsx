import { useMemo, useCallback } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import { getNode } from '../../lib/vfs';
import type { FSNode } from '../../types/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface DirectoryViewerProps {
  path: string;
}

export function DirectoryViewer({ path }: DirectoryViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const openWindow = useWindowsStore((s) => s.openWindow);

  const dir = useMemo(() => getNode(tree, path), [tree, path]);

  const handleOpen = useCallback((child: FSNode) => {
    const childPath = path.endsWith('/') ? path + child.name : path + '/' + child.name;

    if (child.type === 'directory') {
      openWindow({
        title: child.name,
        content: { type: 'directoryViewer', path: childPath },
        width: 560,
        height: 380,
      });
    } else {
      openWindow({
        title: child.name,
        content: { type: 'fileViewer', filePath: childPath },
        width: 600,
        height: 400,
      });
    }
  }, [path, openWindow]);

  if (!dir || dir.type !== 'directory') {
    return (
      <div className={styles.dirViewer}>
        <div className={styles.dirError}>Path not found: {path}</div>
      </div>
    );
  }

  const children = dir.children || [];
  const dirs = children.filter((c) => c.type === 'directory');
  const files = children.filter((c) => c.type === 'file' && !c.name.startsWith('.'));
  const hidden = children.filter((c) => c.name.startsWith('.'));

  return (
    <div className={styles.dirViewer}>
      <div className={styles.dirHeader}>
        <span className={styles.dirPath}>{path}</span>
        <span className={styles.dirCount}>
          {dirs.length} dir{dirs.length !== 1 ? 's' : ''}, {files.length} file{files.length !== 1 ? 's' : ''}
          {hidden.length > 0 && `, ${hidden.length} hidden`}
        </span>
      </div>
      <div className={styles.dirList}>
        {dirs.map((child) => (
          <div
            key={child.name}
            className={styles.dirEntry}
            onDoubleClick={() => handleOpen(child)}
          >
            <span className={styles.dirEntryIcon}>[📁]</span>
            <span className={styles.dirEntryName}>{child.name}/</span>
            <span className={styles.dirEntryMeta}>{child.metadata.permissions}</span>
          </div>
        ))}
        {files.map((child) => (
          <div
            key={child.name}
            className={styles.dirEntry}
            onDoubleClick={() => handleOpen(child)}
          >
            <span className={styles.dirEntryIcon}>
              {child.metadata.mimeType === 'text/markdown' ? '[📝]' : '[📄]'}
            </span>
            <span className={styles.dirEntryName}>{child.name}</span>
            <span className={styles.dirEntryMeta}>
              {child.metadata.size} B
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
