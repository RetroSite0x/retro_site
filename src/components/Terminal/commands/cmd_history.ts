import type { CommandHandler } from '../../../types/terminal';

export const cmd_history: CommandHandler = (_args, flags, stores) => {
  if (flags.clear) {
    stores.terminal.clear();
    return { type: 'output', content: 'History cleared.' };
  }

  const history = stores.terminal.commandHistory;

  if (history.length === 0) {
    return { type: 'output', content: 'No history yet.' };
  }

  if (flags.graph || flags.g) {
    const counts: Record<string, number> = {};
    for (const cmd of history) {
      const name = cmd.split(' ')[0] || cmd;
      counts[name] = (counts[name] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxCount = sorted[0][1];
    const maxBar = 30;
    const maxNameLen = Math.max(...sorted.map(([name]) => name.length));

    const lines = [
      'COMMAND FREQUENCY (top 10)',
      '═'.repeat(maxNameLen + maxBar + 10),
    ];

    for (const [name, count] of sorted) {
      const barLen = Math.round((count / maxCount) * maxBar);
      const bar = '█'.repeat(barLen);
      const padded = name.padEnd(maxNameLen);
      lines.push(`${padded}  ${bar} ${count}`);
    }

    lines.push('═'.repeat(maxNameLen + maxBar + 10));
    lines.push(`Total commands: ${history.length}`);

    return { type: 'output', content: lines.join('\n') };
  }

  const last20 = history.slice(-20);
  const lines = last20.map((cmd, i) => {
    const num = String(history.length - last20.length + i + 1).padStart(4);
    return `${num}  ${cmd}`;
  });

  return { type: 'output', content: lines.join('\n') };
};
