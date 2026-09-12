import type { CommandHandler } from '../../../types/terminal';

const TRAIN = `    ~~~~ /\\_/\\
   ( o . o )
    > ^ <   /\\_/\\
   /|   |\\ (o . o)
  / |   | \\> ^ <
     |   | /|   |\\
  ~~^~^~^~^~^~^~^~~`;

export const cmd_sl: CommandHandler = () => {
  const lines = [
    '',
    '  ────────────────────────────────────────────────',
    '      Choo choo!',
    '',
    TRAIN,
    '',
    '  ════════════════════════════════════════════════',
    '  Platform 3: Next stop — a great portfolio.',
    '',
  ];

  return { type: 'output', content: lines.join('\n') };
};
