import { create } from 'zustand';

export interface ContextMenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  separatorBefore?: boolean;
  checked?: boolean;
}

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  openMenu: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  closeMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>()((set) => ({
  open: false,
  x: 0,
  y: 0,
  items: [],

  openMenu: (e, items) => {
    e.preventDefault();
    set({ open: true, x: e.clientX, y: e.clientY, items });
  },

  closeMenu: () => {
    set({ open: false, items: [] });
  },
}));
