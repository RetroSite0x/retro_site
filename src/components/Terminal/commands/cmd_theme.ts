import type { CommandHandler } from '../../../types/terminal';
import type { PhosphorTheme, CustomThemeColors } from '../../../types/system';
import { useSystemStore } from '../../../store/useSystem';

const VALID_THEMES: PhosphorTheme[] = ['green', 'amber', 'white', 'blue', 'dracula', 'nord', 'solarized', 'ubuntu'];

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(hex);
}

function parseHexColor(hex: string): string | null {
  if (!isValidHex(hex)) return null;
  const cleaned = hex.toLowerCase();
  if (cleaned.length === 4) {
    return '#' + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2] + cleaned[3] + cleaned[3];
  }
  return cleaned;
}

export const cmd_theme: CommandHandler = (args, flags, { system }) => {
  if (flags['create']) {
    const name = args[0];
    if (!name) {
      return { type: 'error', content: "theme --create: theme name required. Usage: theme --create 'MyTheme' --bg '#1a1a2e' --fg '#e0e0e0' --accent '#ff6b35'" };
    }

    const bg = typeof flags['bg'] === 'string' ? parseHexColor(flags['bg']) : null;
    const fg = typeof flags['fg'] === 'string' ? parseHexColor(flags['fg']) : null;
    const accent = typeof flags['accent'] === 'string' ? parseHexColor(flags['accent']) : null;
    const phosphor = typeof flags['phosphor'] === 'string' ? parseHexColor(flags['phosphor']) : undefined;

    if (!bg || !fg || !accent) {
      const missing: string[] = [];
      if (!bg) missing.push('--bg');
      if (!fg) missing.push('--fg');
      if (!accent) missing.push('--accent');
      return { type: 'error', content: `theme --create: invalid or missing color for ${missing.join(', ')}. Expected hex like '#1a1a2e'.` };
    }

    const colors: CustomThemeColors = { bg, fg, accent };
    if (phosphor) colors.phosphor = phosphor;

    const state = useSystemStore.getState();
    state.addCustomTheme(name, colors);
    state.setTheme(name as PhosphorTheme);

    return { type: 'output', content: `Custom theme '${name}' created and applied.\n  bg: ${bg}\n  fg: ${fg}\n  accent: ${accent}${phosphor ? `\n  phosphor: ${phosphor}` : ''}` };
  }

  if (flags['list']) {
    const state = useSystemStore.getState();
    const customNames = Object.keys(state.customThemes);
    let output = `Current theme: ${system.theme}\nBuilt-in: ${VALID_THEMES.join(', ')}`;
    if (customNames.length > 0) {
      output += `\nCustom: ${customNames.join(', ')}`;
    }
    return { type: 'output', content: output };
  }

  if (args.length === 0) {
    const state = useSystemStore.getState();
    const customNames = Object.keys(state.customThemes);
    let output = `Current theme: ${system.theme}\nAvailable: ${VALID_THEMES.join(', ')}`;
    if (customNames.length > 0) {
      output += `\nCustom: ${customNames.join(', ')}`;
    }
    return { type: 'output', content: output };
  }

  const theme = args[0].toLowerCase();
  const state = useSystemStore.getState();
  const isCustom = state.customThemes[theme];

  if (isCustom) {
    state.setTheme(theme as PhosphorTheme);
    return { type: 'output', content: `Theme set to '${theme}'.` };
  }

  const builtin = theme as PhosphorTheme;
  if (!VALID_THEMES.includes(builtin)) {
    return {
      type: 'error',
      content: `theme: '${args[0]}' is not a valid theme. Available: ${VALID_THEMES.join(', ')}`,
    };
  }

  system.setTheme(builtin);
  return { type: 'output', content: `Theme set to '${theme}'.` };
};
