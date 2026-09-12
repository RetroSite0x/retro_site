import type { CommandHandler } from '../../../types/terminal';

const ASCII = [
  '        ,--,                       ',
  '      ,--.\'|                       ',
  '    ,--,  |                        ',
  '  ,--.\'   |                        ',
  '  |  | |  |                        ',
  '  |  |/   |                        ',
  '  |  |  /\'   .--.--.               ',
  '  `--\' /  \' /  /    \'              ',
  '    \' /  /| |  :  /`.\'             ',
  '    /  / / |  :  /_                 ',
  '   /  / /   \'  \'    \'              ',
  '  /  / /     \'--\'                  ',
  ' /  / /                            ',
  '/__\"/\'                             ',
].join('\n');

export const cmd_neofetch: CommandHandler = (_args, _flags, { system }) => {
  const theme = system.theme;
  const maxHostLen = 30;

  const lines: string[] = [];
  const hostLine = `guest@${'port.nabil.local'}`;

  lines.push(ASCII);
  lines.push('');

  // Right-align info next to the ASCII art
  const infoLines = [
    `guest@${'port.nabil.local'}`,
    '-'.repeat(Math.min(hostLine.length, maxHostLen)),
    `OS:     NABIL/86 v2.4 Bangla NLP Edition`,
    `Host:   CRAY X-MP/48`,
    `Kernel: nabil-2.4.7-generic`,
    `Shell:  nabilsh 2.4`,
    `Terminal: VT220`,
    `CPU:    MOS 6502 @ 8MHz + Ann-9000`,
    `Memory: 4.0 MB / 640 KB`,
    `Theme:  ${theme}`,
  ];

  // Indent to align with ASCII art width
  const indent = ' '.repeat(8);
  for (const line of infoLines) {
    lines.push(indent + line);
  }

  lines.push('');
  lines.push(indent + 'Lighthouse  ████ 100  ████ 100  ████ 100  ████ 100');
  lines.push(indent + '             Perf.    A11y     BP       SEO');

  const key = 'nabilos-visits';
  let count = 1;
  try {
    const raw = localStorage.getItem(key);
    count = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(key, String(count));
  } catch {}
  const formatted = count.toLocaleString();
  lines.push('');
  lines.push(indent + `\x1b[33m Visitors: \u258C${formatted}\u2590  [SINCE 2024] \x1b[0m`);

  return { type: 'output', content: lines.join('\n') };
};
