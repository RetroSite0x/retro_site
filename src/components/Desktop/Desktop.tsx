import { useEffect, useCallback } from 'react';
import { useWindowsStore } from '../../store/useWindows';
import { useSystemStore, type WallpaperId } from '../../store/useSystem';
import { useContextMenuStore } from '../../store/useContextMenu';
import { MenuBar } from './MenuBar';
import { IconGrid } from './IconGrid';
import { WindowManager } from '../WindowManager/WindowManager';
import { ContextMenu } from './ContextMenu';
import styles from '../../styles/components/desktop.module.css';

const WALLPAPER_ORDER: WallpaperId[] = ['ann', 'grid', 'circuit', 'none'];

const WALLPAPER_ART: Record<WallpaperId, string[] | null> = {
  ann: [
    ' █████   ██   ██   ██   ██',
    '██   ██  ███  ██  ███  ██',
    '██   ██  ████ ██  ████ ██',
    '██   ██  ██ ████  ██ ████',
    '██   ██  ██  ███  ██  ███',
    ' █████   ██   ██  ██   ██',
  ],
  grid: [
    '·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·',
    '                                                                       ',
    '·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·',
    '                                                                       ',
    '·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·',
    '                                                                       ',
    '·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·',
    '                                                                       ',
    '·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·',
  ],
  circuit: [
    '┌───┬───┐ ┌─────┐ ┌───┬───┐ ┌─────┐',
    '│   │   ├─┤     ├─┤   │   ├─┤     │',
    '│   ├───┘ └──┬──┘ └───┤   │ └──┬──┘',
    '│   │      ┌─┘        │   │    │   ',
    '├───┘      │    ┌─────┤   ├────┘   ',
    '│        ┌─┘    │     │   │        ',
    '└────────┘      └─────┘   └────────',
  ],
  none: null,
};

function Wallpaper() {
  const wallpaper = useSystemStore((s) => s.wallpaper);
  const lines = WALLPAPER_ART[wallpaper];

  if (!lines) return null;

  return (
    <div className={styles.wallpaper} aria-hidden="true">
      <div className={`${styles.wallpaperInner} ${wallpaper === 'grid' ? styles.wallpaperGrid : ''} ${wallpaper === 'circuit' ? styles.wallpaperCircuit : ''}`}>
        {lines.map((line, i) => (
          <div key={i} className={styles.wallpaperLine}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export function Desktop() {
  const openWindow = useWindowsStore((s) => s.openWindow);
  const minimizeAll = useWindowsStore((s) => s.minimizeAll);
  const wallpaper = useSystemStore((s) => s.wallpaper);
  const setWallpaper = useSystemStore((s) => s.setWallpaper);
  const openMenu = useContextMenuStore((s) => s.openMenu);
  const closeMenu = useContextMenuStore((s) => s.closeMenu);

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

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const nextWallpaper = () => {
        const idx = WALLPAPER_ORDER.indexOf(wallpaper);
        const next = (idx + 1) % WALLPAPER_ORDER.length;
        setWallpaper(WALLPAPER_ORDER[next]);
      };

      openMenu(e, [
        {
          label: 'New Terminal',
          onSelect: () =>
            openWindow({
              title: 'terminal',
              content: { type: 'terminal' },
            }),
        },
        {
          label: 'Show Desktop',
          onSelect: () => minimizeAll(),
        },
        {
          separatorBefore: true,
          label: 'Next Wallpaper',
          onSelect: nextWallpaper,
        },
      ]);
    },
    [openMenu, openWindow, minimizeAll, wallpaper, setWallpaper]
  );

  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[role="menu"]')) return;
      closeMenu();
    },
    [closeMenu]
  );

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
    <div
      className={styles.desktop}
      id="main"
      tabIndex={-1}
      role="application"
      aria-label="Desktop"
      onContextMenu={handleDesktopContextMenu}
      onClick={handleDesktopClick}
    >
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
        <button
          className={styles.showDesktopBtn}
          onClick={minimizeAll}
          aria-label="Show Desktop"
        >
          ▾
        </button>
      </div>
      <ContextMenu />
    </div>
  );
}
