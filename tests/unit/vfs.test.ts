import { describe, it, expect } from 'vitest';
import { normalizePath, getNode, readFileContent, searchNodes, splitPath, getParentPath } from '../../src/lib/vfs';
import type { FSNode, SearchResult } from '../../src/types/vfs';

const mockTree: FSNode = {
  name: '/',
  type: 'directory',
  metadata: { size: 512, createdAt: '', updatedAt: '', executable: false, permissions: 'rwxr-xr-x', mimeType: '' },
  children: [
    {
      name: 'home',
      type: 'directory',
      metadata: { size: 256, createdAt: '', updatedAt: '', executable: false, permissions: 'rwxr-xr-x', mimeType: '' },
      children: [
        {
          name: 'guest',
          type: 'directory',
          metadata: { size: 128, createdAt: '', updatedAt: '', executable: false, permissions: 'rwxr-xr-x', mimeType: '' },
          children: [
            {
              name: 'about.txt',
              type: 'file',
              content: 'Hello World',
              metadata: { size: 11, createdAt: '', updatedAt: '', executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'notes',
              type: 'directory',
              metadata: { size: 64, createdAt: '', updatedAt: '', executable: false, permissions: 'rwxr-xr-x', mimeType: '' },
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: 'tmp',
      type: 'directory',
      metadata: { size: 64, createdAt: '', updatedAt: '', executable: false, permissions: 'rwxrwxrwx', mimeType: '' },
      children: [],
    },
  ],
};

describe('splitPath', () => {
  it('splits root path into empty array', () => {
    expect(splitPath('/')).toEqual([]);
  });

  it('splits simple path', () => {
    expect(splitPath('/home/guest')).toEqual(['home', 'guest']);
  });

  it('handles trailing slash', () => {
    expect(splitPath('/home/guest/')).toEqual(['home', 'guest']);
  });
});

describe('normalizePath', () => {
  const cwd = '/home/guest';

  it('resolves absolute path as-is', () => {
    expect(normalizePath('/tmp', cwd)).toBe('/tmp');
  });

  it('resolves relative path', () => {
    expect(normalizePath('notes', cwd)).toBe('/home/guest/notes');
  });

  it('handles .. parent traversal', () => {
    expect(normalizePath('..', cwd)).toBe('/home');
  });

  it('handles ~ alias', () => {
    expect(normalizePath('~/projects', cwd)).toBe('/home/guest/projects');
  });

  it('handles . current directory', () => {
    expect(normalizePath('.', cwd)).toBe('/home/guest');
  });

  it('handles empty path', () => {
    expect(normalizePath('', cwd)).toBe('/home/guest');
  });
});

describe('getNode', () => {
  it('returns root node for root path', () => {
    const node = getNode(mockTree, '/');
    expect(node).not.toBeNull();
    expect(node!.name).toBe('/');
  });

  it('returns correct node for valid path', () => {
    const node = getNode(mockTree, '/home/guest/about.txt');
    expect(node).not.toBeNull();
    expect(node!.name).toBe('about.txt');
    expect(node!.type).toBe('file');
  });

  it('returns null for nonexistent path', () => {
    const node = getNode(mockTree, '/home/guest/nonexistent');
    expect(node).toBeNull();
  });

  it('returns directory node', () => {
    const node = getNode(mockTree, '/tmp');
    expect(node).not.toBeNull();
    expect(node!.type).toBe('directory');
  });
});

describe('readFileContent', () => {
  it('returns content for existing file', () => {
    const content = readFileContent(mockTree, '/home/guest/about.txt');
    expect(content).toBe('Hello World');
  });

  it('returns null for directory', () => {
    const content = readFileContent(mockTree, '/home/guest');
    expect(content).toBeNull();
  });

  it('returns null for nonexistent path', () => {
    const content = readFileContent(mockTree, '/home/guest/nope.txt');
    expect(content).toBeNull();
  });
});

describe('searchNodes', () => {
  it('finds pattern matches in file content', () => {
    const results: SearchResult[] = [];
    searchNodes(mockTree, /hello/gi, '/', results);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchLine).toContain('Hello');
  });

  it('returns empty when no match', () => {
    const results: SearchResult[] = [];
    searchNodes(mockTree, /zzzzz/gi, '/', results);
    expect(results.length).toBe(0);
  });
});

describe('getParentPath', () => {
  it('returns parent path', () => {
    expect(getParentPath('/home/guest/projects')).toBe('/home/guest');
  });

  it('returns root for top-level items', () => {
    expect(getParentPath('/home')).toBe('/');
  });
});
