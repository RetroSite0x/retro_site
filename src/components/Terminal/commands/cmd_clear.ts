import type { CommandHandler } from '../../../types/terminal';

export const cmd_clear: CommandHandler = (_args, _flags, { terminal }) => {
  terminal.clear();
  return { type: 'output', content: '' };
};
