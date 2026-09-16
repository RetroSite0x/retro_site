import { useSystemStore } from '../../store/useSystem';
import { BootIntro } from './BootIntro';

export function BootScreen() {
  const { bootPhase, advanceBoot } = useSystemStore();

  if (bootPhase === 'bios') {
    return <BootIntro onComplete={advanceBoot} />;
  }

  return null;
}
