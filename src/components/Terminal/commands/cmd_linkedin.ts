import type { CommandHandler } from '../../../types/terminal';
import { links } from '../../../data/portfolio';

export const cmd_linkedin: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    if (typeof window !== 'undefined') {
      window.open(links.linkedin, '_blank');
    }
    return { type: 'output', content: `Opening ${links.linkedin}...` };
  }

  return {
    type: 'output',
    content: [
      'LINKEDIN',
      '='.repeat(40),
      '',
      `  Profile:  ${links.linkedin}`,
      `  Username: ${links.linkedinUsername}`,
      '',
      '  Use --open or -o to open in browser.',
    ].join('\n'),
  };
};
