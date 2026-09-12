import type { CommandHandler } from '../../../types/terminal';

export const cmd_coffee: CommandHandler = () => {
  const lines = [
    '',
    '  HTTP 418: I\'m a teapot.',
    '',
    '  ╔══════════════════════════════╗',
    '  ║  ( (                         ║',
    '  ║   ) )   ,,,,,                ║',
    '  ║  .___. / ~ ~ \\              ║',
    '  ║   \\  / \\  () /              ║',
    '  ║    \\/   \\___/               ║',
    '  ║    |  [_____]               ║',
    '  ║    \\ _/ \\___/               ║',
    '  ║     \"     \"                 ║',
    '  ║   Coffee cannot solve your  ║',
    '  ║   problems. But neither can  ║',
    '  ║   tea. Have both.            ║',
    '  ╚══════════════════════════════╝',
    '',
  ];

  return { type: 'output', content: lines.join('\n') };
};
