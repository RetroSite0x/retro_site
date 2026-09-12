import { useState, useEffect, useCallback } from 'react';
import { useSystemStore } from '../../store/useSystem';
import type { PhosphorTheme } from '../../types/system';
import { Terminal } from '../Terminal/Terminal';
import { Dashboard } from '../Dashboard/Dashboard';
import { BrowserViewer } from '../WebBrowser/BrowserViewer';
import { MobileHome } from './MobileHome';
import { MobileFiles } from './MobileFiles';
import { MobileContact } from './MobileContact';
import { RetroIcon, type RetroIconName } from '../icons/RetroIcon';
import styles from '../../styles/components/mobile.module.css';

type AppId = 'home' | 'terminal' | 'files' | 'dashboard' | 'browser' | 'contact';

interface DockItem {
  id: AppId;
  icon: RetroIconName;
  label: string;
}

const DOCK_ITEMS: readonly DockItem[] = [
  { id: 'home',      icon: 'home',      label: 'Home' },
  { id: 'terminal',  icon: 'terminal',  label: 'Terminal' },
  { id: 'files',     icon: 'files',     label: 'Files' },
  { id: 'dashboard', icon: 'dashboard', label: 'Dash' },
  { id: 'browser',   icon: 'browser',   label: 'Web' },
  { id: 'contact',   icon: 'contact',   label: 'Contact' },
] as const;

const THEME_CYCLE: readonly PhosphorTheme[] = ['green', 'amber', 'white', 'blue'] as const;

function useClock(): string {
  const [time, setTime] = useState(() => formatTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatTime(): string {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MobileDesktop() {
  const [activeApp, setActiveApp] = useState<AppId>('home');
  const theme = useSystemStore((s) => s.theme);
  const setTheme = useSystemStore((s) => s.setTheme);
  const username = useSystemStore((s) => s.username);
  const clock = useClock();

  const cycleTheme = useCallback(() => {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setTheme(next);
  }, [theme, setTheme]);

  const openApp = useCallback((id: AppId) => {
    setActiveApp(id);
  }, []);

  const goHome = useCallback(() => {
    setActiveApp('home');
  }, []);

  const isHome = activeApp === 'home';
  const activeLabel = DOCK_ITEMS.find((d) => d.id === activeApp)?.label ?? '';

  return (
    <div className={styles.shell}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.hostLabel}>{username}@retro</span>
        </div>
        <div className={styles.statusRight}>
          <span className={styles.clock}>{clock}</span>
          <button
            className={styles.themeToggle}
            onClick={cycleTheme}
            aria-label={`Theme: ${theme}. Tap to cycle.`}
          >
            {theme}
          </button>
        </div>
      </div>

      {/* App header — only when an app is open */}
      {!isHome && (
        <div className={styles.appHeader}>
          <button className={styles.backBtn} onClick={goHome} aria-label="Back to home">
            ← Home
          </button>
          <span className={styles.appTitle}>{activeLabel}</span>
        </div>
      )}

      {/* Main content area */}
      <div className={styles.main} id="main" tabIndex={-1}>
        <div className={styles.appContent}>
          {isHome && <MobileHome onOpenApp={openApp} />}
          {activeApp === 'terminal' && (
            <div className={styles.terminalWrap}>
              <Terminal />
            </div>
          )}
          {activeApp === 'files' && <MobileFiles />}
          {activeApp === 'dashboard' && (
            <div className={styles.dashboardWrap}>
              <Dashboard />
            </div>
          )}
          {activeApp === 'browser' && (
            <div className={styles.browserWrap}>
              <BrowserViewer />
            </div>
          )}
          {activeApp === 'contact' && <MobileContact />}
        </div>
      </div>

      {/* Bottom dock */}
      <nav className={styles.dock} aria-label="App dock">
        {DOCK_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.dockItem} ${activeApp === item.id ? styles.dockItemActive : ''}`}
            onClick={() => openApp(item.id)}
            aria-label={item.label}
            aria-current={activeApp === item.id ? 'true' : undefined}
          >
            <span className={styles.dockIcon}><RetroIcon name={item.icon} size={24} /></span>
            <span className={styles.dockLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
