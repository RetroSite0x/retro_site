import type { CommandHandler } from '../../../types/terminal';
import { timeline } from '../../../data/portfolio';

export const cmd_timeline: CommandHandler = () => {
  const lines: string[] = [
    'TIMELINE',
    '='.repeat(40),
    '',
  ];

  for (const t of timeline) {
    lines.push(`  ${t.year}  ${t.event}`);
  }

  return { type: 'output', content: lines.join('\n') };
};
