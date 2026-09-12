import type { CommandHandler } from '../../../types/terminal';
import { beni } from '../../../data/portfolio';

const focusDisplay: ReadonlyArray<{ area: string; desc: string }> = [
  { area: 'Bangla NLP',              desc: 'Low-resource language processing' },
  { area: 'Computational Social Sci', desc: 'Economic narrative analysis' },
  { area: 'Economic Narrative',      desc: 'Sentiment & forecasting' },
  { area: 'Data Science',            desc: 'Applied ML for real problems' },
];

export const cmd_research: CommandHandler = () => {
  const lines: string[] = [
    'RESEARCH INTERESTS',
    '='.repeat(40),
    '',
  ];

  for (const f of focusDisplay) {
    lines.push(`  ${f.area.padEnd(26)}${f.desc}`);
  }

  lines.push('');
  lines.push(`Current: ${beni.shortName} Global 10 \u2014 Multilingual Economic Corpus`);
  lines.push(`  ${beni.global10Languages} languages, ${beni.global10Articles} articles, ${beni.global10Families} language families`);
  lines.push(`  arXiv:${beni.arxivId}`);

  return { type: 'output', content: lines.join('\n') };
};
