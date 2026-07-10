import { useEffect, useCallback } from 'react';
import { useWindowsStore } from '../../store/useWindows';
import { MenuBar } from './MenuBar';
import { IconGrid } from './IconGrid';
import { WindowManager } from '../WindowManager/WindowManager';
import styles from '../../styles/components/desktop.module.css';

const ANN_LINES = [
  ' █████   ██   ██   ██   ██',
  '██   ██  ███  ██  ███  ██',
  '██   ██  ████ ██  ████ ██',
  '██   ██  ██ ████  ██ ████',
  '██   ██  ██  ███  ██  ███',
  ' █████   ██   ██  ██   ██',
];

function Wallpaper() {
  return (
    <div className={styles.wallpaper} aria-hidden="true">
      <div className={styles.wallpaperInner}>
        {ANN_LINES.map((line, i) => (
          <div key={i} className={styles.wallpaperLine}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export function Desktop() {
  const openWindow = useWindowsStore((s) => s.openWindow);

  // Open terminal + browser windows on first desktop render
  useEffect(() => {
    const existingWindows = useWindowsStore.getState().windows;
    const hasTerminal = Object.values(existingWindows).some(
      (w) => w.content.type === 'terminal'
    );
    const hasBrowser = Object.values(existingWindows).some(
      (w) => w.content.type === 'browser'
    );

    if (!hasBrowser) {
      openWindow({
        title: 'web',
        content: { type: 'browser' },
        width: 800,
        height: 500,
        x: Math.max(0, window.innerWidth - 840),
        y: 60,
      });
    }

    if (!hasTerminal) {
      openWindow({
        title: 'terminal',
        content: { type: 'terminal' },
        width: 640,
        height: 360,
        x: Math.max(0, window.innerWidth - 680),
        y: 140,
      });
    }
  }, [openWindow]);

  const windows = useWindowsStore((s) => s.windows);
  const focusWindow = useWindowsStore((s) => s.focusWindow);
  const restoreWindow = useWindowsStore((s) => s.restoreWindow);

  const handleTaskbarClick = useCallback((id: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(id);
    } else {
      focusWindow(id);
    }
  }, [restoreWindow, focusWindow]);

  return (
    <div className={styles.desktop} role="application" aria-label="Desktop">
      <Wallpaper />
      <MenuBar />
      <IconGrid />
      <div className={styles.windowLayer} role="region" aria-label="Windows">
        <WindowManager />
      </div>
      <div className={styles.taskbar} role="toolbar" aria-label="Window taskbar">
        {Object.values(windows).map((w) => (
          <button
            key={w.id}
            className={`${styles.taskbarItem} ${w.isMinimized ? styles.taskbarItemMinimized : ''}`}
            onClick={() => handleTaskbarClick(w.id, w.isMinimized)}
            aria-label={`${w.title}${w.isMinimized ? ' (minimized)' : ''}`}
          >
            {w.title}
          </button>
        ))}
      </div>
    </div>
  );
}
