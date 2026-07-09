import { useCallback, useRef } from 'react';
import { useWindowsStore } from '../store/useWindows';
import type { ResizeDirection } from '../types/window';

interface UseResizeOptions {
  windowId: string;
  direction: ResizeDirection;
}

export function useResize({ windowId, direction }: UseResizeOptions) {
  const initialRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const win = useWindowsStore.getState().windows[windowId];
    if (!win) return;

    initialRef.current = {
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const handleMove = (e: PointerEvent) => {
      const store = useWindowsStore.getState();
      const w = store.windows[windowId];
      if (!w) return;

      const dx = e.clientX - initialRef.current.mouseX;
      const dy = e.clientY - initialRef.current.mouseY;
      const { x, y, width, height } = initialRef.current;
      let newX = x, newY = y, newW = width, newH = height;

      const dir = direction;

      if (dir.includes('e')) newW = Math.max(w.minWidth, width + dx);
      if (dir.includes('w')) {
        newW = Math.max(w.minWidth, width - dx);
        newX = x + (width - newW);
      }
      if (dir.includes('s')) newH = Math.max(w.minHeight, height + dy);
      if (dir.includes('n')) {
        newH = Math.max(w.minHeight, height - dy);
        newY = y + (height - newH);
      }

      store.moveWindow(windowId, newX, newY);
      store.resizeWindow(windowId, newW, newH);
    };

    const handleUp = (e: PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [windowId, direction]);

  return { onPointerDown };
}
