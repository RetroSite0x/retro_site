import { useEffect, useRef, useCallback } from 'react';
import styles from '../../styles/components/onboarding.module.css';

const STORAGE_KEY = 'nabilos-onboarding-seen';

export function dismissOnboarding(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // localStorage unavailable — treat as seen to avoid re-showing
  }
}

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true; // if localStorage is unavailable, don't show
  }
}

interface OnboardingProps {
  onDismiss: () => void;
}

export function Onboarding({ onDismiss }: OnboardingProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    dismissOnboarding();
    // Return focus to the terminal so the user can type immediately; it is the
    // primary interaction and may not have been focused when the overlay opened.
    const terminalInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Terminal input"]'
    );
    if (terminalInput) {
      terminalInput.focus();
    } else if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
      previousFocus.current.focus();
    }
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    // Save whatever is focused right now so we can restore it
    previousFocus.current = document.activeElement as HTMLElement | null;
    // Focus the dismiss button immediately
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        dismiss();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  function handleOverlayClick(e: React.MouseEvent) {
    // Only dismiss when clicking the backdrop, not the dialog itself
    if (e.target === e.currentTarget) {
      dismiss();
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-label="Welcome to NABIL/86"
        tabIndex={-1}
      >
        <div className={styles.header}>NABIL/86</div>
        <hr className={styles.divider} />
        <ul className={styles.hints}>
          <li className={styles.hintItem}>
            Click desktop icons to explore files and directories
          </li>
          <li className={styles.hintItem}>
            Type <span className={styles.hintKey}>help</span> in the terminal for commands
          </li>
          <li className={styles.hintItem}>
            Drag windows by their title bar to reposition
          </li>
          <li className={styles.hintItem}>
            Press <span className={styles.hintKey}>ESC</span> or click anywhere to dismiss
          </li>
        </ul>
        <div className={styles.footer}>
          <button
            ref={btnRef}
            className={styles.dismissBtn}
            onClick={dismiss}
          >
            GOT IT &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
