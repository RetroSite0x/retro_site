import { useEffect, useState } from 'react';
import { useSystemStore } from './store/useSystem';
import { useWindowsStore } from './store/useWindows';
import { BootScreen } from './components/BootScreen/BootScreen';
import { Desktop } from './components/Desktop/Desktop';
import { CRTOverlay } from './components/Effects/CRTOverlay';
import { SoundEngine } from './components/Effects/SoundEngine';
import { Onboarding, hasSeenOnboarding } from './components/Onboarding/Onboarding';
import { useTheme } from './hooks/useTheme';
import { useKeyboard } from './hooks/useKeyboard';
import { useTypeToTerminal } from './hooks/useTypeToTerminal';
import { registerAllCommands } from './components/Terminal/commands';

// Register all terminal commands at module scope
registerAllCommands();

// ── Deep-link: resolve named ?open targets to window configs ────────────
type OpenConfig = { title: string; content: { type: 'directoryViewer'; path: string } | { type: 'fileViewer'; filePath: string } };

const NAMED_TARGETS: Record<string, OpenConfig> = {
  projects: { title: 'projects/', content: { type: 'directoryViewer', path: '/projects' } },
  papers:   { title: 'papers/',   content: { type: 'directoryViewer', path: '/papers' } },
  logs:     { title: 'logs/',     content: { type: 'directoryViewer', path: '/logs' } },
  about:    { title: 'about.txt',  content: { type: 'fileViewer', filePath: '/home/guest/about.txt' } },
  contact:  { title: 'contact.md', content: { type: 'fileViewer', filePath: '/home/guest/contact.md' } },
  resume:   { title: 'resume.txt',  content: { type: 'fileViewer', filePath: '/home/guest/resume.txt' } },
};

function resolveOpenTarget(raw: string): OpenConfig | null {
  // Check named targets first
  const named = NAMED_TARGETS[raw];
  if (named) return named;

  // Absolute paths: directory if last segment has no dot, file otherwise
  if (raw.startsWith('/')) {
    const segments = raw.split('/');
    const last = segments[segments.length - 1] ?? '';
    if (last.includes('.')) {
      const filename = last;
      return { title: filename, content: { type: 'fileViewer', filePath: raw } };
    }
    return { title: raw + '/', content: { type: 'directoryViewer', path: raw } };
  }

  // Unknown target — ignore
  return null;
}

// Module-level singletons survive StrictMode double-mount
let deepLinkParsed = false;
let pendingOpenTarget: string | null = null;

export default function App() {
  const bootPhase = useSystemStore((s) => s.bootPhase);
  const isLoggedIn = useSystemStore((s) => s.isLoggedIn);
  useTheme();
  useKeyboard();
  useTypeToTerminal();

  const [showOnboarding, setShowOnboarding] = useState(false);

  const VALID_PHASES = ['bios', 'login', 'desktop'] as const;
  const isValidPhase = VALID_PHASES.includes(bootPhase);

  // ── DIS-01: deep-link query-param entry (runs once) ────────────────
  useEffect(() => {
    if (deepLinkParsed) return;
    deepLinkParsed = true;

    const params = new URLSearchParams(window.location.search);
    const shouldSkipBoot = params.get('skip-boot') === '1' || params.get('guest') === '1';
    const openParam = params.get('open');

    if (shouldSkipBoot) {
      useSystemStore.setState({
        bootPhase: 'desktop',
        isLoggedIn: true,
        username: 'guest',
      });
    }

    if (openParam) {
      const resolved = resolveOpenTarget(openParam);
      if (resolved) {
        pendingOpenTarget = openParam;
      }
    }
  }, []);

  // ── DIS-01: deferred ?open — fires once when desktop is reached ─────
  useEffect(() => {
    if (bootPhase === 'desktop' && isLoggedIn && pendingOpenTarget) {
      const target = pendingOpenTarget;
      pendingOpenTarget = null;
      const resolved = resolveOpenTarget(target);
      if (resolved) {
        useWindowsStore.getState().openWindow(resolved);
      }
    }
  }, [bootPhase, isLoggedIn]);

  // ── DIS-02: onboarding — show once on first desktop visit ───────────
  useEffect(() => {
    if (bootPhase === 'desktop' && isLoggedIn && !hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, [bootPhase, isLoggedIn]);

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

  const isBoot = bootPhase === 'bios' || bootPhase === 'login';
  const isDesktop = bootPhase === 'desktop' && isLoggedIn;

  return (
    <>
      <CRTOverlay />
      <SoundEngine />
      {isBoot && <BootScreen />}
      {isDesktop && <Desktop />}
      {isDesktop && showOnboarding && (
        <Onboarding onDismiss={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
