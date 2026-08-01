import { describe, it, expect, beforeEach } from 'vitest';
import { registerCommand, executeCommand } from '../../src/components/Terminal/CommandRegistry';
import { cmd_help } from '../../src/components/Terminal/commands/cmd_help';
import { cmd_ls } from '../../src/components/Terminal/commands/cmd_ls';
import { cmd_cd } from '../../src/components/Terminal/commands/cmd_cd';
import { cmd_cat } from '../../src/components/Terminal/commands/cmd_cat';
import { cmd_pwd } from '../../src/components/Terminal/commands/cmd_pwd';
import { cmd_echo } from '../../src/components/Terminal/commands/cmd_echo';
import { useVFSStore } from '../../src/store/useVFS';
import { INITIAL_TREE } from '../../src/store/vfs-tree';

describe('Commands', () => {
  beforeEach(() => {
    // Register commands
    registerCommand('help', cmd_help);
    registerCommand('ls', cmd_ls);
    registerCommand('cd', cmd_cd);
    registerCommand('cat', cmd_cat);
    registerCommand('pwd', cmd_pwd);
    registerCommand('echo', cmd_echo);

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
    it('lists available commands when run without arguments', () => {
      const result = executeCommand('ls');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('output');
      expect(result!.content).toContain('Available commands:');
      expect(result!.content).toContain('help');
      expect(result!.content).toContain('ls');
    });

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
});
