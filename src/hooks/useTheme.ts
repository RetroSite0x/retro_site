import { useEffect } from 'react';
import { useSystemStore } from '../store/useSystem';
import type { CustomThemeColors } from '../types/system';

function applyCustomTheme(colors: CustomThemeColors) {
  const root = document.documentElement;
  root.dataset.theme = 'custom';
  root.style.setProperty('--phosphor', colors.accent);
  root.style.setProperty('--phosphor-dim', colors.accent);
  root.style.setProperty('--phosphor-bg', colors.bg);
  root.style.setProperty('--phosphor-glow', `0 0 4px ${colors.accent}40`);
  root.style.setProperty('--phosphor-glow-strong', `0 0 8px ${colors.accent}60, 0 0 16px ${colors.accent}18`);
  root.style.setProperty('--phosphor-scanline', `${colors.bg}1e`);
  root.style.setProperty('--window-title-bg', colors.bg);
  root.style.setProperty('--window-border', colors.accent);
  root.style.setProperty('--menu-bar-bg', colors.bg);
  root.style.setProperty('--text-cursor', colors.fg);
  root.style.setProperty('--text-cursor-glow', `0 0 4px ${colors.fg}`);
  root.style.setProperty('--bg', colors.bg);
  root.style.setProperty('--fg', colors.fg);
  root.style.setProperty('--accent', colors.accent);
  if (colors.phosphor) {
    root.style.setProperty('--phosphor', colors.phosphor);
  }
}

function clearCustomTheme() {
  const root = document.documentElement;
  const props = [
    '--phosphor', '--phosphor-dim', '--phosphor-bg', '--phosphor-glow',
    '--phosphor-glow-strong', '--phosphor-scanline', '--window-title-bg',
    '--window-border', '--menu-bar-bg', '--text-cursor', '--text-cursor-glow',
    '--bg', '--fg', '--accent',
  ];
  props.forEach(p => root.style.removeProperty(p));
}

export function useTheme() {
  const theme = useSystemStore((s) => s.theme);
  const customThemes = useSystemStore((s) => s.customThemes);

  useEffect(() => {
    clearCustomTheme();
    const custom = customThemes[theme];
    if (custom) {
      applyCustomTheme(custom);
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme, customThemes]);
}
