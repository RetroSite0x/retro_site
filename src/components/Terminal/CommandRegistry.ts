import type { CommandHandler, CommandResult } from '../../types/terminal';
import { useVFSStore } from '../../store/useVFS';
import { useSystemStore } from '../../store/useSystem';
import { useTerminalStore } from '../../store/useTerminal';
import { parse, ParseError } from './CommandParser';

// Command handler map
const registry = new Map<string, CommandHandler>();

export function registerCommand(name: string, handler: CommandHandler) {
  registry.set(name, handler);
}

export function getRegisteredCommands(): string[] {
  return [...registry.keys()];
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function getSuggestions(input: string): string[] {
  const allCommands = [
    ...registry.keys(),
    'whoami',
    'uname',
    'exit',
    'reboot',
    'sudo',
  ];
  return allCommands
    .map((cmd) => ({ cmd, dist: levenshtein(input, cmd) }))
    .filter(({ dist }) => dist <= 3)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map(({ cmd }) => cmd);
}

export function executeCommand(input: string): CommandResult | null {
  const parsed = parse(input);

  if (parsed instanceof ParseError) {
    return { type: 'error', content: parsed.message };
  }

  const handler = registry.get(parsed.name);
  if (!handler) {
    // Check for easter eggs first
    const easterEgg = handleEasterEggs(input);
    if (easterEgg) return easterEgg;
    const suggestions = getSuggestions(parsed.name);
    if (suggestions.length > 0) {
      return {
        type: 'error',
        content: `${parsed.name}: command not found\nDid you mean: ${suggestions.join(', ')}?`,
      };
    }
    return { type: 'error', content: `${parsed.name}: command not found` };
  }

  const vfs = useVFSStore.getState();
  const system = useSystemStore.getState();
  const terminal = useTerminalStore.getState();

  const result = handler(parsed.args, parsed.flags, { vfs, system, terminal });

  // Handle redirect
  if (parsed.redirect && result.type === 'output') {
    const { type, target } = parsed.redirect;
    return { type: 'output', content: `[${type === '>' ? 'redirect' : 'append'}] to ${target}` };
  }

  return result;
}

function handleEasterEggs(input: string): CommandResult | null {
  const lower = input.toLowerCase();

  if (lower === 'sudo' || lower.startsWith('sudo')) {
    return { type: 'error', content: 'sudo: Permission denied.' };
  }

  if (lower === 'rm -rf /' || lower === 'rm -rf /*') {
    return { type: 'system', content: 'SYSOP: nice try.' };
  }

  if (lower === 'make love') {
    return {
      type: 'output',
      content: "make: love: No rule to make target 'love'. Stop.",
    };
  }

  if (lower === 'whoami') {
    return { type: 'output', content: 'guest' };
  }

  if (lower === 'uname -a') {
    return {
      type: 'output',
      content: 'Ann Naser Nabil v2.4.7 Generic 1987-2026 i686 GNU/Unix',
    };
  }

  if (lower === 'exit') {
    const system = useSystemStore.getState();
    system.logout();
    return { type: 'system', content: 'logout' };
  }

  if (lower === 'reboot') {
    useSystemStore.setState({ bootPhase: 'desktop', isLoggedIn: true });
    return { type: 'system', content: 'Desktop session refreshed.' };
  }

  return null;
}
