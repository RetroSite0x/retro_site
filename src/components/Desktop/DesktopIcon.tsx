import { useCallback, useRef } from 'react';
import { RetroIcon, type RetroIconName } from '../icons/RetroIcon';
import { useWindowsStore } from '../../store/useWindows';
import { useIconPositionsStore } from '../../store/useIconPositions';
import { useContextMenuStore } from '../../store/useContextMenu';
import styles from '../../styles/components/menu-bar.module.css';

interface DesktopIconProps {
  label: string;
  icon: RetroIconName;
  x: number;
  y: number;
  isDragged: boolean;
  tabIndex?: number;
  role?: string;
  ariaLabel?: string;
  onOpen: () => void;
  onDragStart: () => void;
  onDrag: (x: number, y: number) => void;
  onDragEnd: () => void;
}

export function DesktopIcon({
  label,
  icon,
  x,
  y,
  isDragged,
  tabIndex = -1,
  role,
  ariaLabel,
  onOpen,
  onDragStart,
  onDrag,
  onDragEnd,
}: DesktopIconProps) {
  const offsetRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const lastOpenRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const el = e.target as HTMLElement;
      if (typeof el.setPointerCapture === 'function') {
        el.setPointerCapture(e.pointerId);
      }
      offsetRef.current = { x: e.clientX - x, y: e.clientY - y };
      movedRef.current = false;
      onDragStart();

      const handleMove = (ev: PointerEvent) => {
        onDrag(
          ev.clientX - offsetRef.current.x,
          ev.clientY - offsetRef.current.y
        );
        const dx = Math.abs(ev.clientX - offsetRef.current.x - x);
        const dy = Math.abs(ev.clientY - offsetRef.current.y - y);
        if (dx > 4 || dy > 4) movedRef.current = true;
      };

      const handleUp = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
        onDragEnd();
        if (!movedRef.current) {
          const now = Date.now();
          if (now - lastOpenRef.current > 350) {
            lastOpenRef.current = now;
            onOpen();
          }
        }
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [x, y, onDragStart, onDrag, onDragEnd, onOpen]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const openWindow = useWindowsStore.getState().openWindow;
      const setPosition = useIconPositionsStore.getState().setPosition;
      const contextOpenMenu = useContextMenuStore.getState().openMenu;

      contextOpenMenu(e, [
        { label: 'Open', onSelect: onOpen },
        {
          label: 'Open in Terminal',
          onSelect: () =>
            openWindow({ title: 'terminal', content: { type: 'terminal' } }),
        },
        {
          separatorBefore: true,
          label: 'Reset Desktop Icons',
          onSelect: () => {
            const ICON_LABELS = [
              'projects', 'logs', 'lab', 'papers', 'music',
              'art', 'blog', 'secret', 'trash',
              'terminal', 'web', 'files', 'memoire',
            ];
            const GRID_COLS = 2;
            const ICON_WIDTH = 120;
            const ICON_HEIGHT = 100;
            const PAD_X = 24;
            const PAD_Y = 20;
            ICON_LABELS.forEach((lbl, i) => {
              const col = i % GRID_COLS;
              const row = Math.floor(i / GRID_COLS);
              setPosition(lbl, PAD_X + col * ICON_WIDTH, PAD_Y + row * ICON_HEIGHT);
            });
          },
        },
      ]);
    },
    [onOpen]
  );

  return (
    <div
      className={`${styles.desktopIcon} ${isDragged ? styles.desktopIconDragging : ''}`}
      style={{ left: x, top: y, position: 'absolute' }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
    >
      <div className={styles.iconSymbol}><RetroIcon name={icon} size={44} /></div>
      <div className={styles.iconLabel}>{label}</div>
    </div>
  );
}
