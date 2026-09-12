import type { CommandHandler } from '../../../types/terminal';

const DIGITS: Record<string, string[]> = {
  '0': [
    ' ███ ',
    '█   █',
    '█   █',
    '█   █',
    ' ███ ',
  ],
  '1': [
    '  █  ',
    ' ██  ',
    '  █  ',
    '  █  ',
    ' ███ ',
  ],
  '2': [
    ' ███ ',
    '█   █',
    '  ██ ',
    ' █   ',
    '█████',
  ],
  '3': [
    '█████',
    '   █ ',
    ' ███ ',
    '   █ ',
    '█████',
  ],
  '4': [
    '█   █',
    '█   █',
    '█████',
    '    █',
    '    █',
  ],
  '5': [
    '█████',
    '█    ',
    '████ ',
    '    █',
    '████ ',
  ],
  '6': [
    ' ███ ',
    '█    ',
    '████ ',
    '█   █',
    ' ███ ',
  ],
  '7': [
    '█████',
    '    █',
    '   █ ',
    '  █  ',
    '  █  ',
  ],
  '8': [
    ' ███ ',
    '█   █',
    ' ███ ',
    '█   █',
    ' ███ ',
  ],
  '9': [
    ' ███ ',
    '█   █',
    ' ████',
    '    █',
    ' ███ ',
  ],
  ':': [
    '     ',
    '  █  ',
    '     ',
    '  █  ',
    '     ',
  ],
};

export const cmd_clock: CommandHandler = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${h}:${m}:${s}`;
  const dateStr = now.toISOString().slice(0, 10);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const lines: string[] = [];
  for (let row = 0; row < 5; row++) {
    const parts = timeStr.split('').map(ch => DIGITS[ch][row]);
    lines.push(parts.join(' '));
  }

  lines.push('');
  lines.push(`  DATE: ${dateStr}  TZ: ${tz}`);
  lines.push('');
  lines.push('  ╔══════════════════════════════════════╗');
  lines.push('  ║  SYSTEM CLOCK v2.4 — CRAY X-MP/48   ║');
  lines.push('  ╚══════════════════════════════════════╝');

  return { type: 'output', content: lines.join('\n') };
};
