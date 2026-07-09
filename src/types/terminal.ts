import type { FSNode, SearchResult, NavigationResult } from './vfs';
import type { BootPhase, PhosphorTheme } from './system';

export interface HistoryEntry {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface ParsedCommand {
  name: string;
  args: string[];
  flags: Record<string, string | boolean>;
  redirect?: {
    type: '>' | '>>';
    target: string;
  };
}

export interface CommandResult {
  type: 'output' | 'error' | 'system';
  content: string;
}

export type CommandHandler = (
  args: string[],
  flags: Record<string, string | boolean>,
  stores: {
    vfs: VFSStore;
    system: SystemStore;
    terminal: TerminalStore;
  }
) => CommandResult;

// Store interfaces for handler access
export interface VFSStore {
  tree: FSNode;
  currentPath: string;
  history: string[];
  navigate: (path: string) => NavigationResult;
  resolvePath: (absolute: string) => FSNode | null;
  readFile: (path: string) => string | null;
  search: (pattern: string, path?: string) => SearchResult[];
  addNode: (parentPath: string, node: FSNode) => boolean;
}

export interface SystemStore {
  bootPhase: BootPhase;
  isLoggedIn: boolean;
  theme: PhosphorTheme;
  soundEnabled: boolean;
  crtFlicker: boolean;
  volume: number;
  username: string;
  setTheme: (theme: PhosphorTheme) => void;
}

export interface TerminalStore {
  history: HistoryEntry[];
  currentInput: string;
  cursorPos: number;
  commandHistory: string[];
  historyIndex: number;
  executeCommand: (input: string) => void;
  setInput: (input: string) => void;
  clear: () => void;
}
