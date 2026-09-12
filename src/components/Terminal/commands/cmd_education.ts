import type { CommandHandler } from '../../../types/terminal';
import { education } from '../../../data/portfolio';

export const cmd_education: CommandHandler = () => {
  const lines: string[] = [
    'EDUCATION',
    '='.repeat(40),
    '',
  ];

  for (const edu of education) {
    lines.push(`  ${edu.degree}`);
    lines.push(`    ${edu.institution}`);
    lines.push(`    ${edu.years}`);
    lines.push('');
  }

  return { type: 'output', content: lines.join('\n') };
};
