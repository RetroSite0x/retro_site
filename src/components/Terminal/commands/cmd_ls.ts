import type { CommandHandler } from '../../../types/terminal';
import { getRegisteredCommands } from '../CommandRegistry';

const BUILTIN_COMMANDS = ['whoami', 'uname', 'exit', 'reboot', 'sudo'];

function formatCommandList(commands: string[]): string {
  const sorted = [...new Set(commands)].sort((a, b) => a.localeCompare(b));
  const colWidth = Math.max(...sorted.map((cmd) => cmd.length), 'help'.length) + 2;
  const columns = 3;
  const rows = Math.ceil(sorted.length / columns);
  const lines: string[] = [];

  for (let row = 0; row < rows; row++) {
    const parts: string[] = [];
    for (let col = 0; col < columns; col++) {
      const idx = col * rows + row;
      const cmd = sorted[idx];
      if (!cmd) continue;
      parts.push(cmd.padEnd(colWidth));
    }
    lines.push(parts.join('').trimEnd());
  }

  return ['Available commands:', '', ...lines].join('\n');
}

export const cmd_ls: CommandHandler = (args, flags, { vfs }) => {
  if (args.length === 0) {
    return {
      type: 'output',
      content: formatCommandList([...getRegisteredCommands(), ...BUILTIN_COMMANDS]),
    };
  }

  const targetPath = args[0];
  const result = vfs.navigate(targetPath);

  if (!result.success) {
    return {
      type: 'error',
      content: `ls: cannot access '${targetPath}': No such file or directory`,
    };
  }

  const dir = result.node;
  if (dir.type !== 'directory') {
    return {
      type: 'error',
      content: `ls: ${targetPath}: Not a directory`,
    };
  }

  const children = dir.children || [];
  const showHidden = flags['a'] === true;
  const filtered = showHidden ? children : children.filter((n) => !n.name.startsWith('.'));

  if (filtered.length === 0) {
    return { type: 'output', content: '' };
  }

  // Format in columns
  const formatted = filtered
    .map((n) => {
      const type = n.type === 'directory' ? 'd' : '-';
      return `${type}${n.metadata.permissions}  ${n.metadata.size.toString().padStart(6)}  ${n.name}`;
    })
    .join('\n');

  return { type: 'output', content: formatted };
};
