import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WindowState, WindowContent } from '../types/window';
import { safeStorage } from '../lib/storage';
import { windowLayerHeight } from '../lib/layout';

const WINDOW_SIZE_CONSTRAINTS: Record<WindowContent['type'], { defaultWidth: number; defaultHeight: number; minWidth: number; minHeight: number; maxWidth: number; maxHeight: number }> = {
  terminal: { defaultWidth: 640, defaultHeight: 360, minWidth: 400, minHeight: 200, maxWidth: 1200, maxHeight: 800 },
  browser: { defaultWidth: 800, defaultHeight: 500, minWidth: 500, minHeight: 300, maxWidth: 1400, maxHeight: 900 },
  fileManager: { defaultWidth: 720, defaultHeight: 480, minWidth: 500, minHeight: 350, maxWidth: 1200, maxHeight: 800 },
  directoryViewer: { defaultWidth: 560, defaultHeight: 380, minWidth: 400, minHeight: 250, maxWidth: 1000, maxHeight: 700 },
  fileViewer: { defaultWidth: 600, defaultHeight: 400, minWidth: 400, minHeight: 250, maxWidth: 1000, maxHeight: 700 },
  imageViewer: { defaultWidth: 640, defaultHeight: 480, minWidth: 300, minHeight: 250, maxWidth: 1200, maxHeight: 900 },
  dashboard: { defaultWidth: 700, defaultHeight: 450, minWidth: 500, minHeight: 350, maxWidth: 1200, maxHeight: 800 },
  memoire: { defaultWidth: 720, defaultHeight: 520, minWidth: 380, minHeight: 300, maxWidth: 1400, maxHeight: 1000 },
};

interface WindowsState {
  windows: Record<string, WindowState>;
  nextZIndex: number;
  focusedId: string | null;
  _closingTimers: Record<string, ReturnType<typeof setTimeout>>;

  openWindow: (config: {
    title: string;
    content: WindowContent;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  }) => string;
  closeWindow: (id: string) => void;
  beginClose: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  minimizeAll: () => void;
  reflowMaximized: () => void;
}

let windowCounter = 0;
const CASCADE_OFFSET = 32;
const MAX_CASCADE = 4;

function cascadePosition(): { x: number; y: number } {
  const tile = windowCounter % MAX_CASCADE;
  return { x: 80 + tile * CASCADE_OFFSET, y: 80 + tile * CASCADE_OFFSET };
}

export const useWindowsStore = create<WindowsState>()(
  persist(
    (set, get) => ({
      windows: {},
      nextZIndex: 10,
      focusedId: null,
      _closingTimers: {},

      openWindow: (config) => {
        const id = `win-${Date.now()}-${windowCounter++}`;
        const { x, y } = config.x !== undefined ? { x: config.x, y: config.y ?? 60 } : cascadePosition();

        const constraints = WINDOW_SIZE_CONSTRAINTS[config.content.type];
        const width = config.width
          ? Math.min(constraints.maxWidth, Math.max(constraints.minWidth, config.width))
          : constraints.defaultWidth;
        const height = config.height
          ? Math.min(constraints.maxHeight, Math.max(constraints.minHeight, config.height))
          : constraints.defaultHeight;

        const win: WindowState = {
          id,
          title: config.title,
          x,
          y,
          width,
          height,
          minWidth: constraints.minWidth,
          minHeight: constraints.minHeight,
          zIndex: get().nextZIndex,
          isMinimized: false,
          isMaximized: false,
          isClosing: false,
          preMaximizeRect: null,
          content: config.content,
        };

        set((s) => ({
          windows: { ...s.windows, [id]: win },
          nextZIndex: s.nextZIndex + 1,
          focusedId: id,
        }));

        return id;
      },

      closeWindow: (id) => {
        set((s) => {
          const { [id]: _removed, ...rest } = s.windows;
          const newFocused = s.focusedId === id
            ? Object.values(rest).reduce<WindowState | null>((best, w) =>
                !w.isMinimized && (!best || w.zIndex > best.zIndex) ? w : best
              , null)?.id ?? null
            : s.focusedId;
          return { windows: rest, focusedId: newFocused };
        });
      },

      beginClose: (id) => {
        const state = get();
        const win = state.windows[id];
        if (!win || win.isClosing) return;

        set((s) => ({
          windows: {
            ...s.windows,
            [id]: { ...s.windows[id], isClosing: true },
          },
        }));

        const timer = setTimeout(() => {
          set((s) => {
            const { [id]: _timer, ...rest } = s._closingTimers;
            return { _closingTimers: rest };
          });
          get().closeWindow(id);
        }, 180);

        set((s) => ({
          _closingTimers: { ...s._closingTimers, [id]: timer },
        }));
      },

      focusWindow: (id) => {
        set((s) => {
          const win = s.windows[id];
          if (!win || win.isMinimized) return s;
          return {
            windows: {
              ...s.windows,
              [id]: { ...win, zIndex: s.nextZIndex },
            },
            nextZIndex: s.nextZIndex + 1,
            focusedId: id,
          };
        });
      },

      minimizeWindow: (id) => {
        set((s) => {
          const win = s.windows[id];
          if (!win) return s;
          const newFocused = s.focusedId === id ? null : s.focusedId;
          return {
            windows: { ...s.windows, [id]: { ...win, isMinimized: true } },
            focusedId: newFocused,
          };
        });
      },

      maximizeWindow: (id) => {
        set((s) => {
          const win = s.windows[id];
          if (!win) return s;
          if (win.isMaximized) {
            const prev = win.preMaximizeRect;
            if (!prev) return { windows: { ...s.windows, [id]: { ...win, isMaximized: false } } };
            return {
              windows: {
                ...s.windows,
                [id]: { ...win, x: prev.x, y: prev.y, width: prev.width, height: prev.height, isMaximized: false, preMaximizeRect: null },
              },
            };
          }
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...win,
                preMaximizeRect: { x: win.x, y: win.y, width: win.width, height: win.height },
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: windowLayerHeight(),
                isMaximized: true,
              },
            },
          };
        });
      },

      restoreWindow: (id) => {
        set((s) => {
          const win = s.windows[id];
          if (!win) return s;
          return {
            windows: { ...s.windows, [id]: { ...win, isMinimized: false } },
            focusedId: id,
          };
        });
      },

      moveWindow: (id, x, y) => {
        set((s) => {
          const win = s.windows[id];
          if (!win) return s;
          return {
            windows: { ...s.windows, [id]: { ...win, x, y } },
          };
        });
      },

      resizeWindow: (id, width, height) => {
        set((s) => {
          const win = s.windows[id];
          if (!win) return s;
          const constraints = WINDOW_SIZE_CONSTRAINTS[win.content.type];
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...win,
                width: Math.min(constraints.maxWidth, Math.max(constraints.minWidth, width)),
                height: Math.min(constraints.maxHeight, Math.max(constraints.minHeight, height)),
              },
            },
          };
        });
      },

      minimizeAll: () => {
        set((s) => {
          let changed = false;
          const next: Record<string, WindowState> = {};
          for (const [id, win] of Object.entries(s.windows)) {
            if (!win.isMinimized) {
              next[id] = { ...win, isMinimized: true };
              changed = true;
            } else {
              next[id] = win;
            }
          }
          if (!changed) return s;
          return { windows: next, focusedId: null };
        });
      },

      reflowMaximized: () => {
        set((s) => {
          let changed = false;
          const next: Record<string, WindowState> = {};
          for (const [id, win] of Object.entries(s.windows)) {
            if (win.isMaximized) {
              next[id] = { ...win, x: 0, y: 0, width: window.innerWidth, height: windowLayerHeight() };
              changed = true;
            } else {
              next[id] = win;
            }
          }
          if (!changed) return s;
          return { windows: next };
        });
      },
    }),
    {
      name: 'nabilos-windows',
      storage: createJSONStorage(() => safeStorage()),
      partialize: (state) => ({
        windows: state.windows,
        nextZIndex: state.nextZIndex,
        focusedId: state.focusedId,
      }),
    }
  )
);
