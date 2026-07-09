import type { CommandHandler } from '../../../types/terminal';
import type { FSNode } from '../../../types/vfs';

const NOW = '2026-07-09T00:00:00.000Z';

export const cmd_touch: CommandHandler = (args, _flags, { vfs }) => {
  if (args.length === 0) {
    return { type: 'error', content: 'touch: missing operand' };
  }

  const fileName = args[0];
  // Only allow creation in /tmp
  const parentPath = '/tmp';

  const newNode: FSNode = {
    name: fileName,
    type: 'file',
    content: '',
    metadata: {
      size: 0,
      createdAt: NOW,
      updatedAt: NOW,
      executable: false,
      permissions: 'rw-r--r--',
      mimeType: 'text/plain',
    },
  };

  const success = vfs.addNode(parentPath, newNode);
  if (!success) {
    return { type: 'error', content: `touch: cannot create file '${fileName}'` };
  }

  return { type: 'output', content: '' };
};
