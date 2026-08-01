import type { CommandHandler } from '../../../types/terminal';

export const cmd_help: CommandHandler = () => {
  const commands = [
    '  help       Show this help message',
    '  ls         List directory contents',
    '  cd         Change directory',
    '  cat        Print file contents',
    '  pwd        Print working directory',
    '  clear      Clear terminal',
    '  sysinfo    Print system information',
    '  theme      Switch phosphor theme',
    '',
    '  about      Display profile summary',
    '  projects   List portfolio projects',
    '  research   Show research interests',
    '  papers     List publications',
    '  datasets   List published datasets',
    '  experience Show work history',
    '  skills     List technical skills',
    '  timeline   Show career timeline',
    '  resume     Display resume',
    '  github     Show GitHub profile',
    '  linkedin   Show LinkedIn profile',
    '  contact    Show contact details',
    '  blog       List blog posts',
    '  tree       Show directory tree',
    '  man        Show command manual',
  ];

  return {
    type: 'output',
    content: `Available commands:\n${commands.join('\n')}`,
  };
};
