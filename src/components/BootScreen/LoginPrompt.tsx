import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystem';
import { soundEngine } from '../../lib/sound';
import styles from '../../styles/components/boot-screen.module.css';

const DEMO_USERNAME = 'root';
const DEMO_PASSWORD = 'root';
const BOOT_LOG_LINES = [
  'NABIL/86 login service v2.4',
  'probing input devices ... ok',
  'mounting secure store ... ok',
  'login required',
];
const PRE_TYPE_DELAY_MS = 350;
const LOG_LINE_DELAY_MS = 260;
const CHAR_DELAY_MS = 155;
const FIELD_PAUSE_MS = 500;
const VERIFY_STEPS = 10;
const VERIFY_STEP_MS = 130;
const GRANTED_PAUSE_MS = 700;
const REDUCED_SUBMIT_DELAY_MS = 300;

export function LoginPrompt() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [granted, setGranted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const autoCancelledRef = useRef(false);
  const userEditedRef = useRef(false);
  const advanceBoot = useSystemStore((s) => s.advanceBoot);
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    autoCancelledRef.current = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const typeText = async (text: string, setValue: (v: string) => void) => {
      for (let i = 1; i <= text.length; i++) {
        if (autoCancelledRef.current) return;
        setValue(text.slice(0, i));
        if (soundEnabled) soundEngine.keyClick();
        await wait(CHAR_DELAY_MS);
      }
    };

    const run = async () => {
      if (reducedMotion) {
        setLogLines([...BOOT_LOG_LINES]);
        setUsername(DEMO_USERNAME);
        setPassword(DEMO_PASSWORD);
        setVerifyProgress(100);
        setGranted(true);
        await wait(REDUCED_SUBMIT_DELAY_MS);
        if (!autoCancelledRef.current) formRef.current?.requestSubmit();
        return;
      }

      await wait(PRE_TYPE_DELAY_MS);

      for (const line of BOOT_LOG_LINES) {
        if (autoCancelledRef.current) return;
        setLogLines((prev) => [...prev, line]);
        if (soundEnabled) soundEngine.diskSeek();
        await wait(LOG_LINE_DELAY_MS);
      }

      if (autoCancelledRef.current) return;
      await wait(FIELD_PAUSE_MS);
      await typeText(DEMO_USERNAME, setUsername);

      if (autoCancelledRef.current) return;
      await wait(FIELD_PAUSE_MS);
      passwordRef.current?.focus();
      await typeText(DEMO_PASSWORD, setPassword);

      if (autoCancelledRef.current) return;
      await wait(FIELD_PAUSE_MS);

      for (let step = 1; step <= VERIFY_STEPS; step++) {
        if (autoCancelledRef.current) return;
        setVerifyProgress(step * (100 / VERIFY_STEPS));
        if (soundEnabled) soundEngine.keyClick();
        await wait(VERIFY_STEP_MS);
      }

      if (autoCancelledRef.current) return;
      setGranted(true);
      if (soundEnabled) soundEngine.bootChirp();
      await wait(GRANTED_PAUSE_MS);
      if (autoCancelledRef.current) return;
      formRef.current?.requestSubmit();
    };

    run();

    return () => {
      autoCancelledRef.current = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion, soundEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Login incorrect');
      return;
    }
    advanceBoot();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && error) {
      setError('');
    }
  };

  const handleEdit = (setValue: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    autoCancelledRef.current = true;
    userEditedRef.current = true;
    setError('');
    setValue(e.target.value);
  };

  const handleFastForward = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (userEditedRef.current) {
      formRef.current?.requestSubmit();
      return;
    }
    autoCancelledRef.current = true;
    advanceBoot();
  };

  const filled = Math.floor((verifyProgress / 100) * 20);

  return (
    <div
      className={styles.container}
      onClick={handleFastForward}
      role="dialog"
      aria-label="Login prompt"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.content}
        aria-label="System login form"
      >
        <div aria-hidden="true" className={styles.loginBanner}>+============================================+</div>
        <div aria-hidden="true" className={styles.loginBanner}>|              Ann Naser Nabil              |</div>
        <div aria-hidden="true" className={styles.loginBanner}>|          CRAY X-MP/48 -- NOS 2.0          |</div>
        <div aria-hidden="true" className={styles.loginBanner}>+============================================+</div>
        <div aria-hidden="true">&nbsp;</div>

        <div aria-live="polite">
          {logLines.map((line, i) => (
            <div key={i} className={`${styles.line} ${styles.loginLog}`}>
              {line}
              {!granted && i === logLines.length - 1 && (
                <span className={styles.cursor} aria-hidden="true">{'\u2588'}</span>
              )}
            </div>
          ))}

          {verifyProgress > 0 && !granted && (
            <div className={styles.line}>
              <span className={styles.progressFill}>
                {'['}
                {'#'.repeat(filled)}
                {'-'.repeat(20 - filled)}
                {']'}
              </span>
              <span className={styles.progressLabel}> verifying credentials</span>
            </div>
          )}

          {granted && (
            <div className={`${styles.line} ${styles.loginGranted}`}>
              session granted — welcome, {DEMO_USERNAME}
            </div>
          )}
        </div>

        <div aria-hidden="true">&nbsp;</div>
        {error && (
          <div className={styles.loginError} role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        <div>
          <span className={styles.loginLabel} id="login-label">LOGIN: </span>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={handleEdit(setUsername)}
            onKeyDown={handleKeyDown}
            className={styles.loginInput}
            aria-labelledby="login-label"
            aria-required="true"
            autoFocus
            autoComplete="username"
          />
        </div>
        <div>
          <span className={styles.loginLabel} id="password-label">PASSWORD: </span>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={handleEdit(setPassword)}
            onKeyDown={handleKeyDown}
            className={styles.loginInput}
            aria-labelledby="password-label"
            aria-required="true"
            autoComplete="current-password"
          />
        </div>
      </form>
    </div>
  );
}

function useReducedMotion(): boolean {
  const motion = useSystemStore((s) => s.motion);
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (motion === 'on') return false;
  if (motion === 'off') return true;
  return osReduced;
}
