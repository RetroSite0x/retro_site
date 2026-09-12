import { useCallback, useRef } from 'react';
import { useWindowsStore } from '../store/useWindows';

const SNAP_THRESHOLD = 20;

type SnapZone = 'left' | 'right' | 'top' | null;

interface UseDragOptions {
  windowId: string;
}

function createPreviewEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'snapPreview';
  document.body.appendChild(el);
  return el;
}

function updatePreviewEl(
  el: HTMLDivElement,
  zone: SnapZone
) {
  if (!zone) {
    el.style.display = 'none';
    return;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight - 28;
  if (zone === 'top') {
    el.style.display = 'block';
    el.style.left = '0px';
    el.style.top = '28px';
    el.style.width = vw + 'px';
    el.style.height = vh + 'px';
  } else if (zone === 'left') {
    el.style.display = 'block';
    el.style.left = '0px';
    el.style.top = '28px';
    el.style.width = (vw / 2) + 'px';
    el.style.height = vh + 'px';
  } else {
    el.style.display = 'block';
    el.style.left = (vw / 2) + 'px';
    el.style.top = '28px';
    el.style.width = (vw / 2) + 'px';
    el.style.height = vh + 'px';
  }
}

function detectSnapZone(cx: number, cy: number): SnapZone {
  if (cy < SNAP_THRESHOLD) return 'top';
  if (cx < SNAP_THRESHOLD) return 'left';
  if (cx > window.innerWidth - SNAP_THRESHOLD) return 'right';
  return null;
}

export function useDrag({ windowId }: UseDragOptions) {
  const offsetRef = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const win = useWindowsStore.getState().windows[windowId];
    if (!win) return;

    offsetRef.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    let previewEl: HTMLDivElement | null = null;
    let activeZone: SnapZone = null;

    const handleMove = (e: PointerEvent) => {
      const store = useWindowsStore.getState();
      const w = store.windows[windowId];
      if (!w) return;

      const newX = Math.max(0, e.clientX - offsetRef.current.x);
      const newY = Math.max(0, e.clientY - offsetRef.current.y);

      store.moveWindow(
        windowId,
        Math.min(newX, window.innerWidth - w.minWidth),
        Math.min(newY, window.innerHeight - 24)
      );

      const zone = detectSnapZone(e.clientX, e.clientY);
      if (zone !== activeZone) {
        activeZone = zone;
        if (zone && !previewEl) {
          previewEl = createPreviewEl();
        }
        if (previewEl) {
          updatePreviewEl(previewEl, zone);
        }
      }
    };

    const handleUp = (e: PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);

      if (activeZone) {
        const store = useWindowsStore.getState();
        const vw = window.innerWidth;
        const vh = window.innerHeight - 28;

        if (activeZone === 'top') {
          store.maximizeWindow(windowId);
        } else {
          const halfW = Math.floor(vw / 2);
          store.moveWindow(windowId, activeZone === 'left' ? 0 : halfW, 28);
          store.resizeWindow(windowId, halfW, vh);
        }
      }

      if (previewEl) {
        previewEl.remove();
        previewEl = null;
      }
      activeZone = null;
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [windowId]);

  return { onPointerDown };
}
