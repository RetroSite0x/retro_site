import type { CommandHandler } from '../../../types/terminal';

export const cmd_fire: CommandHandler = () => {
  const lines = [
    '',
    '        )  (  (',
    '       (    )) |',
    '     \\   ))(\\ /',
    '      \\\'\\  ) \\|',
    '       | | \\  |',
    '       | |  | |',
    '       | |  | |',
    '       | |  | |',
    '      /| |  | \\',
    '     / | |  | \\',
    '    /  | |  |  \\',
    '   /   / |  |   \\',
    '  (   (  |  |    )',
    '   \\   \\ |  |   /',
    '    \\  / \\|  |  /',
    '     \\/    \\|  |',
    '             \\|',
    '',
    '  🔥  You are on fire. Literally.',
    '',
  ];

  return { type: 'output', content: lines.join('\n') };
};
