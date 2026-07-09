import { create } from 'zustand';
import type { FSNode, SearchResult, NavigationResult } from '../types/vfs';
import { normalizePath, getNode, readFileContent, searchNodes } from '../lib/vfs';
import { INITIAL_TREE } from './vfs-tree';

interface VFSState {
  tree: FSNode;
  currentPath: string;
  history: string[];

  navigate: (path: string) => NavigationResult;
  resolvePath: (absolute: string) => FSNode | null;
  readFile: (path: string) => string | null;
  search: (pattern: string, basePath?: string) => SearchResult[];
  getPathFromNode: (node: FSNode) => string;
  addNode: (parentPath: string, node: FSNode) => boolean;
}

export const useVFSStore = create<VFSState>((set, get) => ({
  tree: INITIAL_TREE,
  currentPath: '/home/guest',
  history: [],

  navigate: (path: string) => {
    const { tree, currentPath } = get();
    const absolute = normalizePath(path, currentPath);
    const node = getNode(tree, absolute);

    if (!node) return { success: false, error: `cd: no such directory: ${path}` };
    if (node.type !== 'directory') return { success: false, error: `cd: not a directory: ${path}` };

    set((s) => ({ currentPath: absolute, history: [...s.history, s.currentPath] }));
    return { success: true, node, path: absolute };
  },

  resolvePath: (absolute: string) => {
    return getNode(get().tree, absolute);
  },

  readFile: (path: string) => {
    const { tree, currentPath } = get();
    const absolute = normalizePath(path, currentPath);
    return readFileContent(tree, absolute);
  },

  search: (pattern: string, basePath?: string) => {
    const { tree, currentPath } = get();
    const absolute = basePath ? normalizePath(basePath, currentPath) : currentPath;
    const results: SearchResult[] = [];
    searchNodes(tree, new RegExp(pattern, 'gi'), absolute, results);
    return results;
  },

  getPathFromNode: (_node: FSNode) => {
    return '';
  },

  addNode: (parentPath: string, node: FSNode) => {
    const { tree, currentPath } = get();
    const absolute = normalizePath(parentPath, currentPath);
    const parent = getNode(tree, absolute);
    if (!parent || parent.type !== 'directory') return false;
    parent.children = parent.children || [];
    parent.children.push(node);
    return true;
  },
}));
