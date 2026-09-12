import type { CommandHandler } from '../../../types/terminal';
import { identity, links } from '../../../data/portfolio';

export const cmd_contact: CommandHandler = () => {
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
  ].join('\n');

  return { type: 'output', content };
};
