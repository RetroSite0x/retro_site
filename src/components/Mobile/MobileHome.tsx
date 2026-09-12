import { identity } from '../../data/portfolio';
import { RetroIcon, type RetroIconName } from '../icons/RetroIcon';
import styles from '../../styles/components/mobile.module.css';

type AppId = 'terminal' | 'files' | 'dashboard' | 'browser' | 'contact';

interface AppTile {
  id: AppId;
  icon: RetroIconName;
  name: string;
}

const APP_TILES: readonly AppTile[] = [
  { id: 'terminal',  icon: 'terminal',  name: 'Terminal' },
  { id: 'files',     icon: 'files',     name: 'Files' },
  { id: 'dashboard', icon: 'dashboard', name: 'Dashboard' },
  { id: 'browser',   icon: 'browser',   name: 'Browser' },
  { id: 'contact',   icon: 'contact',   name: 'Contact' },
] as const;

interface FolderShortcut {
  label: string;
  icon: RetroIconName;
  target: AppId;
  path?: string;
}

const FOLDER_SHORTCUTS: readonly FolderShortcut[] = [
  { label: 'Projects', icon: 'projects', target: 'files', path: '/projects' },
  { label: 'Papers',   icon: 'papers',   target: 'files', path: '/papers' },
  { label: 'Logs',     icon: 'logs',     target: 'files', path: '/logs' },
  { label: 'About',    icon: 'contact',  target: 'contact' },
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
              <span className={styles.appTileIcon}><RetroIcon name={tile.icon} size={30} /></span>
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
              <span className={styles.folderIcon}><RetroIcon name={folder.icon} size={20} /></span>
              {folder.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
