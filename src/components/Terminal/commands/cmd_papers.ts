import type { CommandHandler } from '../../../types/terminal';

export const cmd_papers: CommandHandler = () => {
  const content = [
    'PUBLICATIONS',
    '\u2550'.repeat(40),
    '',
    '[1] BENI Global 10: Multilingual Economic Narrative Corpus',
    '    for the Global South',
    '    arXiv:2606.10225 \u2014 June 2026',
    '',
    '[2] BENI v1.0: Bangla Economic Narrative Index Dataset',
    '    HuggingFace \u2014 2026',
    '',
    '[3] Does Institutional Quality Matter for Financial',
    '    Development?',
    '    Undergraduate Thesis \u2014 Jahangirnagar University',
    '',
    "Use 'cat /papers/<filename>.md' for details.",
  ].join('\n');

  return { type: 'output', content };
};
