import type { CommandHandler } from '../../../types/terminal';

export const cmd_sort: CommandHandler = (args, flags, { vfs }) => {
  const reverse = flags['r'] === true;
  const targetPath = args[0];

  if (!targetPath) {
    return { type: 'error', content: 'sort: missing file operand' };
  }

  const content = vfs.readFile(targetPath);
  if (content === null) {
    const resolved = vfs.resolvePath(targetPath);
    if (resolved && resolved.type === 'directory') {
      return { type: 'error', content: `sort: ${targetPath}: Is a directory` };
    }
    return { type: 'error', content: `sort: ${targetPath}: No such file or directory` };
  }

  const lines = content.split('\n').sort();
  if (reverse) lines.reverse();
  return { type: 'output', content: lines.join('\n') };
};
