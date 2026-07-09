import type { CommandHandler } from '../../../types/terminal';

export const cmd_grep: CommandHandler = (args, _flags, { vfs }) => {
  if (args.length < 1) {
    return { type: 'error', content: 'grep: missing pattern' };
  }

  const pattern = args[0];
  const results = vfs.search(pattern);

  if (results.length === 0) {
    return { type: 'output', content: `No matches found for '${pattern}'` };
  }

  const lines = results.map(
    (r) => `${r.path}: ${r.matchLine || ''}`
  );

  return { type: 'output', content: lines.join('\n') };
};
