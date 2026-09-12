import { identity } from '../../data/portfolio';
import styles from '../../styles/components/mobile.module.css';

type AppId = 'terminal' | 'files' | 'dashboard' | 'browser' | 'contact';

interface AppTile {
  id: AppId;
  icon: string;
  name: string;
}

const APP_TILES: readonly AppTile[] = [
  { id: 'terminal',  icon: '>', name: 'Terminal' },
  { id: 'files',     icon: '□', name: 'Files' },
  { id: 'dashboard', icon: '◎', name: 'Dashboard' },
  { id: 'browser',   icon: '◇', name: 'Browser' },
  { id: 'contact',   icon: '@', name: 'Contact' },
] as const;

interface FolderShortcut {
  label: string;
  icon: string;
  target: AppId;
  path?: string;
}

const FOLDER_SHORTCUTS: readonly FolderShortcut[] = [
  { label: 'Projects', icon: '📁', target: 'files', path: '/projects' },
  { label: 'Papers',   icon: '📄', target: 'files', path: '/papers' },
  { label: 'Logs',     icon: '📋', target: 'files', path: '/logs' },
  { label: 'About',    icon: 'ℹ',  target: 'contact' },
] as const;

interface MobileHomeProps {
  onOpenApp: (id: AppId) => void;
}

export function MobileHome({ onOpenApp }: MobileHomeProps) {
  return (
    <div className={styles.home}>
      {/* Greeting */}
      <div className={styles.homeGreeting}>
        <div>{identity.displayName}</div>
        <div className={styles.homeGreetingSmall}>{identity.role}</div>
      </div>

      {/* App grid */}
      <div>
        <div className={styles.sectionLabel}>Applications</div>
        <div className={styles.appGrid}>
          {APP_TILES.map((tile) => (
            <button
              key={tile.id}
              className={styles.appTile}
              onClick={() => onOpenApp(tile.id)}
            >
              <span className={styles.appTileIcon}>{tile.icon}</span>
              <span className={styles.appTileName}>{tile.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Folder shortcuts */}
      <div>
        <div className={styles.sectionLabel}>Quick Access</div>
        <div className={styles.folderGrid}>
          {FOLDER_SHORTCUTS.map((folder) => (
            <button
              key={folder.label}
              className={styles.folderBtn}
              onClick={() => onOpenApp(folder.target)}
            >
              <span className={styles.folderIcon}>{folder.icon}</span>
              {folder.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
