import { useState, useCallback } from 'react';
import styles from '../../styles/components/terminal.module.css';

interface MobileKeyBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface KeyDef {
  label: string;
  key: string;
  ctrl?: boolean;
}

const KEYS: KeyDef[] = [
  { label: 'Tab', key: 'Tab' },
  { label: 'Esc', key: 'Escape' },
  { label: 'Ctrl+C', key: 'c', ctrl: true },
  { label: 'Ctrl+L', key: 'l', ctrl: true },
  { label: '↑', key: 'ArrowUp' },
  { label: '↓', key: 'ArrowDown' },
  { label: '←', key: 'ArrowLeft' },
  { label: '→', key: 'ArrowRight' },
];

export function MobileKeyBar({ inputRef }: MobileKeyBarProps) {
  const [ctrlArmed, setCtrlArmed] = useState(false);

  const dispatchKey = useCallback(
    (def: KeyDef) => {
      const el = inputRef.current;
      if (!el) return;

      const useCtrl = def.ctrl || ctrlArmed;

      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: def.key,
          ctrlKey: useCtrl,
          bubbles: true,
        })
      );

      // Disarm sticky Ctrl after use (only if the button itself wasn't a Ctrl combo)
      if (ctrlArmed && !def.ctrl) {
        setCtrlArmed(false);
      }

      el.focus();
    },
    [inputRef, ctrlArmed],
  );

  const handleBarPointerDown = useCallback((e: React.PointerEvent) => {
    // Prevent tap from blurring the hidden terminal input
    e.preventDefault();
  }, []);

  const handleCtrlToggle = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setCtrlArmed((prev) => !prev);
      inputRef.current?.focus();
    },
    [inputRef],
  );

  const handleKeyPointerDown = useCallback(
    (def: KeyDef) => (e: React.PointerEvent) => {
      e.preventDefault();
      dispatchKey(def);
    },
    [dispatchKey],
  );

  return (
    <div
      className={styles.mobileKeyBar}
      onPointerDown={handleBarPointerDown}
    >
      <button
        type="button"
        className={`${styles.keyBarBtn} ${ctrlArmed ? styles.keyBarBtnActive : ''}`}
        onPointerDown={handleCtrlToggle}
      >
        Ctrl
      </button>
      {KEYS.map((def) => (
        <button
          key={def.label}
          type="button"
          className={styles.keyBarBtn}
          onPointerDown={handleKeyPointerDown(def)}
        >
          {def.label}
        </button>
      ))}
    </div>
  );
}
