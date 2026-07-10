import type { CommandHandler } from '../../../types/terminal';

const COW = [
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
].join('\n');

function buildBubble(message: string): string {
  const lines = message.split('\n');
  const maxLen = Math.max(...lines.map((l) => l.length));
  const width = Math.min(maxLen + 2, 60);

  // Truncate long lines
  const wrapped = lines.map((l) => (l.length > width - 2 ? l.slice(0, width - 5) + '...' : l));

  const top = ' ' + '_'.repeat(width);
  const bottom = ' ' + '-'.repeat(width);

  const middle = wrapped.map((l, i) => {
    const pad = l.length;
    const spaces = ' '.repeat(width - pad);
    if (wrapped.length === 1) {
      return '< ' + l + spaces + ' >';
    }
    if (i === 0) return '/ ' + l + spaces + ' \\';
    if (i === wrapped.length - 1) return '\\ ' + l + spaces + ' /';
    return '| ' + l + spaces + ' |';
  });

  return [top, ...middle, bottom].join('\n');
}

export const cmd_cowsay: CommandHandler = (args) => {
  const message = args.length > 0 ? args.join(' ') : 'moo';
  const bubble = buildBubble(message);

  return {
    type: 'output',
    content: bubble + '\n' + COW,
  };
};
