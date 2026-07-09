import { useResize } from '../../hooks/useResize';
import type { ResizeDirection } from '../../types/window';
import styles from '../../styles/components/window.module.css';

interface ResizeHandleProps {
  windowId: string;
  direction: ResizeDirection;
}

const DIRECTION_CSS: Record<ResizeDirection, string> = {
  n: styles.handleN,
  s: styles.handleS,
  e: styles.handleE,
  w: styles.handleW,
  ne: styles.handleNE,
  nw: styles.handleNW,
  se: styles.handleSE,
  sw: styles.handleSW,
};

export function ResizeHandle({ windowId, direction }: ResizeHandleProps) {
  const { onPointerDown } = useResize({ windowId, direction });

  return (
    <div
      className={`${styles.handle} ${DIRECTION_CSS[direction]}`}
      onPointerDown={onPointerDown}
    />
  );
}
