import type { WindowState } from '../types/window';

/**
 * Find the highest z-index among open windows.
 */
export function getHighestZIndex(windows: WindowState[]): number {
  return windows.reduce((max, w) => Math.max(max, w.zIndex), 9);
}

/**
 * Cascade position for a new window.
 * Starts at (80, 80), offsets by +32px each, wraps at 4 tiles.
 */
let windowCounter = 0;
const CASCADE_OFFSET = 32;
const MAX_CASCADE = 4;

export function getCascadePosition(): { x: number; y: number } {
  const tile = windowCounter++ % MAX_CASCADE;
  return { x: 80 + tile * CASCADE_OFFSET, y: 80 + tile * CASCADE_OFFSET };
}

export function resetCascadeCounter(): void {
  windowCounter = 0;
}

/**
 * Check if a window overlaps with any other window (excluding itself).
 */
export function hasOverlap(
  win: WindowState,
  others: WindowState[]
): boolean {
  return others.some(
    (other) =>
      other.id !== win.id &&
      win.x < other.x + other.width &&
      win.x + win.width > other.x &&
      win.y < other.y + other.height &&
      win.y + win.height > other.y
  );
}

/**
 * Find the first non-overlapping cascade position for a new window.
 */
export function findNonOverlappingPosition(
  existingWindows: WindowState[]
): { x: number; y: number } {
  const MAX_ATTEMPTS = 20;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pos = getCascadePosition();
    const candidate: WindowState = {
      id: 'candidate',
      title: '',
      x: pos.x,
      y: pos.y,
      width: 600,
      height: 400,
      minWidth: 300,
      minHeight: 150,
      zIndex: 0,
      isMinimized: false,
      isMaximized: false,
      isClosing: false,
      content: { type: 'terminal' },
    };
    if (!hasOverlap(candidate, existingWindows)) {
      return pos;
    }
  }
  // Fallback: stack at 100, 100
  return { x: 100, y: 100 };
}
