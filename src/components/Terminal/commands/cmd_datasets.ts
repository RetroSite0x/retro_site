import type { CommandHandler } from '../../../types/terminal';
import { datasets, beni, links } from '../../../data/portfolio';

const openLink = (url: string, label: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return { type: 'output' as const, content: `Opening ${label}...` };
};

export const cmd_datasets: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    const target = args[1]?.toLowerCase();
    switch (target) {
      case 'huggingface':
      case 'hf': return openLink(links.huggingface, 'HuggingFace');
      case 'arxiv': return openLink(links.arxivSearch, 'arXiv');
      default: return openLink(links.huggingface, 'HuggingFace');
    }
  }

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
  lines.push('');
  lines.push('  Use --open [huggingface|arxiv] to open in browser.');

  return { type: 'output', content: lines.join('\n') };
};
