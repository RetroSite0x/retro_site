import type { CommandHandler } from '../../../types/terminal';

export const cmd_cd: CommandHandler = (args, _flags, { vfs }) => {
  const target = args[0] || '/home/guest';
  const result = vfs.navigate(target);

  if (!result.success) {
    return { type: 'error', content: result.error };
  }

  return { type: 'output', content: '' };
};
