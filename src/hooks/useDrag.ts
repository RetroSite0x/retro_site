import { useCallback, useRef } from 'react';
import { useWindowsStore } from '../store/useWindows';

interface UseDragOptions {
  windowId: string;
}

export function useDrag({ windowId }: UseDragOptions) {
  const offsetRef = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const win = useWindowsStore.getState().windows[windowId];
    if (!win) return;

    const captureTarget = e.currentTarget as HTMLElement;
    offsetRef.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    captureTarget.setPointerCapture?.(e.pointerId);

    const handleMove = (e: PointerEvent) => {
      const store = useWindowsStore.getState();
      const w = store.windows[windowId];
      if (!w) return;

      const newX = Math.max(0, e.clientX - offsetRef.current.x);
      const newY = Math.max(0, e.clientY - offsetRef.current.y);

      // Clamp to desktop bounds (at least title bar visible)
      const maxX = window.innerWidth - w.minWidth;
      const maxY = window.innerHeight - 24; // title bar height
      store.moveWindow(
        windowId,
        Math.min(newX, maxX),
        Math.min(newY, maxY)
      );
    };

    const handleUp = (e: PointerEvent) => {
      captureTarget.releasePointerCapture?.(e.pointerId);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [windowId]);

  return { onPointerDown };
}
