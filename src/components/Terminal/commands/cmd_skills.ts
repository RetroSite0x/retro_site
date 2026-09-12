import type { CommandHandler } from '../../../types/terminal';
import { skills } from '../../../data/portfolio';

export const cmd_skills: CommandHandler = () => {
  const lines: string[] = [
    'SKILLS',
    '='.repeat(40),
    '',
  ];

  for (const cat of skills) {
    lines.push(`  ${cat.category.padEnd(14)} ${cat.items.join(', ')}`);
  }

  return { type: 'output', content: lines.join('\n') };
};
