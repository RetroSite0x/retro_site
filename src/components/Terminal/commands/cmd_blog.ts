import type { CommandHandler } from '../../../types/terminal';

export const cmd_blog: CommandHandler = () => {
  const content = [
    'BLOG',
    '\u2550'.repeat(40),
    '',
    '  hello-world.md    Welcome to my digital garden',
    '  beni-story.md     The Story Behind BENI',
    '',
    "Use 'cat /blog/<filename>' to read.",
  ].join('\n');

  return { type: 'output', content };
};
