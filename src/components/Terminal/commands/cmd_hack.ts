import type { CommandHandler } from '../../../types/terminal';

export const cmd_hack: CommandHandler = () => {
  const lines = [
    '',
    '  [*] Initializing hacking sequence...',
    '  [*] Bypassing firewall ████████████████ OK',
    '  [*] Exploiting zero-day   ████████████████ OK',
    '  [*] Cracking RSA-4096     ████████████████ OK',
    '  [*] Decrypting secrets    ████████████████ OK',
    '  [*] Covering tracks       ████████████████ OK',
    '  [*] Downloading mainframe ████████████████ OK',
    '',
    '  ┌─────────────────────────────────────┐',
    '  │  ACCESS GRANTED                     │',
    '  │                                     │',
    '  │  Welcome, operator.                 │',
    '  │  You are now root.                  │',
    '  │                                     │',
    '  │  ...just kidding, this is a         │',
    '  │  portfolio site. :P                 │',
    '  └─────────────────────────────────────┘',
    '',
  ];

  return { type: 'output', content: lines.join('\n') };
};
