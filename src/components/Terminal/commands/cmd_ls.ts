import type { CommandHandler } from '../../../types/terminal';
import {
  formatPermissionsFromBits,
  coolsize,
  formatDate,
  padRight,
  padLeft,
} from '../../../lib/fileUtils';

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
  const showLong = flags['l'] === true;
  const humanSize = flags['h'] === true;
  const filtered = showHidden ? children : children.filter((n) => !n.name.startsWith('.'));

  if (filtered.length === 0) {
    return { type: 'output', content: '' };
  }

  if (showLong) {
    const lines = filtered.map((n) => {
      const isDir = n.type === 'directory';
      const perms = formatPermissionsFromBits(isDir, n.metadata.permissions);
      const links = isDir ? '2' : '1';
      const owner = padRight('nabil', 8);
      const group = padRight('users', 8);
      const size = humanSize
        ? padLeft(coolsize(n.metadata.size || 0), 6)
        : padLeft(String(n.metadata.size || 0), 8);
      const date = formatDate(n.metadata.updatedAt || n.metadata.createdAt);
      const indicator = isDir ? '/' : '';
      return `${perms} ${links} ${owner} ${group} ${size} ${date} ${n.name}${indicator}`;
    });

    const totalBlocks = Math.ceil(
      filtered.reduce((sum, n) => sum + (n.metadata.size || 0), 0) / 512,
    );
    return {
      type: 'output',
      content: `total ${totalBlocks}\n${lines.join('\n')}`,
    };
  }

  const formatted = filtered
    .map((n) => {
      const isDir = n.type === 'directory';
      const perms = formatPermissionsFromBits(isDir, n.metadata.permissions);
      const size = padLeft(String(n.metadata.size || 0), 6);
      return `${perms}  ${size}  ${n.name}`;
    })
    .join('\n');

  return { type: 'output', content: formatted };
};
