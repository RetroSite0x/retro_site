import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from '../../styles/components/menu-bar.module.css';
import { useSystemStore } from '../../store/useSystem';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import type { PhosphorTheme } from '../../types/system';
import type { MotionMode } from '../../store/useSystem';

const THEMES: { value: PhosphorTheme; label: string }[] = [
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
];

const MENU_KEYS = ['FILE', 'EDIT', 'VIEW', 'PROJECTS', 'SETTINGS'] as const;
type MenuKey = (typeof MENU_KEYS)[number];

interface SubItem {
  label: string;
  active?: boolean;
  action: () => void;
}

interface MenuItem {
  label: string;
  action?: () => void;
  separator?: boolean;
  sub?: SubItem[];
  toggle?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function MenuBar() {
  const [clock, setClock] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [focusedTriggerIdx, setFocusedTriggerIdx] = useState(0);
  const [focusedItemIdx, setFocusedItemIdx] = useState(-1);
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);
  const [focusedSubIdx, setFocusedSubIdx] = useState(-1);

  const menuBarRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const theme = useSystemStore((s) => s.theme);
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const crtFlicker = useSystemStore((s) => s.crtFlicker);
  const motion = useSystemStore((s) => s.motion);
  const setTheme = useSystemStore((s) => s.setTheme);
  const toggleSound = useSystemStore((s) => s.toggleSound);
  const toggleFlicker = useSystemStore((s) => s.toggleFlicker);
  const setMotion = useSystemStore((s) => s.setMotion);
  const logout = useSystemStore((s) => s.logout);

  const tree = useVFSStore((s) => s.tree);
  const openWindow = useWindowsStore((s) => s.openWindow);

  /* ── Clock ── */
  useEffect(() => {
    const update = () => {
      setClock(
        new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  /* ── Close-all helper ── */
  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setOpenSubmenuKey(null);
    setFocusedItemIdx(-1);
    setFocusedSubIdx(-1);
  }, []);

  /* ── Click-outside ── */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        closeAll();
      }
    },
    [closeAll]
  );

  /* ── Focus-outside (Tab leaves menubar) ── */
  const handleFocusOutside = useCallback(
    (e: FocusEvent) => {
      const related = e.relatedTarget as Node | null;
      if (related && menuBarRef.current?.contains(related)) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (menuBarRef.current && !menuBarRef.current.contains(document.activeElement)) {
            closeAll();
          }
        });
      });
    },
    [closeAll]
  );

  /* ── Document-level listeners while menu open ── */
  useEffect(() => {
    if (!openMenu) return;
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', onDocKeyDown);
    document.addEventListener('focusout', handleFocusOutside);
    return () => {
      document.removeEventListener('keydown', onDocKeyDown);
      document.removeEventListener('focusout', handleFocusOutside);
    };
  }, [openMenu, closeAll, handleFocusOutside]);

  useEffect(() => {
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu, handleClickOutside]);

  /* ── Action helpers ── */
  const handleAction = useCallback(
    (action?: () => void) => {
      if (action) action();
      closeAll();
    },
    [closeAll]
  );

  const cycleMotion = useCallback(() => {
    const order: MotionMode[] = ['auto', 'on', 'off'];
    const idx = order.indexOf(motion);
    setMotion(order[(idx + 1) % order.length]);
  }, [motion, setMotion]);

  const openDirWindow = useCallback(
    (path: string, title: string) => {
      openWindow({ title, content: { type: 'directoryViewer', path } });
    },
    [openWindow]
  );

  const openTerminal = useCallback(() => {
    openWindow({ title: 'terminal', content: { type: 'terminal' } });
  }, [openWindow]);

  const getProjectList = useCallback((): { path: string; name: string }[] => {
    const projects = tree.children?.find((c) => c.name === 'projects');
    if (!projects?.children) return [];
    return projects.children
      .filter((c) => c.type === 'directory')
      .map((c) => ({ path: `/projects/${c.name}`, name: c.name }));
  }, [tree]);

  /* ── Menu tree (memoised) ── */
  const menus: Record<MenuKey, MenuGroup> = useMemo(
    () => ({
      FILE: {
        label: 'FILE',
        items: [
          { label: 'New Terminal', action: openTerminal },
          { label: '', separator: true },
          { label: 'Logout', action: logout },
        ],
      },
      EDIT: {
        label: 'EDIT',
        items: [
          { label: 'Cut', action: () => {} },
          { label: 'Copy', action: () => {} },
          { label: 'Paste', action: () => {} },
          { label: '', separator: true },
          { label: 'Select All', action: () => {} },
        ],
      },
      VIEW: {
        label: 'VIEW',
        items: [
          { label: 'Sort by Name', action: () => {} },
          { label: 'Sort by Date', action: () => {} },
        ],
      },
      PROJECTS: {
        label: 'PROJECTS',
        items: getProjectList().map((p) => ({
          label: p.name,
          action: () => openDirWindow(p.path, p.name),
        })),
      },
      SETTINGS: {
        label: 'SETTINGS',
        items: [
          {
            label: 'Theme',
            sub: THEMES.map((t) => ({
              label: t.label,
              active: theme === t.value,
              action: () => setTheme(t.value),
            })),
          },
          {
            label: 'Sound',
            toggle: soundEnabled ? 'ON' : 'OFF',
            action: toggleSound,
          },
          {
            label: 'CRT Flicker',
            toggle: crtFlicker ? 'ON' : 'OFF',
            action: toggleFlicker,
          },
          {
            label: 'Motion',
            toggle: motion.toUpperCase(),
            action: cycleMotion,
          },
        ],
      },
    }),
    [
      openTerminal,
      logout,
      getProjectList,
      openDirWindow,
      theme,
      soundEnabled,
      crtFlicker,
      motion,
      setTheme,
      toggleSound,
      toggleFlicker,
      cycleMotion,
    ]
  );

  /* ── Focus helpers ── */
  const getVisibleItems = useCallback(
    (key: MenuKey): MenuItem[] => menus[key].items.filter((it) => !it.separator),
    [menus]
  );

  const focusTrigger = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(MENU_KEYS.length - 1, idx));
    setFocusedTriggerIdx(clamped);
    triggerRefs.current[clamped]?.focus();
  }, []);

  const focusMenuItem = useCallback(
    (menuKey: MenuKey, idx: number) => {
      const items = getVisibleItems(menuKey);
      if (items.length === 0) return;
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      setFocusedItemIdx(clamped);
      requestAnimationFrame(() => {
        const el = menuBarRef.current?.querySelector(
          `[data-menu="${menuKey}"][data-item="${clamped}"]`
        ) as HTMLElement | null;
        el?.focus();
      });
    },
    [getVisibleItems]
  );

  const focusSubMenuItem = useCallback(
    (parentKey: string, subItems: SubItem[], idx: number) => {
      if (subItems.length === 0) return;
      const clamped = Math.max(0, Math.min(subItems.length - 1, idx));
      setFocusedSubIdx(clamped);
      requestAnimationFrame(() => {
        const el = menuBarRef.current?.querySelector(
          `[data-sub-parent="${parentKey}"][data-sub-item="${clamped}"]`
        ) as HTMLElement | null;
        el?.focus();
      });
    },
    []
  );

  const openMenuByKey = useCallback((key: MenuKey) => {
    setOpenMenu(key);
    setOpenSubmenuKey(null);
    setFocusedItemIdx(-1);
    setFocusedSubIdx(-1);
  }, []);

  const closeAndFocusTrigger = useCallback(
    (triggerIdx: number) => {
      closeAll();
      focusTrigger(triggerIdx >= 0 ? triggerIdx : 0);
    },
    [closeAll, focusTrigger]
  );

  /* ── Keyboard handler ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { key } = e;

      /* ── Alt accelerators ── */
      if (e.altKey) {
        const accelMap: Record<string, MenuKey> = {
          f: 'FILE',
          e: 'EDIT',
          v: 'VIEW',
          p: 'PROJECTS',
          s: 'SETTINGS',
        };
        const target = accelMap[key.toLowerCase()];
        if (target) {
          e.preventDefault();
          const tIdx = MENU_KEYS.indexOf(target);
          if (openMenu === target) {
            closeAndFocusTrigger(tIdx);
          } else {
            openMenuByKey(target);
            setFocusedTriggerIdx(tIdx);
            focusMenuItem(target, 0);
          }
          return;
        }
      }

      /* ═══════ MENU IS OPEN ═══════ */
      if (openMenu) {
        const openKey = openMenu as MenuKey;
        const visibleItems = getVisibleItems(openKey);

        /* ── Submenu is open ── */
        if (openSubmenuKey) {
          const parentItem = visibleItems.find(
            (it) => it.label === openSubmenuKey && it.sub
          );
          if (parentItem?.sub) {
            const subItems = parentItem.sub;

            const returnFocusToParent = () => {
              setOpenSubmenuKey(null);
              setFocusedSubIdx(-1);
              const pIdx = visibleItems.findIndex((it) => it.label === openSubmenuKey);
              if (pIdx >= 0) {
                setFocusedItemIdx(pIdx);
                const el = menuBarRef.current?.querySelector(
                  `[data-menu="${openKey}"][data-item="${pIdx}"]`
                ) as HTMLElement | null;
                el?.focus();
              }
            };

            switch (key) {
              case 'ArrowDown': {
                e.preventDefault();
                focusSubMenuItem(
                  openSubmenuKey,
                  subItems,
                  focusedSubIdx + 1 >= subItems.length ? 0 : focusedSubIdx + 1
                );
                return;
              }
              case 'ArrowUp': {
                e.preventDefault();
                focusSubMenuItem(
                  openSubmenuKey,
                  subItems,
                  focusedSubIdx - 1 < 0 ? subItems.length - 1 : focusedSubIdx - 1
                );
                return;
              }
              case 'Home': {
                e.preventDefault();
                focusSubMenuItem(openSubmenuKey, subItems, 0);
                return;
              }
              case 'End': {
                e.preventDefault();
                focusSubMenuItem(openSubmenuKey, subItems, subItems.length - 1);
                return;
              }
              case 'Enter':
              case ' ': {
                e.preventDefault();
                if (focusedSubIdx >= 0 && focusedSubIdx < subItems.length) {
                  handleAction(subItems[focusedSubIdx].action);
                }
                return;
              }
              case 'Escape':
              case 'ArrowLeft': {
                e.preventDefault();
                returnFocusToParent();
                return;
              }
              case 'ArrowRight': {
                e.preventDefault();
                return;
              }
            }
          }
        }

        /* ── Menu-level navigation ── */
        switch (key) {
          case 'ArrowDown': {
            e.preventDefault();
            const next = focusedItemIdx < 0 ? 0 : focusedItemIdx + 1;
            focusMenuItem(openKey, next >= visibleItems.length ? 0 : next);
            return;
          }
          case 'ArrowUp': {
            e.preventDefault();
            const prev =
              focusedItemIdx < 0 ? visibleItems.length - 1 : focusedItemIdx - 1;
            focusMenuItem(openKey, prev < 0 ? visibleItems.length - 1 : prev);
            return;
          }
          case 'Home': {
            e.preventDefault();
            focusMenuItem(openKey, 0);
            return;
          }
          case 'End': {
            e.preventDefault();
            focusMenuItem(openKey, visibleItems.length - 1);
            return;
          }
          case 'Enter':
          case ' ': {
            e.preventDefault();
            if (focusedItemIdx >= 0 && focusedItemIdx < visibleItems.length) {
              const item = visibleItems[focusedItemIdx];
              if (item.sub) {
                setOpenSubmenuKey(item.label);
                focusSubMenuItem(item.label, item.sub, 0);
              } else {
                handleAction(item.action);
              }
            }
            return;
          }
          case 'ArrowRight': {
            e.preventDefault();
            if (focusedItemIdx >= 0 && focusedItemIdx < visibleItems.length) {
              const item = visibleItems[focusedItemIdx];
              if (item.sub) {
                setOpenSubmenuKey(item.label);
                focusSubMenuItem(item.label, item.sub, 0);
                return;
              }
            }
            closeAll();
            const cIdx = MENU_KEYS.indexOf(openKey);
            const nIdx = (cIdx + 1) % MENU_KEYS.length;
            openMenuByKey(MENU_KEYS[nIdx]);
            setFocusedTriggerIdx(nIdx);
            requestAnimationFrame(() => {
              triggerRefs.current[nIdx]?.focus();
            });
            return;
          }
          case 'ArrowLeft': {
            e.preventDefault();
            closeAll();
            const cIdx = MENU_KEYS.indexOf(openKey);
            const pIdx = (cIdx - 1 + MENU_KEYS.length) % MENU_KEYS.length;
            openMenuByKey(MENU_KEYS[pIdx]);
            setFocusedTriggerIdx(pIdx);
            requestAnimationFrame(() => {
              triggerRefs.current[pIdx]?.focus();
            });
            return;
          }
          case 'Escape': {
            e.preventDefault();
            const tIdx = MENU_KEYS.indexOf(openKey);
            closeAndFocusTrigger(tIdx);
            return;
          }
        }
        return;
      }

      /* ═══════ MENUBAR LEVEL (no menu open) ═══════ */
      switch (key) {
        case 'ArrowRight': {
          e.preventDefault();
          focusTrigger((focusedTriggerIdx + 1) % MENU_KEYS.length);
          return;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          focusTrigger(
            (focusedTriggerIdx - 1 + MENU_KEYS.length) % MENU_KEYS.length
          );
          return;
        }
        case 'ArrowDown': {
          e.preventDefault();
          openMenuByKey(MENU_KEYS[focusedTriggerIdx]);
          requestAnimationFrame(() => {
            triggerRefs.current[focusedTriggerIdx]?.focus();
          });
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          openMenuByKey(MENU_KEYS[focusedTriggerIdx]);
          const items = getVisibleItems(MENU_KEYS[focusedTriggerIdx]);
          focusMenuItem(MENU_KEYS[focusedTriggerIdx], items.length - 1);
          return;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          openMenuByKey(MENU_KEYS[focusedTriggerIdx]);
          requestAnimationFrame(() => {
            triggerRefs.current[focusedTriggerIdx]?.focus();
          });
          return;
        }
      }
    },
    [
      openMenu,
      focusedTriggerIdx,
      focusedItemIdx,
      openSubmenuKey,
      focusedSubIdx,
      closeAll,
      closeAndFocusTrigger,
      openMenuByKey,
      focusTrigger,
      focusMenuItem,
      focusSubMenuItem,
      handleAction,
      getVisibleItems,
      menus,
    ]
  );

  /* ── Click handler for triggers ── */
  const handleTriggerClick = useCallback(
    (key: MenuKey) => {
      const idx = MENU_KEYS.indexOf(key);
      if (openMenu === key) {
        closeAll();
        focusTrigger(idx);
      } else {
        openMenuByKey(key);
        setFocusedTriggerIdx(idx);
      }
    },
    [openMenu, closeAll, focusTrigger, openMenuByKey]
  );

  /* ── Render ── */
  return (
    <div
      className={styles.menuBar}
      ref={menuBarRef}
      role="menubar"
      aria-label="Application menu"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.menuLeft}>
        {MENU_KEYS.map((key, i) => {
          const menu = menus[key];
          return (
            <div key={key} className={styles.menuItemWrapper} role="none">
              <span
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                className={`${styles.menuItem} ${openMenu === key ? styles.menuItemActive : ''}`}
                onClick={() => handleTriggerClick(key)}
                role="menuitem"
                tabIndex={focusedTriggerIdx === i ? 0 : -1}
                aria-haspopup="true"
                aria-expanded={openMenu === key}
              >
                {menu.label}
              </span>
              {openMenu === key && (
                <div
                  className={styles.settingsDropdown}
                  role="menu"
                  aria-label={menu.label}
                >
                  {menu.items.map((item, j) => {
                    if (item.separator) {
                      return (
                        <div
                          key={j}
                          className={styles.dropdownSeparator}
                          role="separator"
                        />
                      );
                    }
                    const visibleIdx = menu.items
                      .slice(0, j)
                      .filter((it) => !it.separator).length;

                    /* ── Submenu parent (e.g. Theme) ── */
                    if (item.sub) {
                      return (
                        <div
                          key={j}
                          className={styles.settingsItemWithSub}
                          role="none"
                        >
                          <span
                            className={styles.settingsLabel}
                            role="menuitem"
                            tabIndex={-1}
                            data-menu={key}
                            data-item={visibleIdx}
                            aria-haspopup="true"
                            aria-expanded={openSubmenuKey === item.label}
                            onClick={() => {
                              setOpenSubmenuKey(
                                openSubmenuKey === item.label ? null : item.label
                              );
                              setFocusedItemIdx(visibleIdx);
                            }}
                            onMouseEnter={() => {
                              setOpenSubmenuKey(item.label);
                              setFocusedItemIdx(visibleIdx);
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            className={styles.settingsArrow}
                            aria-hidden="true"
                          >
                            &#9654;
                          </span>
                          <div
                            className={`${styles.dropdownSub} ${openSubmenuKey === item.label ? styles.dropdownSubOpen : ''}`}
                            role="menu"
                            aria-label={item.label}
                            onMouseLeave={() => {
                              setOpenSubmenuKey(null);
                            }}
                          >
                            {item.sub.map((s, k) => (
                              <div
                                key={k}
                                className={styles.dropdownItem}
                                role="menuitem"
                                tabIndex={-1}
                                data-sub-parent={item.label}
                                data-sub-item={k}
                                onClick={() => handleAction(s.action)}
                              >
                                <span
                                  style={{
                                    color: s.active
                                      ? 'var(--phosphor)'
                                      : 'var(--phosphor-dim)',
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: 12,
                                  }}
                                >
                                  {s.active ? '> ' : '  '}
                                  {s.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    /* ── Toggle item ── */
                    if (item.toggle !== undefined) {
                      return (
                        <div
                          key={j}
                          className={styles.settingsItem}
                          role="menuitem"
                          tabIndex={-1}
                          data-menu={key}
                          data-item={visibleIdx}
                          onClick={() => handleAction(item.action)}
                        >
                          <span className={styles.settingsLabel}>
                            {item.label}
                          </span>
                          <span className={styles.settingsActive}>
                            {item.toggle}
                          </span>
                        </div>
                      );
                    }

                    /* ── Regular item ── */
                    return (
                      <div
                        key={j}
                        className={styles.settingsItem}
                        role="menuitem"
                        tabIndex={-1}
                        data-menu={key}
                        data-item={visibleIdx}
                        onClick={() => handleAction(item.action)}
                      >
                        <span className={styles.settingsLabel}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.menuRight}>
        <span className={styles.clock} aria-label="Current date">
          {clock}
        </span>
      </div>
    </div>
  );
}
