import type { CommandHandler } from '../../../types/terminal';
import { datasets, beni } from '../../../data/portfolio';

export const cmd_datasets: CommandHandler = () => {
  const lines: string[] = [
    'DATASETS',
    '='.repeat(40),
    '',
  ];

  for (const d of datasets) {
    lines.push(`  ${d.name}`);
    lines.push(`    ${d.desc}`);
    lines.push(`    ${d.source}`);
    lines.push('');
  }

  lines.push(`  Sources: ${beni.sources}`);

  return { type: 'output', content: lines.join('\n') };
};
