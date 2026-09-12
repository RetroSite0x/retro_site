export type BootPhase = 'bios' | 'login' | 'challenge' | 'desktop';
export type PhosphorTheme = 'green' | 'amber' | 'white' | 'blue' | 'dracula' | 'nord' | 'solarized' | 'ubuntu';

export interface CustomThemeColors {
  bg: string;
  fg: string;
  accent: string;
  phosphor?: string;
}

export type ThemeName = PhosphorTheme | (string & {});
