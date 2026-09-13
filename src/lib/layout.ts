/**
 * Desktop layout geometry.
 *
 * Windows live inside `.windowLayer`, which is offset from the viewport by the
 * menu bar on top and the taskbar on the bottom. Window `x`/`y` are therefore
 * relative to that layer, while the snap-preview overlay is `position: fixed`
 * and viewport-relative.
 *
 * These constants MUST stay in sync with the CSS variables `--menu-bar-height`
 * and `--taskbar-height` in `src/styles/variables.css`.
 */
export const MENU_BAR_HEIGHT = 28;
export const TASKBAR_HEIGHT = 28;

/** Pixel height of the window layer for the current viewport. */
export function windowLayerHeight(): number {
  return window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT;
}
