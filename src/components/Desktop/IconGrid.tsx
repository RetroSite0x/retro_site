import { useState, useCallback, useRef } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { useWindowsStore } from '../../store/useWindows';
import { useIconPositionsStore } from '../../store/useIconPositions';
import styles from '../../styles/components/menu-bar.module.css';

interface DesktopEntry {
  label: string;
  icon: string;
  path: string;
}

const GRID_COLS = 2;
const ICON_WIDTH = 120;
const ICON_HEIGHT = 100;
const PAD_X = 24;
const PAD_Y = 20;

const DESKTOP_ENTRIES: DesktopEntry[] = [
  { label: 'projects', icon: '[📁]', path: '/projects' },
  { label: 'logs', icon: '[📁]', path: '/logs' },
  { label: 'lab', icon: '[📁]', path: '/lab' },
  { label: 'papers', icon: '[📁]', path: '/papers' },
  { label: 'music', icon: '[📁]', path: '/music' },
  { label: 'art', icon: '[📁]', path: '/art' },
  { label: 'blog', icon: '[📝]', path: '/blog' },
  { label: 'secret', icon: '[📁]', path: '/secret' },
  { label: 'trash', icon: '[🗑]', path: '/trash' },
];

function defaultPosition(index: number): { x: number; y: number } {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  return { x: PAD_X + col * ICON_WIDTH, y: PAD_Y + row * ICON_HEIGHT };
}

export function IconGrid() {
  const openWindow = useWindowsStore((s) => s.openWindow);
  const setPosition = useIconPositionsStore((s) => s.setPosition);
  const getPosition = useIconPositionsStore((s) => s.getPosition);
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const focusedIdxRef = useRef(0);
  const [, forceRender] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const getPos = useCallback(
    (label: string, index: number) => getPosition(label, defaultPosition(index)),
    [getPosition]
  );

  const handleOpen = useCallback(
    (entry: DesktopEntry) => {
      if (entry.path === '/terminal') {
        openWindow({ title: 'terminal', content: { type: 'terminal' }, width: 640, height: 360 });
      } else if (entry.path === '/web') {
        openWindow({ title: 'web', content: { type: 'browser' }, width: 800, height: 500 });
      } else if (entry.path === '/files') {
        openWindow({ title: 'File Manager', content: { type: 'fileManager' }, width: 720, height: 480 });
      } else {
        openWindow({ title: entry.label, content: { type: 'directoryViewer', path: entry.path }, width: 560, height: 380 });
      }
    },
    [openWindow]
  );



  const allEntries = DESKTOP_ENTRIES.map((e, i) => ({
    ...e,
    ...getPos(e.label, i),
  }));
  const extras: (DesktopEntry & { x: number; y: number })[] = [
    { label: 'terminal', icon: '[>_]', path: '/terminal', ...getPos('terminal', DESKTOP_ENTRIES.length) },
    { label: 'web', icon: '[🌐]', path: '/web', ...getPos('web', DESKTOP_ENTRIES.length + 1) },
    { label: 'files', icon: '[🗂]', path: '/files', ...getPos('files', DESKTOP_ENTRIES.length + 2) },
  ];
  const allEntriesFull = allEntries.concat(extras);
  const total = allEntriesFull.length;

  /** Focus the icon at `idx` by updating ref + triggering render + programmatic focus */
  const focusIcon = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      focusedIdxRef.current = clamped;
      forceRender((n) => n + 1); // trigger re-render so tabIndex updates
      requestAnimationFrame(() => {
        const children = gridRef.current?.children;
        if (children && children[clamped]) {
          (children[clamped] as HTMLElement).focus();
        }
      });
    },
    [total]
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = focusedIdxRef.current;
      const col = idx % GRID_COLS;
      let next = idx;

      switch (e.key) {
        case 'ArrowRight':
          if (col < GRID_COLS - 1 && idx + 1 < total) next = idx + 1;
          break;
        case 'ArrowLeft':
          if (col > 0) next = idx - 1;
          break;
        case 'ArrowDown':
          if (idx + GRID_COLS < total) next = idx + GRID_COLS;
          break;
        case 'ArrowUp':
          if (idx - GRID_COLS >= 0) next = idx - GRID_COLS;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = total - 1;
          break;
        default:
          return; // don't prevent default for unhandled keys
      }

      if (next !== idx) {
        e.preventDefault();
        focusIcon(next);
      }
    },
    [total, focusIcon]
  );

  return (
    <div
      className={styles.iconGrid}
      ref={gridRef}
      role="grid"
      aria-label="Desktop icons"
      onKeyDown={handleGridKeyDown}
    >
      {allEntriesFull.map((entry, i) => (
        <DesktopIcon
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          x={entry.x}
          y={entry.y}
          isDragged={draggedLabel === entry.label}
          tabIndex={focusedIdxRef.current === i ? 0 : -1}
          role="gridcell"
          ariaLabel={entry.label}
          onOpen={() => handleOpen(entry)}
          onDragStart={() => setDraggedLabel(entry.label)}
          onDrag={(x, y) => {
            setPosition(entry.label, x, y);
          }}
          onDragEnd={() => setDraggedLabel(null)}
        />
      ))}
    </div>
  );
}
