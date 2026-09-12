import type { CommandHandler } from '../../../types/terminal';
import { papers } from '../../../data/portfolio';

export const cmd_papers: CommandHandler = () => {
  const lines: string[] = [
    'PUBLICATIONS',
    '='.repeat(40),
    '',
  ];

  for (let i = 0; i < papers.length; i++) {
    const p = papers[i];
    const num = i + 1;
    lines.push(`[${num}] ${p.title}`);
    lines.push(`    ${p.venue} \u2014 ${p.year}`);
    lines.push('');
  }

  lines.push("Use 'cat /papers/<filename>.md' for details.");

  return { type: 'output', content: lines.join('\n') };
};
