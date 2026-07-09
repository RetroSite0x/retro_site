import type { BootStep } from '../../lib/bootSequence';
import styles from '../../styles/components/boot-screen.module.css';

interface BiosOutputProps {
  steps: BootStep[];
  onSkip?: () => void;
}

export function BiosOutput({ steps, onSkip }: BiosOutputProps) {
  return (
    <div className={styles.container} onClick={onSkip}>
      <div className={styles.content}>
        {steps.map((step, i) => (
          <div key={i} className={`${styles.line} ${styles[step.type]}`}>
            {step.message}
          </div>
        ))}
        {!onSkip && <span className={styles.cursor}>_</span>}
      </div>
      {onSkip && (
        <div className={styles.hint}>Click to skip...</div>
      )}
    </div>
  );
}
