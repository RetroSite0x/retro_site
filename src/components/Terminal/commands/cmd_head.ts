import type { CommandHandler } from '../../../types/terminal';

export const cmd_head: CommandHandler = (args, flags, { vfs }) => {
  const nFlag = typeof flags['n'] === 'number' ? flags['n'] : parseInt(String(flags['n'] || ''), 10);
  const lines = isNaN(nFlag) ? 10 : nFlag;
  const targetPath = args[0];

  if (!targetPath) {
    return { type: 'error', content: 'head: missing file operand' };
  }

  const content = vfs.readFile(targetPath);
  if (content === null) {
    const resolved = vfs.resolvePath(targetPath);
    if (resolved && resolved.type === 'directory') {
      return { type: 'error', content: `head: ${targetPath}: Is a directory` };
    }
    return { type: 'error', content: `head: ${targetPath}: No such file or directory` };
  }

  const fileLines = content.split('\n');
  const head = fileLines.slice(0, lines).join('\n');
  return { type: 'output', content: head };
};
