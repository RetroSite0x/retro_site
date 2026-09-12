import type { CommandHandler } from '../../../types/terminal';
import { experience } from '../../../data/portfolio';

export const cmd_experience: CommandHandler = () => {
  const lines: string[] = [
    'EXPERIENCE',
    '='.repeat(40),
    '',
  ];

  for (const e of experience) {
    lines.push(`  ${e.role}`);
    lines.push(`  ${e.org} | ${e.period}`);
    for (const b of e.bullets) {
      lines.push(`    \u2022 ${b}`);
    }
    lines.push('');
  }

  return { type: 'output', content: lines.join('\n') };
};
