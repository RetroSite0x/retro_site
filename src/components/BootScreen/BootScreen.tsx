import { useSystemStore } from '../../store/useSystem';
import { BootIntro } from './BootIntro';
import { LoginPrompt } from './LoginPrompt';

export function BootScreen() {
  const { bootPhase, advanceBoot } = useSystemStore();

  if (bootPhase === 'bios') {
    return <BootIntro onComplete={advanceBoot} />;
  }

  if (bootPhase === 'login') {
    return <LoginPrompt />;
  }

  return null;
}
