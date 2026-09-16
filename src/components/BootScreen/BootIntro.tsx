/**
 * Cinematic boot intro — renders the beat-driven cold-boot sequence.
 *
 * Each beat type maps to a distinct visual treatment:
 *   powerOn     → phosphor flash + POST line + progress bar
 *   whoami      → command typing with prompt
 *   identityCard → ASCII box-drawn card, line by line
 *   research    → command typing → spinner → output
 *   impact      → live countup number
 *   humanity    → typo + backspace + correction (no prompt)
 *   glitch      → corrupted overlay, self-healing
 *   signOff     → links, Bengali quote, welcome, cursor
 */

import { useEffect, useCallback, useState } from 'react';
import { BOOT_BEATS, GLITCH_LINES } from '../../lib/bootSequence';
import { soundEngine } from '../../lib/sound';
import { useSystemStore } from '../../store/useSystem';
import { useBootSequence } from '../../hooks/useBootSequence';
import styles from '../../styles/components/boot-screen.module.css';

interface BootIntroProps {
  onComplete: () => void;
}

export function BootIntro({ onComplete }: BootIntroProps) {
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const reducedMotion = useReducedMotion();
  const login = useSystemStore((s) => s.login);

  const { state, prompt } = useBootSequence(BOOT_BEATS, onComplete);

  // Play boot audio once on mount: CRT power-on hum, then chime after a beat
  useEffect(() => {
    if (soundEnabled) {
      soundEngine.crtPowerOn();
      const timer = setTimeout(() => soundEngine.bootChime(), 600);
      return () => clearTimeout(timer);
    }
  }, [soundEnabled]);

  // Skip on any keypress
  const handleKeyDown = useCallback(() => {
    if (!state.isDone) {
      login('nabil');
    }
  }, [state.isDone, login]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const {
    lines,
    typingText,
    typingVisibleChars,
    typingIsCommand,
    progressPercent,
    progressLabel,
    spinnerChar,
    countupDisplay,
    glitchActive,
    powerOnFlash,
    isDone,
    technoGlitchActive,
    screenTearActive,
    rgbSplitActive,
    scanlineIntensity,
    themeCycleActive,
  } = state;

  const containerClass = [
    styles.container,
    powerOnFlash && !reducedMotion ? styles.degauss : '',
    technoGlitchActive ? styles.technoGlitchContainer : '',
    themeCycleActive ? styles.themeCycleContainer : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClass}
      onClick={!isDone ? () => login('nabil') : undefined}
      role="presentation"
    >
      {/* Power-on phosphor flash overlay */}
      {powerOnFlash && !reducedMotion && (
        <div className={styles.flashOverlay} aria-hidden="true" />
      )}

      {/* Glitch overlay */}
      {glitchActive && (
        <div
          className={`${styles.glitchOverlay} ${!reducedMotion ? styles.glitchJitter : ''}`}
          aria-hidden="true"
        >
          {GLITCH_LINES.map((line, i) => (
            <div key={i} className={styles.glitchLine}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Techno glitch overlay — with scanlines, RGB split, screen tear, digital noise */}
      {technoGlitchActive && (
        <div
          className={`${styles.technoGlitchOverlay} ${!reducedMotion ? styles.technoGlitchJitter : ''}`}
          aria-hidden="true"
        >
          <div className={styles.scanlines} style={{ opacity: scanlineIntensity }} />
          {rgbSplitActive && <div className={styles.rgbSplit} />}
          {screenTearActive && <div className={styles.screenTear} />}
          <div className={styles.digitalNoise} />
        </div>
      )}

      {/* Theme cycling overlay — rapid color shifts */}
      {themeCycleActive && (
        <div className={styles.themeCycleOverlay} aria-hidden="true" />
      )}

      <div
        className={`${styles.content} ${glitchActive && !reducedMotion ? styles.glitchContent : ''} ${technoGlitchActive && !reducedMotion ? styles.technoGlitchContent : ''} ${themeCycleActive && !reducedMotion ? styles.themeCycleContent : ''}`}
        aria-label="Boot sequence typing intro"
      >
        {lines.map((line, i) => {
          const lineAnimClass = reducedMotion ? '' :
            line.kind === 'post' ? styles.lineScanIn :
            line.kind === 'command' ? styles.lineTypewriterIn :
            line.kind === 'output' ? styles.lineFadeUp :
            line.kind === 'ascii' ? styles.lineGlitchIn :
            line.kind === 'technoGlitch' ? styles.lineDigitalCorrupt :
            '';

          return (
            <div key={i} className={`${styles.line} ${lineAnimClass}`}>
              {line.kind === 'post' ? (
                <span className={styles.post}>{line.text}</span>
              ) : line.kind === 'command' ? (
                <span>
                  <span className={styles.prompt}>{prompt}</span>
                  {line.text}
                </span>
              ) : line.kind === 'ascii' ? (
                <span className={styles.ascii}>{line.text}</span>
              ) : line.kind === 'output' ? (
                <span>{line.text}</span>
              ) : line.kind === 'technoGlitch' ? (
                <span className={styles.technoGlitchLine}>{line.text}</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          );
        })}

        {/* Progress bar (powerOn beat) */}
        {progressPercent > 0 && progressPercent < 100 && (
          <div className={styles.line}>
            <span className={styles.progressFill}>
              {'['}
              {'#'.repeat(Math.floor(progressPercent / 5))}
              {'-'.repeat(20 - Math.floor(progressPercent / 5))}
              {']'} {progressPercent}%
            </span>
            <span className={styles.progressLabel}> {progressLabel}</span>
          </div>
        )}

        {/* Spinner (research beat) */}
        {spinnerChar && (
          <div className={styles.line}>
            <span className={styles.spinner}>{spinnerChar}</span>
          </div>
        )}

        {/* Countup display (impact beat) */}
        {countupDisplay && (
          <div className={styles.line}>
            <span className={styles.countup}>{countupDisplay}</span>
          </div>
        )}

        {/* Active typing line */}
        {typingText && !isDone && (
          <div className={styles.line}>
            {typingIsCommand ? (
              <span>
                <span className={styles.prompt}>{prompt}</span>
                {typingText.slice(0, typingVisibleChars)}
              </span>
            ) : (
              <span>{typingText.slice(0, typingVisibleChars)}</span>
            )}
            <span className={styles.cursor} aria-hidden="true">
              {'\u2588'}
            </span>
          </div>
        )}

        {/* Idle cursor when done */}
        {isDone && (
          <span className={styles.cursor} aria-hidden="true">
            {'\u2588'}
          </span>
        )}
      </div>

      {!isDone && (
        <>
          <div className={styles.hint}>Press any key or click to skip...</div>
          <button
            className={styles.skipButton}
            onClick={(e) => {
              e.stopPropagation();
              login('nabil');
            }}
            autoFocus
          >
            SKIP &gt;&gt;
          </button>
        </>
      )}
    </div>
  );
}

// ── Reduced motion hook ─────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
