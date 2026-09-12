import type { CommandHandler } from '../../../types/terminal';
import { identity, links } from '../../../data/portfolio';

const openLink = (url: string, label: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return { type: 'output' as const, content: `Opening ${label}...` };
};

export const cmd_contact: CommandHandler = (args) => {
  if (args[0] === '--open' || args[0] === '-o') {
    const target = args[1]?.toLowerCase();
    switch (target) {
      case 'github': return openLink(links.githubEngineering, 'GitHub');
      case 'linkedin': return openLink(links.linkedin, 'LinkedIn');
      case 'twitter':
      case 'x': return openLink(links.x, 'Twitter/X');
      case 'huggingface':
      case 'hf': return openLink(links.huggingface, 'HuggingFace');
      case 'arxiv': return openLink(links.arxivSearch, 'arXiv');
      case 'academic': return openLink(links.academic, 'Academic Site');
      default: return openLink(links.website, 'Website');
    }
  }

  const content = [
    'CONTACT',
    '='.repeat(40),
    '',
    `  Email:     ${identity.email}`,
    `  GitHub:    github.com/${links.githubUsername}`,
    `  Website:   ${links.website.replace('https://', '')}`,
    `  Academic:  ${links.academic.replace('https://', '')}`,
    `  LinkedIn:  ${links.linkedin.replace('https://', '')}`,
    `  Twitter:   ${links.xHandle}`,
    `  HuggingFace: ${links.huggingface.replace('https://', '')}`,
    `  arXiv:     ${links.arxivSearch.replace('https://', '')}`,
    `  Location:  ${identity.location}`,
    '',
    '  Use --open [target] to open in browser.',
    '  Targets: github, linkedin, twitter, huggingface, arxiv, academic, website',
  ].join('\n');

  return { type: 'output', content };
};
