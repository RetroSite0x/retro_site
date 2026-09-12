import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WindowState, WindowContent } from '../types/window';
import { safeStorage } from '../lib/storage';

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

        const win: WindowState = {
          id,
          title: config.title,
          x,
          y,
          width: config.width ?? 600,
          height: config.height ?? 400,
          minWidth: 300,
          minHeight: 150,
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
                y: 28,
                width: window.innerWidth,
                height: window.innerHeight - 28,
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
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...win,
                width: Math.max(win.minWidth, width),
                height: Math.max(win.minHeight, height),
              },
            },
          };
        });
      },

      reflowMaximized: () => {
        set((s) => {
          let changed = false;
          const next: Record<string, WindowState> = {};
          for (const [id, win] of Object.entries(s.windows)) {
            if (win.isMaximized) {
              next[id] = { ...win, x: 0, y: 28, width: window.innerWidth, height: window.innerHeight - 28 };
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
