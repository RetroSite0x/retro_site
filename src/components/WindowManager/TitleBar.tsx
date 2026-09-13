import { useCallback } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useWindowsStore } from '../../store/useWindows';
import { useContextMenuStore } from '../../store/useContextMenu';
import { windowLayerHeight } from '../../lib/layout';
import styles from '../../styles/components/window.module.css';

interface TitleBarProps {
  windowId: string;
  title: string;
}

export function TitleBar({ windowId, title }: TitleBarProps) {
  const { onPointerDown } = useDrag({ windowId });
  const focusWindow = useWindowsStore((s) => s.focusWindow);
  const minimizeWindow = useWindowsStore((s) => s.minimizeWindow);
  const maximizeWindow = useWindowsStore((s) => s.maximizeWindow);
  const moveWindow = useWindowsStore((s) => s.moveWindow);
  const resizeWindow = useWindowsStore((s) => s.resizeWindow);
  const beginClose = useWindowsStore((s) => s.beginClose);
  const win = useWindowsStore((s) => s.windows[windowId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    focusWindow(windowId);
    onPointerDown(e);
  };

  const handleDoubleClick = () => {
    maximizeWindow(windowId);
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const contextOpenMenu = useContextMenuStore.getState().openMenu;
      const isMaximized = win?.isMaximized ?? false;

      contextOpenMenu(e, [
        {
          label: isMaximized ? 'Restore' : 'Maximize',
          onSelect: () => maximizeWindow(windowId),
        },
        {
          label: 'Minimize',
          onSelect: () => minimizeWindow(windowId),
        },
        {
          separatorBefore: true,
          label: 'Snap Left',
          onSelect: () => {
            moveWindow(windowId, 0, 0);
            resizeWindow(windowId, window.innerWidth / 2, windowLayerHeight());
          },
        },
        {
          label: 'Snap Right',
          onSelect: () => {
            moveWindow(windowId, window.innerWidth / 2, 0);
            resizeWindow(windowId, window.innerWidth / 2, windowLayerHeight());
          },
        },
        {
          separatorBefore: true,
          label: 'Close',
          onSelect: () => beginClose(windowId),
        },
      ]);
    },
    [win?.isMaximized, windowId, maximizeWindow, minimizeWindow, moveWindow, resizeWindow, beginClose]
  );

  return (
    <div
      className={styles.titleBar}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <span className={styles.titleText}>{title}</span>
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); minimizeWindow(windowId); }}
          aria-label="Minimize"
        >
          _
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); maximizeWindow(windowId); }}
          aria-label="Maximize"
        >
          □
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); beginClose(windowId); }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
