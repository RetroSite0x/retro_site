import type { CommandHandler } from '../../../types/terminal';
import { projects } from '../../../data/portfolio';

export const cmd_projects: CommandHandler = () => {
  const lines: string[] = [
    'PROJECTS',
    '='.repeat(40),
  ];

  for (const p of projects) {
    lines.push(`  ${p.name.padEnd(20)} ${p.lang.padEnd(8)} ${p.status}`);
    lines.push(`    ${p.desc}`);
    lines.push('');
  }

  lines.push("Use 'cat /projects/<name>/README.md' for details.");

  return { type: 'output', content: lines.join('\n') };
};
