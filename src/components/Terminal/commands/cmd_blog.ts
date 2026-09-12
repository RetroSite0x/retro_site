import type { CommandHandler } from '../../../types/terminal';

export const cmd_blog: CommandHandler = (_args, _flags, { vfs }) => {
  const blogDir = vfs.resolvePath('/blog');

  if (!blogDir || blogDir.type !== 'directory' || !blogDir.children) {
    return { type: 'error', content: 'blog: No blog directory found' };
  }

  const lines: string[] = [
    'BLOG',
    '='.repeat(40),
    '',
  ];

  for (const post of blogDir.children) {
    if (post.type === 'file') {
      const title = post.content?.split('\n')[0]?.replace(/^#\s*/, '') ?? post.name;
      lines.push(`  ${post.name.padEnd(25)}${title}`);
    }
  }

  lines.push('');
  lines.push("Use 'cat /blog/<filename>' to read.");

  return { type: 'output', content: lines.join('\n') };
};
