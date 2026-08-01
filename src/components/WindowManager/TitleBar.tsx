import { useDrag } from '../../hooks/useDrag';
import { useWindowsStore } from '../../store/useWindows';
import styles from '../../styles/components/window.module.css';

interface TitleBarProps {
  windowId: string;
  title: string;
}

export function TitleBar({ windowId, title }: TitleBarProps) {
  const { onPointerDown } = useDrag({ windowId });
  const focusWindow = useWindowsStore((s) => s.focusWindow);
  const minimizeWindow = useWindowsStore((s) => s.minimizeWindow);
  const maximizeWindow = useWindowsStore((s) => s.maximizeWindow);
  const closeWindow = useWindowsStore((s) => s.closeWindow);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.controls}`)) return;
    focusWindow(windowId);
    onPointerDown(e);
  };

  return (
    <div className={styles.titleBar} onPointerDown={handlePointerDown}>
      <span className={styles.titleText}>{title}</span>
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); minimizeWindow(windowId); }}
          aria-label="Minimize"
        >
          _
        </button>
        <button
          className={styles.controlBtn}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); maximizeWindow(windowId); }}
          aria-label="Maximize"
        >
          □
        </button>
        <button
          className={styles.controlBtn}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); closeWindow(windowId); }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
