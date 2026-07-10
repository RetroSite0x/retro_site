import type { CommandHandler } from '../../../types/terminal';
import type { FSNode } from '../../../types/vfs';

function buildTree(node: FSNode, prefix: string = '', isRoot: boolean = true): string[] {
  const lines: string[] = [];

  if (isRoot) {
    lines.push(node.name);
  }

  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isLast = i === children.length - 1;
    const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
    const childPrefix = prefix + (isLast ? '    ' : '\u2502   ');

    lines.push(prefix + connector + child.name);

    if (child.type === 'directory' && child.children && child.children.length > 0) {
      const subLines = buildTree(child, childPrefix, false);
      lines.push(...subLines);
    }
  }

  return lines;
}

export const cmd_tree: CommandHandler = (args, _flags, { vfs }) => {
  const targetPath = args[0] || vfs.currentPath;
  const node = vfs.resolvePath(targetPath);

  if (!node) {
    return {
      type: 'error',
      content: `tree: ${targetPath}: No such file or directory`,
    };
  }

  if (node.type !== 'directory') {
    return {
      type: 'error',
      content: `tree: ${targetPath}: Not a directory`,
    };
  }

  const lines = buildTree(node);
  const dirCount = countDirectories(node);
  const fileCount = countFiles(node);

  lines.push('');
  lines.push(`${dirCount} ${dirCount === 1 ? 'directory' : 'directories'}, ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`);

  return { type: 'output', content: lines.join('\n') };
};

function countDirectories(node: FSNode): number {
  let count = 0;
  for (const child of node.children || []) {
    if (child.type === 'directory') {
      count += 1 + countDirectories(child);
    }
  }
  return count;
}

function countFiles(node: FSNode): number {
  let count = 0;
  for (const child of node.children || []) {
    if (child.type === 'file') {
      count += 1;
    } else {
      count += countFiles(child);
    }
  }
  return count;
}
