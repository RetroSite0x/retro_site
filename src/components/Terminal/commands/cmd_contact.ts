import type { CommandHandler } from '../../../types/terminal';

export const cmd_contact: CommandHandler = () => {
  const content = [
    'CONTACT',
    '\u2550'.repeat(40),
    '',
    '  Email:     ann.n.nabil@gmail.com',
    '  GitHub:    github.com/AnnNaserNabil',
    '  Website:   nabil.iam.bd',
    '  Academic:  Ann-Naser-Nabil.github.io',
    '  LinkedIn:  linkedin.com/in/ann-naser-nabil',
    '  Twitter:   @ann_naser',
    '  HuggingFace: huggingface.co/AnnNaserNabil',
    '  arXiv:     arxiv.org/search/?query=Ann+Naser+Nabil',
    '  Location:  Dhaka, Bangladesh',
  ].join('\n');

  return { type: 'output', content };
};
