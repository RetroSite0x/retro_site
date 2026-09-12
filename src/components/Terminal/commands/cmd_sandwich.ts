import type { CommandHandler } from '../../../types/terminal';

export const cmd_sandwich: CommandHandler = (_args, _flags, { system }) => {
  if (system.username !== 'root') {
    return {
      type: 'error',
      content:
        "Nice try. You're not root.\n\n" +
        "  Here's a sandwich anyway:\n" +
        '      ___\n' +
        '   __//_//_\\\n' +
        '  /  ===     \\\n' +
        '  \\  (T)  (T)/\n' +
        '   \\  ====== /',
    };
  }

  return {
    type: 'output',
    content: 'Making you a sandwich... 🥪\nEnjoy, root!',
  };
};
