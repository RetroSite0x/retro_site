import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BootPhase, PhosphorTheme, CustomThemeColors } from '../types/system';
import { safeStorage } from '../lib/storage';

export type MotionMode = 'auto' | 'on' | 'off';

export type WallpaperId = 'ann' | 'grid' | 'circuit' | 'none';

interface SystemState {
  bootPhase: BootPhase;
  isLoggedIn: boolean;
  theme: PhosphorTheme;
  wallpaper: WallpaperId;
  soundEnabled: boolean;
  crtFlicker: boolean;
  volume: number;
  username: string;
  motion: MotionMode;
  customThemes: Record<string, CustomThemeColors>;

  advanceBoot: () => void;
  login: (username: string) => void;
  setTheme: (theme: PhosphorTheme) => void;
  setWallpaper: (wallpaper: WallpaperId) => void;
  toggleSound: () => void;
  toggleFlicker: () => void;
  setVolume: (v: number) => void;
  setMotion: (motion: MotionMode) => void;
  logout: () => void;
  addCustomTheme: (name: string, colors: CustomThemeColors) => void;
  getCustomThemes: () => Record<string, CustomThemeColors>;
}

const PHASE_ORDER: BootPhase[] = ['bios', 'desktop'];

const CUSTOM_THEMES_KEY = 'nabilos-custom-themes';

function loadCustomThemes(): Record<string, CustomThemeColors> {
  try {
    const stored = safeStorage().getItem(CUSTOM_THEMES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCustomThemes(themes: Record<string, CustomThemeColors>): void {
  try {
    safeStorage().setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
  } catch {
  }
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      bootPhase: 'bios',
      isLoggedIn: false,
      theme: 'green',
      wallpaper: 'ann',
      soundEnabled: true,
      crtFlicker: true,
      volume: 0.5,
      username: 'guest',
      motion: 'auto',
      customThemes: loadCustomThemes(),

      advanceBoot: () => {
        const current = get().bootPhase;
        const idx = PHASE_ORDER.indexOf(current);
        if (idx < PHASE_ORDER.length - 1) {
          const next = PHASE_ORDER[idx + 1];
          if (next === 'desktop') {
            set({ bootPhase: 'desktop', isLoggedIn: true, username: 'nabil' });
          } else {
            set({ bootPhase: next });
          }
        }
      },

      login: (username: string) => {
        set({ isLoggedIn: true, username, bootPhase: 'desktop' });
      },

      setTheme: (theme: PhosphorTheme) => set({ theme }),
      setWallpaper: (wallpaper: WallpaperId) => set({ wallpaper }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleFlicker: () => set((s) => ({ crtFlicker: !s.crtFlicker })),
      setVolume: (v: number) => set({ volume: Math.max(0, Math.min(1, v)) }),
      setMotion: (motion: MotionMode) => set({ motion }),

      logout: () => {
        set({ isLoggedIn: false, bootPhase: 'bios' });
      },

      addCustomTheme: (name: string, colors: CustomThemeColors) => {
        const themes = get().customThemes;
        const updated = { ...themes, [name]: colors };
        saveCustomThemes(updated);
        set({ customThemes: updated });
      },

      getCustomThemes: () => get().customThemes,
    }),
    {
      name: 'nabilos-system',
      storage: createJSONStorage(() => safeStorage()),
      partialize: (state) => ({
        theme: state.theme,
        wallpaper: state.wallpaper,
        soundEnabled: state.soundEnabled,
        crtFlicker: state.crtFlicker,
        volume: state.volume,
        motion: state.motion,
      }),
    }
  )
);
