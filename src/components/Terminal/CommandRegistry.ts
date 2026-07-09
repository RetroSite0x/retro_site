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
    useSystemStore.setState({ bootPhase: 'bios', isLoggedIn: false });
    return { type: 'system', content: 'Rebooting...' };
  }

  return null;
}
