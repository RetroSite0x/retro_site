import { useState, useMemo, useCallback } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import { getNode, splitPath } from '../../lib/vfs';
import type { FSNode } from '../../types/vfs';
import styles from '../../styles/components/file-manager.module.css';

export function FileManager() {
  const tree = useVFSStore((s) => s.tree);
  const openWindow = useWindowsStore((s) => s.openWindow);

  const [currentPath, setCurrentPath] = useState('/');
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pathInput, setPathInput] = useState('');
  const [editingPath, setEditingPath] = useState(false);

  const dir = useMemo(() => getNode(tree, currentPath), [tree, currentPath]);

  const navigateTo = useCallback((path: string) => {
    const node = getNode(tree, path);
    if (!node || node.type !== 'directory') return;

    const newHistory = navHistory.slice(0, historyIndex + 1);
    newHistory.push(currentPath);
    setNavHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setEditingPath(false);
    setPathInput('');
  }, [tree, currentPath, navHistory, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex < 0) return;
    setCurrentPath(navHistory[historyIndex]);
    setHistoryIndex((i) => i - 1);
  }, [navHistory, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex + 2 >= navHistory.length) return;
    setCurrentPath(navHistory[historyIndex + 2]);
    setHistoryIndex((i) => i + 1);
  }, [navHistory, historyIndex]);

  const goUp = useCallback(() => {
    if (currentPath === '/') return;
    const parts = splitPath(currentPath);
    parts.pop();
    const parent = '/' + parts.join('/');
    navigateTo(parent);
  }, [currentPath, navigateTo]);

  const handleOpen = useCallback((child: FSNode) => {
    const childPath = currentPath === '/'
      ? '/' + child.name
      : currentPath + '/' + child.name;

    if (child.type === 'directory') {
      navigateTo(childPath);
    } else {
      openWindow({
        title: child.name,
        content: { type: 'fileViewer', filePath: childPath },
        width: 600,
        height: 400,
      });
    }
  }, [currentPath, navigateTo, openWindow]);

  const handlePathSubmit = useCallback((e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmed = pathInput.trim();
    if (!trimmed) { setEditingPath(false); return; }
    const target = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    const node = getNode(tree, target);
    if (node && node.type === 'directory') {
      navigateTo(target);
    }
  }, [pathInput, tree, navigateTo]);

  const children = dir?.children || [];
  const subdirs = children.filter((c) => c.type === 'directory');
  const files = children.filter((c) => c.type === 'file' && !c.name.startsWith('.'));
  const hidden = children.filter((c) => c.name.startsWith('.'));

  // Tree node renderer (recursive)
  const renderTree = (nodes: FSNode[], basePath: string): JSX.Element[] => {
    return nodes.flatMap((node) => {
      if (node.type !== 'directory') return [];
      const nodePath = basePath === '/' ? '/' + node.name : basePath + '/' + node.name;
      const isActive = currentPath === nodePath || currentPath.startsWith(nodePath + '/');
      return [
        <div
          key={nodePath}
          className={`${styles.treeItem} ${currentPath === nodePath ? styles.treeItemActive : ''}`}
          onClick={() => navigateTo(nodePath)}
        >
          <span className={styles.treeIcon}>{isActive ? '▾' : '▸'}</span>
          <span className={styles.treeName}>{node.name}/</span>
        </div>,
        ...(isActive && node.children
          ? renderTree(node.children, nodePath)
          : []),
      ];
    });
  };

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          className={styles.navBtn}
          onClick={goBack}
          disabled={historyIndex < 0}
          title="Back"
        >
          ◂
        </button>
        <button
          className={styles.navBtn}
          onClick={goForward}
          disabled={historyIndex + 2 >= navHistory.length}
          title="Forward"
        >
          ▸
        </button>
        <button className={styles.navBtn} onClick={goUp} title="Up">
          ▲
        </button>

        {editingPath ? (
          <form onSubmit={handlePathSubmit} className={styles.pathForm}>
            <input
              className={styles.pathInput}
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onBlur={handlePathSubmit}
              onKeyDown={(e) => e.key === 'Escape' && setEditingPath(false)}
              autoFocus
            />
          </form>
        ) : (
          <span
            className={styles.pathBar}
            onClick={() => { setPathInput(currentPath); setEditingPath(true); }}
          >
            {currentPath}
          </span>
        )}

        <span className={styles.itemCount}>
          {subdirs.length} dirs, {files.length} files
          {hidden.length > 0 && `, ${hidden.length} hidden`}
        </span>
      </div>

      <div className={styles.body}>
        {/* Sidebar tree */}
        <div className={styles.sidebar}>
          {tree.children && renderTree([tree], '')}
        </div>

        {/* File listing */}
        <div className={styles.fileList}>
          {subdirs.map((child) => (
            <div
              key={child.name}
              className={styles.entry}
              onDoubleClick={() => handleOpen(child)}
            >
              <span className={styles.entryIcon}>[📁]</span>
              <span className={styles.entryName}>{child.name}/</span>
              <span className={styles.entryMeta}>{child.metadata.permissions}</span>
            </div>
          ))}
          {files.map((child) => (
            <div
              key={child.name}
              className={styles.entry}
              onDoubleClick={() => handleOpen(child)}
            >
              <span className={styles.entryIcon}>
                {child.metadata.mimeType === 'text/markdown' ? '[📝]' : '[📄]'}
              </span>
              <span className={styles.entryName}>{child.name}</span>
              <span className={styles.entryMeta}>{child.metadata.size} B</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
