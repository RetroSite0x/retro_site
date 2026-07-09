import type { CommandHandler } from '../../../types/terminal';

export const cmd_pwd: CommandHandler = (_args, _flags, { vfs }) => {
  return { type: 'output', content: vfs.currentPath };
};
