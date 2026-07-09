import type { CommandHandler } from '../../../types/terminal';

export const cmd_cat: CommandHandler = (args, _flags, { vfs }) => {
  if (args.length === 0) {
    return { type: 'error', content: 'cat: missing operand' };
  }

  const filePath = args[0];
  const content = vfs.readFile(filePath);

  if (content === null) {
    // Check if it's a directory
    const resolved = vfs.resolvePath(filePath);
    if (resolved && resolved.type === 'directory') {
      return { type: 'error', content: `cat: ${args[0]}: Is a directory` };
    }
    return { type: 'error', content: `cat: ${args[0]}: No such file` };
  }

  return { type: 'output', content };
};
