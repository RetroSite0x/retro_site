import { Desktop } from './components/Desktop/Desktop';
import { CRTOverlay } from './components/Effects/CRTOverlay';
import { SoundEngine } from './components/Effects/SoundEngine';
import { useTheme } from './hooks/useTheme';
import { useKeyboard } from './hooks/useKeyboard';
import { registerAllCommands } from './components/Terminal/commands';

// Register all terminal commands at module scope
registerAllCommands();

export default function App() {
  useTheme();
  useKeyboard();

  return (
    <>
      <CRTOverlay />
      <SoundEngine />
      <Desktop />
    </>
  );
}
