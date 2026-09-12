import type { CommandHandler } from '../../../types/terminal';
import { links } from '../../../data/portfolio';

export const cmd_github: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    if (typeof window !== 'undefined') {
      window.open(links.githubEngineering, '_blank');
    }
    return { type: 'output', content: `Opening ${links.githubEngineering}...` };
  }

  const repoLines = [
    '    AutoMLBench       Automated ML benchmarking',
    '    TidyFlow          Data preprocessing',
    '    FireViz           Data visualization',
    '    BENI              Bangla Economic Narrative Index',
    '    NLP-News-Rec      News recommendation system',
  ].join('\n');

  return {
    type: 'output',
    content: [
      'GITHUB',
      '='.repeat(40),
      '',
      `  Profile:  ${links.githubEngineering}`,
      `  Username: ${links.githubUsername}`,
      '',
      '  Featured Repositories:',
      repoLines,
    ].join('\n'),
  };
};
