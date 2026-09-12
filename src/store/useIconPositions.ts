import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../lib/storage';

interface IconPositionsState {
  positions: Record<string, { x: number; y: number }>;
  setPosition: (label: string, x: number, y: number) => void;
  getPosition: (label: string, fallback: { x: number; y: number }) => { x: number; y: number };
}

export const useIconPositionsStore = create<IconPositionsState>()(
  persist(
    (set, get) => ({
      positions: {},

      setPosition: (label, x, y) => {
        set((s) => ({
          positions: { ...s.positions, [label]: { x, y } },
        }));
      },

      getPosition: (label, fallback) => {
        return get().positions[label] ?? fallback;
      },
    }),
    {
      name: 'nabilos-icons',
      storage: createJSONStorage(() => safeStorage()),
      partialize: (state) => ({ positions: state.positions }),
    }
  )
);
