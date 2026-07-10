import type { CommandHandler } from '../../../types/terminal';

export const cmd_datasets: CommandHandler = () => {
  const content = [
    'DATASETS',
    '\u2550'.repeat(40),
    '',
    '  BENI v1.0',
    '    Bangla Economic Narrative Index',
    '    HuggingFace: AnnNaserNabil/BENI_v1_0',
    '',
    '  BENI Global 10',
    '    10 languages, 620K+ articles',
    '    arXiv:2606.10225',
    '',
    '  Sources: Potrika (2014-2020), BNAD (2021-2024)',
  ].join('\n');

  return { type: 'output', content };
};
