import { useState, useMemo, useCallback } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { getNode, readFileContent, getParentPath, splitPath } from '../../lib/vfs';
import type { FSNode } from '../../types/vfs';
import styles from '../../styles/components/mobile.module.css';

interface FileEntry {
  node: FSNode;
  path: string;
}

function getExtension(filePath: string): string {
  const idx = filePath.lastIndexOf('.');
  return idx === -1 ? '' : filePath.slice(idx).toLowerCase();
}

function getFileIcon(node: FSNode): string {
  if (node.type === 'directory') return '📁';
  const ext = getExtension(node.name);
  switch (ext) {
    case '.md':   return '📄';
    case '.txt':  return '📝';
    case '.py':   return '🐍';
    case '.js':
    case '.ts':
    case '.tsx':  return '📜';
    case '.json': return '🔧';
    case '.yaml':
    case '.yml':  return '⚙';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':  return '🖼';
    default:      return '📄';
  }
}

export function MobileFiles() {
  const tree = useVFSStore((s) => s.tree);

  // Local navigation state — independent from terminal cwd
  const [currentPath, setCurrentPath] = useState('/home/guest');
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // Current directory node
  const dirNode = useMemo(() => getNode(tree, currentPath), [tree, currentPath]);

  // Children sorted: directories first, then files, alphabetically
  const entries = useMemo((): FileEntry[] => {
    if (!dirNode?.children) return [];
    const sorted = [...dirNode.children].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return sorted.map((node) => ({
      node,
      path: currentPath === '/' ? '/' + node.name : currentPath + '/' + node.name,
    }));
  }, [dirNode, currentPath]);

  // File content for viewer
  const fileContent = useMemo(() => {
    if (!viewingFile) return null;
    return readFileContent(tree, viewingFile);
  }, [tree, viewingFile]);

  const navigateTo = useCallback((path: string) => {
    setViewingFile(null);
    setCurrentPath(path);
  }, []);

  const openFile = useCallback((path: string) => {
    setViewingFile(path);
  }, []);

  const goUp = useCallback(() => {
    setViewingFile(null);
    setCurrentPath((prev) => getParentPath(prev));
  }, []);

  const goBack = useCallback(() => {
    setViewingFile(null);
  }, []);

  // Breadcrumb segments
  const segments = useMemo(() => {
    const parts = splitPath(currentPath);
    const crumbs: { label: string; path: string }[] = [{ label: '/', path: '/' }];
    let accumulated = '';
    for (const part of parts) {
      accumulated += '/' + part;
      crumbs.push({ label: part, path: accumulated });
    }
    return crumbs;
  }, [currentPath]);

  // File viewer
  if (viewingFile) {
    const fileName = splitPath(viewingFile).pop() ?? viewingFile;
    return (
      <div className={styles.files}>
        <button className={styles.backBtn} onClick={goBack} aria-label="Back to directory list">
          ← Back
        </button>
        <div className={styles.fileView}>
          <div className={styles.fileViewHeader}>{fileName}</div>
          <div className={styles.fileViewContent}>
            {fileContent !== null ? (
              <pre>{fileContent}</pre>
            ) : (
              <pre style={{ opacity: 0.5 }}>Unable to read file</pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Directory listing
  return (
    <div className={styles.files}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        {segments.map((seg, i) => (
          <span key={seg.path} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
            {i < segments.length - 1 ? (
              <button
                className={styles.breadcrumbItem}
                onClick={() => navigateTo(seg.path)}
              >
                {seg.label}
              </button>
            ) : (
              <span className={styles.breadcrumbCurrent}>{seg.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Up directory */}
      {currentPath !== '/' && (
        <button className={styles.fileItem} onClick={goUp}>
          <span className={styles.fileIcon}>⬆</span>
          <span className={styles.fileName}>..</span>
        </button>
      )}

      {/* Entries */}
      <div className={styles.fileList}>
        {entries.length === 0 && (
          <div style={{ opacity: 0.4, padding: 'var(--space-md)', textAlign: 'center' }}>
            Empty directory
          </div>
        )}
        {entries.map((entry) => (
          <button
            key={entry.path}
            className={styles.fileItem}
            onClick={() =>
              entry.node.type === 'directory'
                ? navigateTo(entry.path)
                : openFile(entry.path)
            }
          >
            <span className={styles.fileIcon}>{getFileIcon(entry.node)}</span>
            <span className={styles.fileName}>
              {entry.node.name}
              {entry.node.type === 'directory' ? '/' : ''}
            </span>
            {entry.node.type === 'file' && entry.node.metadata && (
              <span className={styles.fileMeta}>
                {entry.node.metadata.size}B
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
