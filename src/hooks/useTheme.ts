import { useEffect } from 'react';
import { useSystemStore } from '../store/useSystem';

export function useTheme() {
  const theme = useSystemStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
