import type { CommandHandler } from '../../../types/terminal';

export const cmd_less: CommandHandler = (args, _flags, { vfs }) => {
  const targetPath = args[0];

  if (!targetPath) {
    return { type: 'error', content: 'less: missing file operand' };
  }

  const content = vfs.readFile(targetPath);
  if (content === null) {
    const resolved = vfs.resolvePath(targetPath);
    if (resolved && resolved.type === 'directory') {
      return { type: 'error', content: `less: ${targetPath}: Is a directory` };
    }
    return { type: 'error', content: `less: ${targetPath}: No such file or directory` };
  }

  return { type: 'output', content };
};
