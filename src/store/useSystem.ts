import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BootPhase, PhosphorTheme } from '../types/system';
import { safeStorage } from '../lib/storage';

interface SystemState {
  bootPhase: BootPhase;
  isLoggedIn: boolean;
  theme: PhosphorTheme;
  soundEnabled: boolean;
  crtFlicker: boolean;
  volume: number;
  username: string;

  advanceBoot: () => void;
  login: (username: string) => void;
  setTheme: (theme: PhosphorTheme) => void;
  toggleSound: () => void;
  toggleFlicker: () => void;
  setVolume: (v: number) => void;
  logout: () => void;
}

const PHASE_ORDER: BootPhase[] = ['bios', 'login', 'desktop'];

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      bootPhase: 'bios',
      isLoggedIn: false,
      theme: 'green',
      soundEnabled: true,
      crtFlicker: true,
      volume: 0.5,
      username: 'guest',

      advanceBoot: () => {
        const current = get().bootPhase;
        const idx = PHASE_ORDER.indexOf(current);
        if (idx < PHASE_ORDER.length - 1) {
          set({ bootPhase: PHASE_ORDER[idx + 1] });
        }
      },

      login: (username: string) => {
        set({ isLoggedIn: true, username, bootPhase: 'desktop' });
      },

      setTheme: (theme: PhosphorTheme) => set({ theme }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleFlicker: () => set((s) => ({ crtFlicker: !s.crtFlicker })),
      setVolume: (v: number) => set({ volume: Math.max(0, Math.min(1, v)) }),

      logout: () => {
        set({ isLoggedIn: false, bootPhase: 'login' });
      },
    }),
    {
      name: 'nabilos-system',
      storage: createJSONStorage(() => safeStorage()),
      partialize: (state) => ({
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        crtFlicker: state.crtFlicker,
        volume: state.volume,
      }),
    }
  )
);
