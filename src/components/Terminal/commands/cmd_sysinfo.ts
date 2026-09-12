import type { CommandHandler } from '../../../types/terminal';
import { identity } from '../../../data/portfolio';

export const cmd_sysinfo: CommandHandler = () => {
  return {
    type: 'output',
    content: `SYSTEM INFORMATION
====================
Name: ${identity.name}
Occupation: ${identity.role}
Languages: Python, SQL, Bash, JavaScript, TypeScript
Current Mission: Build useful things.
Status: ${identity.status}

Uptime: 0 days, 0 hours, 5 minutes
Shell: v2.4.7
Terminal: VT220`,
  };
};
