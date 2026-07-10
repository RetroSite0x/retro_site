import type { CommandHandler } from '../../../types/terminal';

const GITHUB_USERNAME = 'AnnNaserNabil';
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;

const REPOS = [
  { name: 'AutoMLBench', desc: 'Automated ML benchmarking' },
  { name: 'TidyFlow', desc: 'Data preprocessing' },
  { name: 'FireViz', desc: 'Data visualization' },
  { name: 'BENI', desc: 'Bangla Economic Narrative Index' },
  { name: 'NLP-News-Rec', desc: 'News recommendation system' },
];

export const cmd_github: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    if (typeof window !== 'undefined') {
      window.open(GITHUB_URL, '_blank');
    }
    return { type: 'output', content: `Opening ${GITHUB_URL}...` };
  }

  const repoLines = REPOS.map(
    (r) => `    ${r.name.padEnd(18)} ${r.desc}`
  ).join('\n');

  return {
    type: 'output',
    content: [
      'GITHUB',
      '\u2550'.repeat(40),
      '',
      `  Profile:  ${GITHUB_URL}`,
      `  Username: ${GITHUB_USERNAME}`,
      '',
      '  Featured Repositories:',
      repoLines,
    ].join('\n'),
  };
};
