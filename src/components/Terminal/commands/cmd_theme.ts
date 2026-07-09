import type { CommandHandler } from '../../../types/terminal';
import type { PhosphorTheme } from '../../../types/system';

const VALID_THEMES: PhosphorTheme[] = ['green', 'amber', 'white', 'blue'];

export const cmd_theme: CommandHandler = (args, _flags, { system }) => {
  if (args.length === 0) {
    return { type: 'output', content: `Current theme: ${system.theme}\nAvailable: ${VALID_THEMES.join(', ')}` };
  }

  const theme = args[0].toLowerCase() as PhosphorTheme;
  if (!VALID_THEMES.includes(theme)) {
    return {
      type: 'error',
      content: `theme: '${args[0]}' is not a valid theme. Available: ${VALID_THEMES.join(', ')}`,
    };
  }

  system.setTheme(theme);
  return { type: 'output', content: `Theme set to '${theme}'.` };
};
