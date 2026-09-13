import { useMemo, useCallback, useState } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import { getNode } from '../../lib/vfs';
import { coolsize, formatDate } from '../../lib/fileUtils';
import type { FSNode } from '../../types/vfs';
import fm from '../../styles/components/file-manager.module.css';

interface DirectoryViewerProps {
  path: string;
}

function getFileIcon(node: FSNode): string {
  if (node.type === 'directory') return '\u{1F4C1}';
  const ext = node.name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: '\u{1F4DD}', tsx: '\u{1F4DD}', js: '\u{1F4DD}', jsx: '\u{1F4DD}',
    py: '\u{1F40D}', go: '\u{1F4E6}', rs: '\u{1F980}', java: '\u{2615}',
    md: '\u{1F4DD}', txt: '\u{1F4C4}', conf: '\u{2699}\u{FE0F}', json: '{ }',
    yaml: '\u{1F4CB}', yml: '\u{1F4CB}', toml: '\u{1F4CB}',
    png: '\u{1F5BC}', jpg: '\u{1F5BC}', jpeg: '\u{1F5BC}', gif: '\u{1F5BC}', svg: '\u{1F5BC}',
    pdf: '\u{1F4D5}', zip: '\u{1F4E6}', tar: '\u{1F4E6}', gz: '\u{1F4E6}',
    sh: '\u{1F4E1}', bash: '\u{1F4E1}', zsh: '\u{1F4E1}',
    css: '\u{1F3A8}', html: '\u{1F310}',
    c: '\u{1F4BB}', cpp: '\u{1F4BB}', h: '\u{1F4BB}',
    rb: '\u{1F7E2}', php: '\u{1F4E7}',
  };
  return map[ext] || '\u{1F4C4}';
}

function getDirTree(tree: FSNode, currentPath: string): { name: string; path: string; depth: number }[] {
  const items: { name: string; path: string; depth: number }[] = [];
  const rootNode = getNode(tree, currentPath);
  if (!rootNode || rootNode.type !== 'directory') return items;

  function walk(node: FSNode, prefix: string, depth: number) {
    if (depth > 2) return;
    const children = (node.children || []).filter((c) => c.type === 'directory');
    children.sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      const childPath = prefix === '/' ? `/${child.name}` : `${prefix}/${child.name}`;
      items.push({ name: child.name, path: childPath, depth });
      walk(child, childPath, depth + 1);
    }
  }

  walk(rootNode, currentPath, 0);
  return items;
}

export function DirectoryViewer({ path }: DirectoryViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const openWindow = useWindowsStore((s) => s.openWindow);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const dir = useMemo(() => getNode(tree, path), [tree, path]);
  const dirTree = useMemo(() => getDirTree(tree, path), [tree, path]);

  const handleOpen = useCallback((child: FSNode) => {
    const childPath = path.endsWith('/') ? path + child.name : path + '/' + child.name;

    if (child.type === 'directory') {
      openWindow({
        title: child.name,
        content: { type: 'directoryViewer', path: childPath },
        width: 680,
        height: 440,
      });
    } else {
      openWindow({
        title: child.name,
        content: { type: 'fileViewer', filePath: childPath },
        width: 700,
        height: 460,
      });
    }
  }, [path, openWindow]);

  const handleNavigate = useCallback((targetPath: string) => {
    openWindow({
      title: targetPath.split('/').pop() || '/',
      content: { type: 'directoryViewer', path: targetPath },
      width: 680,
      height: 440,
    });
  }, [openWindow]);

  if (!dir || dir.type !== 'directory') {
    return (
      <div className={fm.container}>
        <div className={fm.dirError}>Path not found: {path}</div>
      </div>
    );
  }

  const children = dir.children || [];
  const dirs = children.filter((c) => c.type === 'directory').sort((a, b) => a.name.localeCompare(b.name));
  const files = children.filter((c) => c.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
  const hidden = children.filter((c) => c.name.startsWith('.'));
  const sorted = [...dirs, ...files];

  const pathParts = path.split('/').filter(Boolean);
  const parentPath = pathParts.length > 1 ? '/' + pathParts.slice(0, -1).join('/') : '/';

  return (
    <div className={fm.container}>
      {/* Toolbar */}
      <div className={fm.toolbar}>
        <button
          className={fm.toolbarBtn}
          disabled={pathParts.length === 0}
          onClick={() => handleNavigate(parentPath)}
          title="Go up"
        >
          &#x25C0;
        </button>
        <div className={fm.toolbarSep} />

        {/* Breadcrumb */}
        <div className={fm.pathBar}>
          <span className={fm.pathSegment} onClick={() => handleNavigate('/')}>/</span>
          {pathParts.map((part, i) => {
            const segPath = '/' + pathParts.slice(0, i + 1).join('/');
            const isLast = i === pathParts.length - 1;
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span className={fm.pathSep}>{'\u203A'}</span>
                {isLast ? (
                  <span className={fm.pathCurrent}>{part}</span>
                ) : (
                  <span className={fm.pathSegment} onClick={() => handleNavigate(segPath)}>{part}</span>
                )}
              </span>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className={fm.viewToggle}>
          <button
            className={`${fm.viewToggleBtn} ${viewMode === 'list' ? fm.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            &#x2261;
          </button>
          <button
            className={`${fm.viewToggleBtn} ${viewMode === 'grid' ? fm.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
            title="Icon view"
          >
            &#x25A6;
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={fm.body}>
        {/* Sidebar tree */}
        <div className={fm.sidebar}>
          <div
            className={`${fm.treeItem} ${fm.treeItemDir}`}
            onClick={() => handleNavigate('/')}
          >
            <span className={fm.treeIcon}>{'\u{1F3E0}'}</span>
            <span className={fm.treeName}>~</span>
          </div>
          {dirTree.map((item) => (
            <div
              key={item.path}
              className={`${fm.treeItem} ${item.path === path ? fm.treeItemActive : ''}`}
              style={{ paddingLeft: 12 + item.depth * 12 }}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={fm.treeIcon}>{'\u{1F4C1}'}</span>
              <span className={fm.treeName}>{item.name}</span>
            </div>
          ))}
        </div>

        {/* File list */}
        {viewMode === 'list' ? (
          <div className={fm.fileList}>
            <div className={fm.fileListHeader}>
              <span>Name</span>
              <span style={{ textAlign: 'right' }}>Size</span>
              <span>Modified</span>
            </div>
            {sorted.map((child) => {
              const isDir = child.type === 'directory';
              const icon = getFileIcon(child);
              const size = isDir ? '-' : coolsize(child.metadata.size || 0);
              const date = formatDate(child.metadata.updatedAt || child.metadata.createdAt);

              return (
                <div
                  key={child.name}
                  className={fm.entry}
                  onDoubleClick={() => handleOpen(child)}
                >
                  <div className={fm.entryName}>
                    <span className={fm.entryIcon}>{icon}</span>
                    <span className={`${fm.entryLabel} ${isDir ? fm.entryLabelDir : ''}`}>
                      {child.name}{isDir ? '/' : ''}
                    </span>
                  </div>
                  <span className={fm.entrySize}>{size}</span>
                  <span className={fm.entryDate}>{date}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={fm.iconGrid}>
            {sorted.map((child) => {
              const isDir = child.type === 'directory';
              const icon = getFileIcon(child);

              return (
                <div
                  key={child.name}
                  className={fm.iconEntry}
                  onDoubleClick={() => handleOpen(child)}
                >
                  <span className={fm.iconEntryIcon}>{icon}</span>
                  <span className={`${fm.iconEntryLabel} ${isDir ? fm.iconEntryLabelDir : ''}`}>
                    {child.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className={fm.statusBar}>
        <div className={fm.statusLeft}>
          <span className={fm.statusItem}>{dirs.length} folder{dirs.length !== 1 ? 's' : ''}</span>
          <span className={fm.statusItem}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
          {hidden.length > 0 && <span className={fm.statusItem}>{hidden.length} hidden</span>}
        </div>
        <div className={fm.statusRight}>
          <span className={fm.statusItem}>{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
