import { useEffect } from 'react';
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

  return (
    <div className={styles.desktop}>
      <Wallpaper />
      <MenuBar />
      <IconGrid />
      <div className={styles.windowLayer}>
        <WindowManager />
      </div>
    </div>
  );
}
