import type { CommandHandler } from '../../../types/terminal';
import type { FSNode } from '../../../types/vfs';

const NOW = '2026-07-09T00:00:00.000Z';

export const cmd_mkdir: CommandHandler = (args, _flags, { vfs }) => {
  if (args.length === 0) {
    return { type: 'error', content: 'mkdir: missing operand' };
  }

  const dirName = args[0];
  // Only allow creation in /tmp
  const parentPath = '/tmp';

  const newNode: FSNode = {
    name: dirName,
    type: 'directory',
    metadata: {
      size: 64,
      createdAt: NOW,
      updatedAt: NOW,
      executable: false,
      permissions: 'rwxr-xr-x',
      mimeType: 'inode/directory',
    },
    children: [],
  };

  const success = vfs.addNode(parentPath, newNode);
  if (!success) {
    return { type: 'error', content: `mkdir: cannot create directory '${dirName}'` };
  }

  return { type: 'output', content: '' };
};
