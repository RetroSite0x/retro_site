import type { CommandHandler } from '../../../types/terminal';

const ART_PIECES: Record<string, { title: string; description: string; art: string }> = {
  terminal: {
    title: 'RETRO TERMINAL',
    description: 'A vintage mainframe terminal from the golden age of computing',
    art: `
   ╔══════════════════════════════╗
   ║  ┌──────────────────────┐   ║
   ║  │ > SYSTEM BOOT v2.0   │   ║
   ║  │ ████████████████░░░░ │   ║
   ║  │ LOADING MEMORY  64K  │   ║
   ║  │ OK                   │   ║
   ║  │ C:\\> RUN ART.EXE     │   ║
   ║  │                      │   ║
   ║  │  ** DEMAScene **
   ║  │  (c) 1989 RETRO-SYS  │   ║
   ║  └──────────────────────┘   ║
   ║    [■■■■■■■■] [●●●●●●●●]   ║
   ╚══════════════════════════════╝`,
  },
  cat: {
    title: 'PIXEL CAT',
    description: 'A cyberpunk cat roaming the neon-lit streets of the net',
    art: `
      /\\_/\\  
     ( o.o ) 
      > ^ <
     /|   |\\
    (_|   |_)
   __|     |__
  /  |     |  \\
 /   |     |   \\
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  ~ NEON PYTHON v9.7 ~`,
  },
  city: {
    title: 'CYBERPUNK CITYSCAPE',
    description: 'A neon-soaked metropolis skyline at midnight',
    art: `
                    *  .  *
           .   *        .       *
      .        .    *       .
                 .        *    .
   ▓▓▓   ▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓
   ▓▓▓   ▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓
   █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █
   █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    N E O N   D R I F T  2 0 8 7`,
  },
  geo: {
    title: 'ABSTRACT GEOMETRY',
    description: 'Demoscene fractal geometry in pure ASCII',
    art: `
         .  *  .
    .  *  /\\  *  .
   *  .  /  \\  .  *
  .  *  / ◆◆ \\  *  .
 *  .  / ◆◆◆◆ \\  .  *
  .  / ◆◆◆◆◆◆ \\  .
 *  / ◆◆◆◆◆◆◆◆ \\  *
  / ◆◆◆◆◆◆◆◆◆◆ \\
 *  \\ ◆◆◆◆◆◆◆◆ /  *
  .  \\ ◆◆◆◆◆◆ /  .
 *  .  \\ ◆◆◆◆ /  .  *
  .  *  \\ ◆◆ /  *  .
   *  .  \\  /  .  *
    .  *  \\/  *  .
         .  *  .
   ═══════════════
    GRIDWAVE-ASCII`,
  },
};

const NAMES = Object.keys(ART_PIECES);

export const cmd_art: CommandHandler = (args) => {
  if (flags('--list', args)) {
    const list = NAMES.map((n) => {
      const piece = ART_PIECES[n];
      return `  ${n.padEnd(12)} ${piece.title}`;
    }).join('\n');
    return { type: 'output', content: `Available art pieces:\n${list}` };
  }

  const name = args[0];

  if (name && ART_PIECES[name]) {
    const piece = ART_PIECES[name];
    return {
      type: 'output',
      content: `╔══ ${piece.title} ══╗\n${piece.art}\n╚══ ${piece.description} ══╝`,
    };
  }

  const randomKey = NAMES[Math.floor(Math.random() * NAMES.length)];
  const piece = ART_PIECES[randomKey];
  return {
    type: 'output',
    content: `╔══ ${piece.title} ══╗\n${piece.art}\n╚══ ${piece.description} ══╝\n\nUsage: art <name> | art --list`,
  };
};

function flags(flag: string, args: string[]): boolean {
  return args.includes(flag);
}
