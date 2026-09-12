import type { CommandHandler } from '../../../types/terminal';
import { papers, links } from '../../../data/portfolio';

const openLink = (url: string, label: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return { type: 'output' as const, content: `Opening ${label}...` };
};

export const cmd_papers: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    return openLink(links.arxivSearch, 'arXiv');
  }

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
  lines.push('Use --open to search arXiv.');

  return { type: 'output', content: lines.join('\n') };
};
