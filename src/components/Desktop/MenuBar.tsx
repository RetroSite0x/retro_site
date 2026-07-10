import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../styles/components/menu-bar.module.css';
import { useSystemStore } from '../../store/useSystem';
import { useVFSStore } from '../../store/useVFS';
import { useWindowsStore } from '../../store/useWindows';
import type { PhosphorTheme } from '../../types/system';

const THEMES: { value: PhosphorTheme; label: string }[] = [
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
];

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
  const menuBarRef = useRef<HTMLDivElement>(null);

  const theme = useSystemStore((s) => s.theme);
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const crtFlicker = useSystemStore((s) => s.crtFlicker);
  const setTheme = useSystemStore((s) => s.setTheme);
  const toggleSound = useSystemStore((s) => s.toggleSound);
  const toggleFlicker = useSystemStore((s) => s.toggleFlicker);
  const logout = useSystemStore((s) => s.logout);

  const tree = useVFSStore((s) => s.tree);
  const openWindow = useWindowsStore((s) => s.openWindow);

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

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
      setOpenMenu(null);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpenMenu(null);
      // Return focus to the menu bar trigger
      const active = menuBarRef.current?.querySelector<HTMLElement>(`.${styles.menuItemActive}, .${styles.menuItem}`);
      active?.focus();
    }
  }, []);

  useEffect(() => {
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu, handleClickOutside]);

  const closeMenu = () => setOpenMenu(null);

  const handleAction = (action?: () => void) => {
    if (action) action();
    closeMenu();
  };

  const openDirWindow = (path: string, title: string) => {
    openWindow({
      title,
      content: { type: 'directoryViewer', path },
    });
    closeMenu();
  };

  const openTerminal = () => {
    openWindow({
      title: 'terminal',
      content: { type: 'terminal' },
    });
    closeMenu();
  };

  const getProjectList = (): { path: string; name: string }[] => {
    const projects = tree.children?.find((c) => c.name === 'projects');
    if (!projects?.children) return [];
    return projects.children
      .filter((c) => c.type === 'directory')
      .map((c) => ({
        path: `/projects/${c.name}`,
        name: c.name,
      }));
  };

  const menus: Record<string, MenuGroup> = {
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
      ],
    },
  };

  return (
    <div className={styles.menuBar} ref={menuBarRef} role="menubar" aria-label="Application menu" onKeyDown={handleKeyDown}>
      <div className={styles.menuLeft}>
        {Object.entries(menus).map(([key, menu]) => (
          <div key={key} className={styles.menuItemWrapper} role="none">
            <span
              className={`${styles.menuItem} ${openMenu === key ? styles.menuItemActive : ''}`}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              role="menuitem"
              tabIndex={0}
              aria-haspopup="true"
              aria-expanded={openMenu === key}
            >
              {menu.label}
            </span>
            {openMenu === key && (
              <div className={styles.settingsDropdown} role="menu" aria-label={menu.label}>
                {menu.items.map((item, i) => {
                  if (item.separator) {
                    return <div key={i} className={styles.dropdownSeparator} role="separator" />;
                  }
                  if (item.sub) {
                    return (
                      <div key={i} className={styles.settingsItemWithSub} role="none">
                        <span className={styles.settingsLabel} role="menuitem" aria-haspopup="true">{item.label}</span>
                        <span className={styles.settingsArrow} aria-hidden="true">&#9654;</span>
                        <div className={styles.dropdownSub} role="menu" aria-label={item.label}>
                          {item.sub.map((s, j) => (
                            <div
                              key={j}
                              className={styles.dropdownItem}
                              onClick={() => handleAction(s.action)}
                              role="menuitem"
                              tabIndex={-1}
                            >
                              <span style={{ color: s.active ? 'var(--phosphor)' : 'var(--phosphor-dim)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                                {s.active ? '> ' : '  '}{s.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (item.toggle !== undefined) {
                    return (
                      <div
                        key={i}
                        className={styles.settingsItem}
                        onClick={() => handleAction(item.action)}
                        role="menuitem"
                        tabIndex={-1}
                      >
                        <span className={styles.settingsLabel}>{item.label}</span>
                        <span className={styles.settingsActive}>{item.toggle}</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className={styles.settingsItem}
                      onClick={() => handleAction(item.action)}
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <span className={styles.settingsLabel}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.menuRight}>
        <span className={styles.clock} aria-label="Current date">{clock}</span>
      </div>
    </div>
  );
}
