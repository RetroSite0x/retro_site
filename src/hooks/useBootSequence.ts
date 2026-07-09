import { useState, useEffect, useCallback } from 'react';
import type { BootStep } from '../lib/bootSequence';

interface UseBootSequenceOptions {
  steps: BootStep[];
  onComplete: () => void;
}

export function useBootSequence({ steps, onComplete }: UseBootSequenceOptions) {
  const [visibleSteps, setVisibleSteps] = useState<BootStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= steps.length) {
      setIsComplete(true);
      onComplete();
      return;
    }

    const step = steps[currentIndex];
    const timer = setTimeout(() => {
      setVisibleSteps((prev) => [...prev, step]);
      setCurrentIndex((i) => i + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentIndex, steps, onComplete]);

  const skip = useCallback(() => {
    setVisibleSteps(steps);
    setCurrentIndex(steps.length);
    setIsComplete(true);
    onComplete();
  }, [steps, onComplete]);

  return { visibleSteps, isComplete, skip };
}
