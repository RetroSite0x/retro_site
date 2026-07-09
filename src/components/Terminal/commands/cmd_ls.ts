import type { CommandHandler } from '../../../types/terminal';

export const cmd_ls: CommandHandler = (args, flags, { vfs }) => {
  const targetPath = args[0] || vfs.currentPath;
  const result = vfs.navigate(targetPath);

  if (!result.success) {
    return {
      type: 'error',
      content: `ls: cannot access '${targetPath}': No such file or directory`,
    };
  }

  const dir = result.node;
  if (dir.type !== 'directory') {
    return {
      type: 'error',
      content: `ls: ${targetPath}: Not a directory`,
    };
  }

  const children = dir.children || [];
  const showHidden = flags['a'] === true;
  const filtered = showHidden ? children : children.filter((n) => !n.name.startsWith('.'));

  if (filtered.length === 0) {
    return { type: 'output', content: '' };
  }

  // Format in columns
  const formatted = filtered
    .map((n) => {
      const type = n.type === 'directory' ? 'd' : '-';
      return `${type}${n.metadata.permissions}  ${n.metadata.size.toString().padStart(6)}  ${n.name}`;
    })
    .join('\n');

  return { type: 'output', content: formatted };
};
