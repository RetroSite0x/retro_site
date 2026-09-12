import { describe, it, expect, beforeEach } from 'vitest';
import { registerCommand, executeCommand } from '../../src/components/Terminal/CommandRegistry';
import { cmd_ls } from '../../src/components/Terminal/commands/cmd_ls';
import { cmd_cd } from '../../src/components/Terminal/commands/cmd_cd';
import { cmd_cat } from '../../src/components/Terminal/commands/cmd_cat';
import { cmd_pwd } from '../../src/components/Terminal/commands/cmd_pwd';
import { cmd_echo } from '../../src/components/Terminal/commands/cmd_echo';
import { cmd_head } from '../../src/components/Terminal/commands/cmd_head';
import { cmd_tail } from '../../src/components/Terminal/commands/cmd_tail';
import { cmd_wc } from '../../src/components/Terminal/commands/cmd_wc';
import { cmd_sort } from '../../src/components/Terminal/commands/cmd_sort';
import { cmd_less } from '../../src/components/Terminal/commands/cmd_less';
import { useVFSStore } from '../../src/store/useVFS';
import { INITIAL_TREE } from '../../src/store/vfs-tree';

describe('Commands', () => {
  beforeEach(() => {
    // Register commands
    registerCommand('ls', cmd_ls);
    registerCommand('cd', cmd_cd);
    registerCommand('cat', cmd_cat);
    registerCommand('pwd', cmd_pwd);
    registerCommand('echo', cmd_echo);
    registerCommand('head', cmd_head);
    registerCommand('tail', cmd_tail);
    registerCommand('wc', cmd_wc);
    registerCommand('sort', cmd_sort);
    registerCommand('less', cmd_less);

    // Reset VFS store state for each test
    useVFSStore.setState({
      tree: INITIAL_TREE,
      currentPath: '/home/guest',
      history: [],
    });
  });

  describe('pwd', () => {
    it('prints current directory', () => {
      const result = executeCommand('pwd');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('output');
      expect(result!.content).toBe('/home/guest');
    });
  });

  describe('cd', () => {
    it('changes to valid directory', () => {
      const result = executeCommand('cd /tmp');
      expect(result).not.toBeNull();
      expect(useVFSStore.getState().currentPath).toBe('/tmp');
    });

    it('returns error for invalid path', () => {
      const currentPath = useVFSStore.getState().currentPath;
      const result = executeCommand('cd /nonexistent');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('error');
      expect(useVFSStore.getState().currentPath).toBe(currentPath);
    });
  });

  describe('ls', () => {
    it('lists directory contents', () => {
      const result = executeCommand('ls /tmp');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('output');
    });
  });

  describe('cat', () => {
    it('reads file contents', () => {
      const result = executeCommand('cat about.txt');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('Nabil');
    });

    it('returns error for directory', () => {
      const result = executeCommand('cat /tmp');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('error');
    });

    it('returns error for missing file', () => {
      const result = executeCommand('cat nonexistent.txt');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('error');
    });
  });

  describe('echo', () => {
    it('prints arguments', () => {
      const result = executeCommand('echo hello world');
      expect(result).not.toBeNull();
      expect(result!.content).toBe('hello world');
    });
  });

  describe('easter eggs', () => {
    it('sudo returns permission denied', () => {
      const result = executeCommand('sudo');
      expect(result).not.toBeNull();
      expect(result!.content).toContain('Permission denied');
    });

    it('whoami returns guest', () => {
      const result = executeCommand('whoami');
      expect(result).not.toBeNull();
      expect(result!.content).toBe('guest');
    });

    it('rm -rf / returns SYSOP message', () => {
      const result = executeCommand('rm -rf /');
      expect(result).not.toBeNull();
      expect(result!.content).toContain('SYSOP');
    });
  });

  describe('unknown command', () => {
    it('returns command not found', () => {
      const result = executeCommand('foobar');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('error');
      expect(result!.content).toContain('command not found');
    });
  });

  describe('unix text tools', () => {
    it('head reads a relative file path', () => {
      const result = executeCommand('head about.txt');
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('SYSTEM INFORMATION');
    });

    it('tail reads a relative file path', () => {
      const result = executeCommand('tail about.txt');
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('Status: Online');
    });

    it('wc reports the file name and counts', () => {
      const result = executeCommand('wc about.txt');
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('about.txt');
    });

    it('sort orders lines', () => {
      const result = executeCommand('sort about.txt');
      expect(result!.type).toBe('output');
      const lines = result!.content.split('\n');
      expect([...lines].sort()).toEqual(lines);
    });

    it('less prints file contents', () => {
      const result = executeCommand('less about.txt');
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('Ann Naser Nabil');
    });

    it('returns an error for a missing file', () => {
      const result = executeCommand('head nonexistent.txt');
      expect(result!.type).toBe('error');
    });
  });
});
