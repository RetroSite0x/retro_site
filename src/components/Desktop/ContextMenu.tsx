import { useEffect, useRef, useCallback } from 'react';
import { useContextMenuStore } from '../../store/useContextMenu';
import styles from './ContextMenu.module.css';

const MENU_ITEM_HEIGHT = 28;
const MENU_PADDING = 8;

export function ContextMenu() {
  const { open, x, y, items, closeMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Position clamp: flip left/up near edges
  const position = useCallback(() => {
    if (!open) return { left: x, top: y };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const estimatedWidth = 200;
    const estimatedHeight = items.length * MENU_ITEM_HEIGHT + MENU_PADDING * 2;
    let left = x;
    let top = y;
    if (x + estimatedWidth > vw) left = Math.max(0, vw - estimatedWidth);
    if (y + estimatedHeight > vh) top = Math.max(0, vh - estimatedHeight);
    return { left, top };
  }, [open, x, y, items.length]);

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        const firstItem = menuRef.current?.querySelector<HTMLElement>(
          '[role="menuitem"]:not([aria-disabled="true"])'
        );
        firstItem?.focus();
      });
    } else if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Close on outside pointerdown, scroll, wheel, window blur, or Escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleScroll = () => closeMenu();
    const handleWheel = () => closeMenu();
    const handleBlur = () => closeMenu();

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('blur', handleBlur);
    };
  }, [open, closeMenu]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!menuRef.current) return;

      const menuItems = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
      );
      const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
          menuItems[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
          menuItems[prev]?.focus();
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const item = menuItems[currentIndex];
          if (item && !item.hasAttribute('aria-disabled')) {
            item.click();
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          break;
        }
        case 'Tab': {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          break;
        }
        default:
          break;
      }
    },
    [closeMenu]
  );

  if (!open) return null;

  const { left, top } = position();

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      role="menu"
      aria-label="Context menu"
      style={{ left, top }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, i) => (
        <div key={item.label + String(i)}>
          {item.separatorBefore && <div className={styles.separator} role="separator" />}
          <div
            className={`${styles.item} ${item.disabled ? styles.itemDisabled : ''}`}
            role="menuitem"
            tabIndex={-1}
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (!item.disabled) {
                item.onSelect();
                closeMenu();
              }
            }}
          >
            <span>{item.label}</span>
            {item.checked !== undefined && (
              <span className={styles.checkMark}>{item.checked ? '✓' : ''}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
