import type { CommandHandler } from '../../../types/terminal';

const VIBE_LINES: Record<string, string> = {
  green:      '> system online. the phosphor remembers everything.',
  amber:      '> warm glow, warm thoughts. vintage silicon purrs softly.',
  white:      '> clean signal. no noise. just the work.',
  blue:       '> cold logic runs deep. ice-cold terminals, burning ideas.',
  dracula:    '> the night is dark and full of syntax errors.',
  nord:       '> arctic calm. every byte is perfectly ordered.',
  solarized:  '> solar-powered. the sun never sets on good ergonomics.',
  ubuntu:     '> i am because we are. community-driven since day one.',
  default:    '> ...a mysterious glow emanates from the monitor.',
};

export const cmd_vibe: CommandHandler = (_args, _flags, { system }) => {
  const line = VIBE_LINES[system.theme] ?? VIBE_LINES.default;
  return { type: 'output', content: line };
};
