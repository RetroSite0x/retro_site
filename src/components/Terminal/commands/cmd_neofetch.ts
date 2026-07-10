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

  return { type: 'output', content: lines.join('\n') };
};
