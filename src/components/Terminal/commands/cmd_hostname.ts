import type { CommandHandler } from '../../../types/terminal';

const HOSTNAME = 'port.nabil.local';
const IP = '192.168.1.42';

export const cmd_hostname: CommandHandler = (args) => {
  if (args[0] === '--ip' || args[0] === '-i') {
    return { type: 'output', content: IP };
  }

  return { type: 'output', content: HOSTNAME };
};
