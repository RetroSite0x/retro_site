import type { CommandHandler } from '../../../types/terminal';

export const cmd_echo: CommandHandler = (args) => {
  return { type: 'output', content: args.join(' ') };
};
