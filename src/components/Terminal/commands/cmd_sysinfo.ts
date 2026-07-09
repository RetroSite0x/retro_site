import type { CommandHandler } from '../../../types/terminal';

export const cmd_sysinfo: CommandHandler = () => {
  return {
    type: 'output',
    content: `SYSTEM INFORMATION
====================
Name: Ann Naser Nabil
Occupation: Developer, Economist, Researcher
Languages: Python, Rust, TypeScript
Current Mission: Build useful things.
Status: Online

Uptime: 0 days, 0 hours, 5 minutes
Shell: v2.4.7
Terminal: VT220`,
  };
};
