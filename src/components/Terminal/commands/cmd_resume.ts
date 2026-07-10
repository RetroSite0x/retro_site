import type { CommandHandler } from '../../../types/terminal';

export const cmd_resume: CommandHandler = (_args, _flags, { vfs }) => {
  const content = vfs.readFile('/home/guest/resume.txt');

  if (content === null) {
    return { type: 'error', content: 'resume: No resume file found' };
  }

  return { type: 'output', content };
};
