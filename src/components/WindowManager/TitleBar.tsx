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
  const beginClose = useWindowsStore((s) => s.beginClose);

  const handlePointerDown = (e: React.PointerEvent) => {
    focusWindow(windowId);
    onPointerDown(e);
  };

  const handleDoubleClick = () => {
    maximizeWindow(windowId);
  };

  return (
    <div className={styles.titleBar} onPointerDown={handlePointerDown} onDoubleClick={handleDoubleClick}>
      <span className={styles.titleText}>{title}</span>
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); minimizeWindow(windowId); }}
          aria-label="Minimize"
        >
          _
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); maximizeWindow(windowId); }}
          aria-label="Maximize"
        >
          □
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => { e.stopPropagation(); beginClose(windowId); }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
