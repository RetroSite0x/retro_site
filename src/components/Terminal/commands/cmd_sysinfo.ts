import type { CommandHandler } from '../../../types/terminal';
import { identity, skills } from '../../../data/portfolio';

export const cmd_sysinfo: CommandHandler = () => {
  const languages = skills.find(s => s.category === 'Languages')?.items.join(', ') ?? 'Python, SQL, Bash, JavaScript, TypeScript';

  return {
    type: 'output',
    content: `SYSTEM INFORMATION
====================
Name: ${identity.name}
Occupation: ${identity.role}
Languages: ${languages}
Current Mission: Build useful things.
Status: ${identity.status}

Uptime: 0 days, 0 hours, 5 minutes
Shell: v2.4.7
Terminal: VT220`,
  };
};
