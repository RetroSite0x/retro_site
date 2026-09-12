import type { CommandHandler } from '../../../types/terminal';
import { skills } from '../../../data/portfolio';

export const cmd_languages: CommandHandler = () => {
  const programmingLangs = skills.find(s => s.category === 'Languages')?.items.join(', ') ?? 'Python, SQL, Bash, JavaScript, TypeScript';

  const lines: string[] = [
    'LANGUAGES',
    '='.repeat(40),
    '',
    '  Spoken:',
    '    Bengali (Native)',
    '    English (Professional)',
    '',
    `  Programming:`,
    `    ${programmingLangs}`,
    '',
  ];

  return { type: 'output', content: lines.join('\n') };
};
