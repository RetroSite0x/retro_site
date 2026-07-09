import type { FSNode, SearchResult } from '../types/vfs';

/**
 * Split a path string into segments.
 * '/home/guest/projects' → ['home', 'guest', 'projects']
 */
export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

/**
 * Normalize a (possibly relative) path against a current working directory.
 * Handles '..', '.', '~', and absolute paths.
 */
export function normalizePath(path: string, cwd: string): string {
  if (!path) return cwd;

  // Handle ~ alias
  if (path.startsWith('~')) {
    path = '/home/guest' + path.slice(1);
  }

  // Handle absolute paths
  if (path.startsWith('/')) {
    // Clean the absolute path
    return resolveDotSegments(path);
  }

  // Relative path: resolve against cwd
  const combined = cwd.endsWith('/') ? cwd + path : cwd + '/' + path;
  return resolveDotSegments(combined);
}

/**
 * Resolve '.', '..', and empty segments in a path.
 */
function resolveDotSegments(path: string): string {
  const parts = splitPath(path);
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return '/' + resolved.join('/');
}

/**
 * Get the parent directory path for an absolute path.
 * '/home/guest/projects' → '/home/guest'
 */
export function getParentPath(absolutePath: string): string {
  const parts = splitPath(absolutePath);
  parts.pop();
  return '/' + parts.join('/');
}

/**
 * Get the last segment (name) from an absolute path.
 * '/home/guest/projects' → 'projects'
 */
export function getPathSegments(absolutePath: string): string[] {
  return splitPath(absolutePath);
}

/**
 * Navigate to a node in the tree by absolute path.
 * Returns null if the path doesn't exist.
 */
export function getNode(tree: FSNode, absolutePath: string): FSNode | null {
  const parts = splitPath(absolutePath);
  let current = tree;

  // Root node check
  if (parts.length === 0) return tree;

  for (const part of parts) {
    if (!current.children) return null;
    const child = current.children.find((n) => n.name === part);
    if (!child) return null;
    current = child;
  }

  return current;
}

/**
 * Read the content of a file at the given absolute path.
 * Returns null if path is a directory or doesn't exist.
 */
export function readFileContent(tree: FSNode, path: string): string | null {
  const node = getNode(tree, path);
  if (!node || node.type !== 'file') return null;
  return node.content ?? null;
}

/**
 * Recursively search nodes matching a regex pattern.
 * Results are accumulated into the `results` array.
 */
export function searchNodes(
  tree: FSNode,
  pattern: RegExp,
  basePath: string,
  results: SearchResult[]
): void {
  for (const child of tree.children ?? []) {
    const childPath = basePath.endsWith('/')
      ? basePath + child.name
      : basePath + '/' + child.name;

    if (child.type === 'file' && child.content) {
      const lines = child.content.split('\n');
      for (const line of lines) {
        if (pattern.test(line)) {
          results.push({
            path: childPath,
            node: child,
            matchLine: line.trim(),
          });
          break; // Only one match per file
        }
      }
    }

    if (child.type === 'directory') {
      searchNodes(child, pattern, childPath, results);
    }
  }
}

/**
 * Walk the tree to find the path for a given node.
 * Returns the absolute path as a string, or empty string if not found.
 */
export function getPathFromNode(tree: FSNode, target: FSNode): string {
  function walk(node: FSNode, path: string): string | null {
    if (node === target) return path;

    for (const child of node.children ?? []) {
      const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
      const found = walk(child, childPath);
      if (found !== null) return found;
    }

    return null;
  }

  return walk(tree, '') ?? '';
}
