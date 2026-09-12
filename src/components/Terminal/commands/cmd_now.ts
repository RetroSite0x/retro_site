import type { CommandHandler } from '../../../types/terminal';

export const cmd_now: CommandHandler = (_args, _flags, { vfs }) => {
  const content = vfs.readFile('/home/guest/now.md');

  if (content === null) {
    return {
      type: 'error',
      content: 'now: no "now" page found at /home/guest/now.md',
    };
  }

  return { type: 'output', content };
};
