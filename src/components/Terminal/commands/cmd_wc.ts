import type { CommandHandler } from '../../../types/terminal';

export const cmd_wc: CommandHandler = (args, flags, { vfs }) => {
  const targetPath = args[0];

  if (!targetPath) {
    return { type: 'error', content: 'wc: missing file operand' };
  }

  const content = vfs.readFile(targetPath);
  if (content === null) {
    const resolved = vfs.resolvePath(targetPath);
    if (resolved && resolved.type === 'directory') {
      return { type: 'error', content: `wc: ${targetPath}: Is a directory` };
    }
    return { type: 'error', content: `wc: ${targetPath}: No such file or directory` };
  }

  const fileLines = content.split('\n');
  const lines = fileLines.length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const bytes = new TextEncoder().encode(content).length;

  const showLines = flags['l'] === true;
  const showWords = flags['w'] === true;
  const showChars = flags['c'] === true || flags['m'] === true;

  if (!showLines && !showWords && !showChars) {
    return {
      type: 'output',
      content: `  ${lines}  ${words} ${chars} ${targetPath}`,
    };
  }

  const parts: string[] = [];
  if (showLines) parts.push(String(lines).padStart(8));
  if (showWords) parts.push(String(words).padStart(8));
  if (showChars) parts.push(String(bytes).padStart(8));
  return { type: 'output', content: `${parts.join('')} ${targetPath}` };
};
