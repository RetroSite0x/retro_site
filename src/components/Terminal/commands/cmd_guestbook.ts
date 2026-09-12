import type { CommandHandler } from '../../../types/terminal';

interface GuestbookEntry {
  timestamp: string;
  username: string;
  message: string;
}

const STORAGE_KEY = 'nabilos-guestbook';

const SEED_ENTRIES: GuestbookEntry[] = [
  { timestamp: '2025-06-15 14:32:01', username: 'visitor_0x42', message: 'Cool retro site! Love the CRT effects.' },
  { timestamp: '2025-07-03 09:17:44', username: 'anon_researcher', message: 'BENI research is impressive. Good luck with PhD apps!' },
  { timestamp: '2025-08-20 22:05:12', username: 'terminal_addict', message: 'The snake game is addictive.' },
  { timestamp: '2025-09-11 16:48:33', username: 'data_scientist_42', message: 'Bangla NLP needs more work like this.' },
  { timestamp: '2025-10-01 11:22:58', username: 'web_designer_99', message: 'This portfolio is fire. Literally. \uD83D\uDD25' },
];

function getEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
      return [...SEED_ENTRIES];
    }
    return JSON.parse(raw) as GuestbookEntry[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
    return [...SEED_ENTRIES];
  }
}

function saveEntries(entries: GuestbookEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatEntry(entry: GuestbookEntry): string {
  return `  [${entry.timestamp}] ${entry.username}: ${entry.message}`;
}

export const cmd_guestbook: CommandHandler = (args, flags) => {
  if (flags.sign === true || typeof flags.sign === 'string') {
    const message = typeof flags.sign === 'string' ? flags.sign.trim() : args.join(' ').trim();
    if (!message) {
      return { type: 'error', content: 'Usage: guestbook --sign "Your message"' };
    }

    const entries = getEntries();
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

    const newEntry: GuestbookEntry = {
      timestamp,
      username: 'anonymous',
      message,
    };

    entries.push(newEntry);
    saveEntries(entries);

    const lines = [
      '╔══════════════════════════════════════════════════╗',
      '║           ✓ GUESTBOOK — Entry Added             ║',
      '╠══════════════════════════════════════════════════╣',
      '',
      `  ${formatEntry(newEntry)}`,
      '',
      '  Thanks for signing! Come back anytime.',
      '╚══════════════════════════════════════════════════╝',
    ];

    return { type: 'output', content: lines.join('\n') };
  }

  const entries = getEntries();
  const recent = entries.slice(-10);

  const lines = [
    '╔══════════════════════════════════════════════════╗',
    '║             📖 GUESTBOOK                       ║',
    '║    Recent visitors who stopped by               ║',
    '╠══════════════════════════════════════════════════╣',
    '',
    ...recent.map((e) => formatEntry(e)),
    '',
    '  ─────────────────────────────────────────────',
    `  ${entries.length} total entries | Showing last ${recent.length}`,
    '  Sign with: guestbook --sign "Your message"',
    '╚══════════════════════════════════════════════════╝',
  ];

  return { type: 'output', content: lines.join('\n') };
};
