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
    '  echo       Print text',
    '  grep       Search file contents',
    '  theme      Switch phosphor theme',
    '  mkdir      Create directory',
    '  touch      Create empty file',
    '',
    '  whoami     Display current user',
    '  uname      Print system info',
    '  exit       End terminal session',
    '  reboot     Refresh desktop session',
  ];

  return {
    type: 'output',
    content: `Available commands:\n${commands.join('\n')}`,
  };
};
