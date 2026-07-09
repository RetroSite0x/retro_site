import { useSystemStore } from './store/useSystem';
import { BootScreen } from './components/BootScreen/BootScreen';
import { Desktop } from './components/Desktop/Desktop';
import { CRTOverlay } from './components/Effects/CRTOverlay';
import { SoundEngine } from './components/Effects/SoundEngine';
import { useTheme } from './hooks/useTheme';
import { useKeyboard } from './hooks/useKeyboard';
import { registerAllCommands } from './components/Terminal/commands';

// Register all terminal commands at module scope
registerAllCommands();

export default function App() {
  const bootPhase = useSystemStore((s) => s.bootPhase);
  const isLoggedIn = useSystemStore((s) => s.isLoggedIn);
  useTheme();
  useKeyboard();

  const VALID_PHASES = ['bios', 'boot', 'login', 'desktop'] as const;
  const isValidPhase = VALID_PHASES.includes(bootPhase as any);

  if (!isValidPhase) {
    return (
      <>
        <CRTOverlay />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: 'var(--phosphor-bg)', color: 'var(--phosphor)',
          fontFamily: 'var(--font-terminal)', fontSize: 16, gap: 16,
        }}>
          <pre>{`SEGMENTATION FAULT
==================
Address: 0x00000000
Cause: Invalid boot phase: ${bootPhase}
System halted.

  [ Press Ctrl+Alt+Del to reboot ]`}</pre>
          <button onClick={() => {
            import('./store/useSystem').then(m => m.useSystemStore.setState({ bootPhase: 'bios', isLoggedIn: false }));
          }} style={{
            background: 'none', border: '1px solid var(--phosphor)', color: 'var(--phosphor)',
            fontFamily: 'var(--font-terminal)', fontSize: 14, padding: '4px 12px', cursor: 'pointer',
          }}>REBOOT</button>
        </div>
      </>
    );
  }

  const isBoot = bootPhase === 'bios' || bootPhase === 'boot' || bootPhase === 'login';
  const isDesktop = bootPhase === 'desktop' && isLoggedIn;

  return (
    <>
      <CRTOverlay />
      <SoundEngine />
      {isBoot && <BootScreen />}
      {isDesktop && <Desktop />}
    </>
  );
}
