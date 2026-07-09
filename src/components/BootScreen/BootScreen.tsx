import { useSystemStore } from '../../store/useSystem';
import { useBootSequence } from '../../hooks/useBootSequence';
import { BIOS_STEPS, BOOT_STEPS } from '../../lib/bootSequence';
import { BiosOutput } from './BiosOutput';
import { LoginPrompt } from './LoginPrompt';

export function BootScreen() {
  const { bootPhase, advanceBoot } = useSystemStore();

  if (bootPhase === 'bios') {
    return <BiosPhase onComplete={advanceBoot} />;
  }

  if (bootPhase === 'boot') {
    return <BootPhase onComplete={advanceBoot} />;
  }

  if (bootPhase === 'login') {
    return <LoginPhase />;
  }

  return null;
}

function BiosPhase({ onComplete }: { onComplete: () => void }) {
  const { visibleSteps, isComplete } = useBootSequence({
    steps: BIOS_STEPS,
    onComplete,
  });

  return <BiosOutput steps={visibleSteps} onSkip={isComplete ? undefined : onComplete} />;
}

function BootPhase({ onComplete }: { onComplete: () => void }) {
  const { visibleSteps, isComplete } = useBootSequence({
    steps: BOOT_STEPS,
    onComplete,
  });

  return <BiosOutput steps={visibleSteps} onSkip={isComplete ? undefined : onComplete} />;
}

function LoginPhase() {
  return <LoginPrompt />;
}
