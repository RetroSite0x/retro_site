import type { CommandHandler } from '../../../types/terminal';
import { links } from '../../../data/portfolio';

export const cmd_website: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    if (typeof window !== 'undefined') {
      window.open(links.website, '_blank');
    }
    return { type: 'output', content: `Opening ${links.website}...` };
  }

  const lines: string[] = [
    'WEBSITE',
    '='.repeat(40),
    '',
    `  Main:      ${links.website}`,
    `  Portfolio: ${links.portfolio}`,
    `  Academic:  ${links.academic}`,
    '',
    '  Use --open or -o to open in browser.',
  ];

  return { type: 'output', content: lines.join('\n') };
};
