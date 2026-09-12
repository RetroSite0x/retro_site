import { useMemo, useCallback } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import { getNode } from '../../lib/vfs';
import {
  formatPermissionsFromBits,
  coolsize,
  formatDate,
  padLeft,
  getFileType,
  getTypeIndicator,
  getExtColor,
} from '../../lib/fileUtils';
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
        width: 680,
        height: 420,
      });
    } else {
      openWindow({
        title: child.name,
        content: { type: 'fileViewer', filePath: childPath },
        width: 700,
        height: 450,
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

  const sorted = [...dirs, ...files];

  return (
    <div className={styles.dirViewer}>
      <div className={styles.dirHeader}>
        <span className={styles.dirPath}>{path}</span>
        <span className={styles.dirCount}>
          {dirs.length} dir, {files.length} file
          {hidden.length > 0 && `, ${hidden.length} hidden`}
        </span>
      </div>

      <div className={styles.dirTableHeader}>
        <span className={styles.dirColPerms}>Permissions</span>
        <span className={styles.dirColSize}>Size</span>
        <span className={styles.dirColDate}>Modified</span>
        <span className={styles.dirColName}>Name</span>
      </div>

      <div className={styles.dirList}>
        {sorted.map((child) => {
          const isDir = child.type === 'directory';
          const fileType = getFileType(child);
          const indicator = getTypeIndicator(fileType);
          const perms = formatPermissionsFromBits(isDir, child.metadata.permissions);
          const size = padLeft(coolsize(child.metadata.size || 0), 6);
          const date = formatDate(child.metadata.updatedAt || child.metadata.createdAt);
          const nameColor = getExtColor(child.name);

          return (
            <div
              key={child.name}
              className={`${styles.dirEntry} ${isDir ? styles.dirEntryDir : ''}`}
              onDoubleClick={() => handleOpen(child)}
            >
              <span className={styles.dirColPerms}>{perms}</span>
              <span className={styles.dirColSize}>{isDir ? '-' : size}</span>
              <span className={styles.dirColDate}>{date}</span>
              <span className={styles.dirColName}>
                <span className={styles.dirFileName} style={{ color: nameColor }}>
                  {child.name}
                </span>
                {indicator && <span className={styles.dirTypeIndicator}>{indicator}</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.dirFooter}>
        {sorted.length} item{sorted.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
