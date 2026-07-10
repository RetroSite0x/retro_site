import type { CommandHandler } from '../../../types/terminal';

const LINKEDIN_URL = 'https://linkedin.com/in/ann-naser-nabil';
const LINKEDIN_USERNAME = 'ann-naser-nabil';

export const cmd_linkedin: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    if (typeof window !== 'undefined') {
      window.open(LINKEDIN_URL, '_blank');
    }
    return { type: 'output', content: `Opening ${LINKEDIN_URL}...` };
  }

  return {
    type: 'output',
    content: [
      'LINKEDIN',
      '\u2550'.repeat(40),
      '',
      `  Profile:  ${LINKEDIN_URL}`,
      `  Username: ${LINKEDIN_USERNAME}`,
      '',
      '  Use --open or -o to open in browser.',
    ].join('\n'),
  };
};
