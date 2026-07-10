import type { CommandHandler } from '../../../types/terminal';

export const cmd_experience: CommandHandler = () => {
  const content = [
    'EXPERIENCE',
    '\u2550'.repeat(40),
    '',
    '  Automation Operation Specialist',
    '  Khub Soja | Oct 2024 - Present',
    '    \u2022 Built 20+ n8n automation workflows',
    '    \u2022 10+ API integrations',
    '    \u2022 Event-driven architecture',
    '',
    '  Data Science Intern',
    '  Somikoron AI | Jan - Jun 2024',
    '    \u2022 NLP news recommendation system',
    '    \u2022 50K+ articles processed',
    '    \u2022 75% faster extraction',
    '',
    '  Freelance Writer',
    '  Prothom Alo | 2014 - Present',
    '    \u2022 Feature stories, satire, youth content',
    '',
    '  Writer',
    '  Earki | 2017 - Present',
    '    \u2022 Satirical writing, social commentary',
  ].join('\n');

  return { type: 'output', content };
};
