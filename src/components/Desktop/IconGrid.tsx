import { useState, useCallback } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { useWindowsStore } from '../../store/useWindows';
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
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);

  const handleOpen = useCallback((entry: DesktopEntry) => {
    openWindow({
      title: entry.label,
      content: { type: 'directoryViewer', path: entry.path },
      width: 560,
      height: 380,
    });
  }, [openWindow]);

  const getPos = (label: string, index: number) => {
    return positions[label] ?? defaultPosition(index);
  };

  return (
    <div className={styles.iconGrid}>
      {DESKTOP_ENTRIES.map((entry, i) => {
        const pos = getPos(entry.label, i);
        return (
          <DesktopIcon
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            x={pos.x}
            y={pos.y}
            isDragged={draggedLabel === entry.label}
            onOpen={() => handleOpen(entry)}
            onDragStart={() => setDraggedLabel(entry.label)}
            onDrag={(x, y) => {
              setPositions((prev) => ({
                ...prev,
                [entry.label]: { x, y },
              }));
            }}
            onDragEnd={() => setDraggedLabel(null)}
          />
        );
      })}
      <DesktopIcon
        label="terminal"
        icon="[>_]"
        x={getPos('terminal', DESKTOP_ENTRIES.length).x}
        y={getPos('terminal', DESKTOP_ENTRIES.length).y}
        isDragged={draggedLabel === 'terminal'}
        onOpen={() => {
          openWindow({
            title: 'terminal',
            content: { type: 'terminal' },
            width: 640,
            height: 360,
          });
        }}
        onDragStart={() => setDraggedLabel('terminal')}
        onDrag={(x, y) => {
          setPositions((prev) => ({
            ...prev,
            terminal: { x, y },
          }));
        }}
        onDragEnd={() => setDraggedLabel(null)}
      />
      <DesktopIcon
        label="web"
        icon="[://]"
        x={getPos('web', DESKTOP_ENTRIES.length + 1).x}
        y={getPos('web', DESKTOP_ENTRIES.length + 1).y}
        isDragged={draggedLabel === 'web'}
        onOpen={() => {
          openWindow({
            title: 'web',
            content: { type: 'browser' },
            width: 800,
            height: 500,
          });
        }}
        onDragStart={() => setDraggedLabel('web')}
        onDrag={(x, y) => {
          setPositions((prev) => ({
            ...prev,
            web: { x, y },
          }));
        }}
        onDragEnd={() => setDraggedLabel(null)}
      />
      <DesktopIcon
        label="files"
        icon="[🗂]"
        x={getPos('files', DESKTOP_ENTRIES.length + 2).x}
        y={getPos('files', DESKTOP_ENTRIES.length + 2).y}
        isDragged={draggedLabel === 'files'}
        onOpen={() => {
          openWindow({
            title: 'File Manager',
            content: { type: 'fileManager' },
            width: 720,
            height: 480,
          });
        }}
        onDragStart={() => setDraggedLabel('files')}
        onDrag={(x, y) => {
          setPositions((prev) => ({
            ...prev,
            files: { x, y },
          }));
        }}
        onDragEnd={() => setDraggedLabel(null)}
      />
    </div>
  );
}
