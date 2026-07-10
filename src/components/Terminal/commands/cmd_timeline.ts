import type { CommandHandler } from '../../../types/terminal';

export const cmd_timeline: CommandHandler = () => {
  const content = [
    'TIMELINE',
    '\u2550'.repeat(40),
    '',
    '  2014  Started writing for Prothom Alo',
    '  2017  Joined Earki as writer',
    '  2018  Began BS Economics at Jahangirnagar University',
    '  2024  BS Economics completed',
    '  2024  Data Science Intern @ Somikoron AI',
    '  2024  Started MS Economics',
    '  2024  Automation Engineer @ Khub Soja',
    '  2025  Released AutoMLBench, TidyFlow, FireViz',
    '  2025  BENI v1.0 dataset published on HuggingFace',
    '  2026  BENI Global 10 published on arXiv (first-author)',
    '  2026  Building this retro UNIX portfolio',
  ].join('\n');

  return { type: 'output', content };
};
