import type { CommandHandler } from '../../../types/terminal';
import { blogPosts } from '../../../data/portfolio';

export const cmd_blog: CommandHandler = () => {
  const lines: string[] = [
    'BLOG',
    '='.repeat(40),
    '',
  ];

  for (const post of blogPosts) {
    lines.push(`  ${post.file.padEnd(20)}${post.title}`);
  }

  lines.push('');
  lines.push("Use 'cat /blog/<filename>' to read.");

  return { type: 'output', content: lines.join('\n') };
};
