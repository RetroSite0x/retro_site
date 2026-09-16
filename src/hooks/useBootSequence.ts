/**
 * Beat-driven boot sequence driver.
 *
 * Converts a list of `BootBeat`s into a stream of render-state updates. Each
 * beat schedules its own timers and advances to the next beat when done.
 *
 * SAFETY: The main `useEffect` depends only on `generation` (a counter that
 * increments when advancing beats). It NEVER depends on the render state it
 * sets — avoiding the infinite-loop bug from the previous implementation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { BootBeat } from '../lib/bootSequence';
import {
  POST_LINE,
  PROGRESS_MODULES,
  WHOAMI_NAME,
  IDENTITY_CARD,
  RESEARCH_AREAS,
  BENI_COUNTUP_TARGET,
  BENI_DISPLAY,
  BANGALA_CORPUS,
  HUMANITY_WRONG,
  LINKS_LINE,
  WORK_HEADING,
  WORK_ROLES,
  WELCOME_MSG,
  TECHNO_GLITCH_LINES,
} from '../lib/bootSequence';
import { soundEngine } from '../lib/sound';
import { useSystemStore } from '../store/useSystem';

// ── Render state ────────────────────────────────────────────────────────────

export interface CompletedLine {
  readonly text: string;
  readonly kind: 'post' | 'command' | 'output' | 'blank' | 'ascii' | 'technoGlitch';
}

export interface BootRenderState {
  lines: CompletedLine[];
  typingText: string | null;
  typingVisibleChars: number;
  typingIsCommand: boolean;
  progressPercent: number;
  progressLabel: string;
  spinnerChar: string | null;
  countupDisplay: string | null;
  glitchActive: boolean;
  powerOnFlash: boolean;
  isDone: boolean;
  technoGlitchActive: boolean;
  screenTearActive: boolean;
  rgbSplitActive: boolean;
  scanlineIntensity: number;
  themeCycleActive: boolean;
}

const INITIAL_STATE: BootRenderState = {
  lines: [],
  typingText: null,
  typingVisibleChars: 0,
  typingIsCommand: false,
  progressPercent: 0,
  progressLabel: '',
  spinnerChar: null,
  countupDisplay: null,
  glitchActive: false,
  powerOnFlash: false,
  isDone: false,
  technoGlitchActive: false,
  screenTearActive: false,
  rgbSplitActive: false,
  scanlineIntensity: 0,
  themeCycleActive: false,
};

// ── Constants ───────────────────────────────────────────────────────────────

const UNSCALED_SEQUENCE_MS = 16_000;
const BOOT_PACE_MULTIPLIER = 1.5;
const MAX_DURATION_MS = Math.round(UNSCALED_SEQUENCE_MS * BOOT_PACE_MULTIPLIER) + 15_000;
const PROMPT = 'nabil@retro:~$ ';

// ── Timer tracking ──────────────────────────────────────────────────────────

function useTimerList() {
  const timers = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, delay: number): number => {
    const id = window.setTimeout(fn, delay * BOOT_PACE_MULTIPLIER);
    timers.current.push(id);
    return id;
  }, []);

  const scheduleInterval = useCallback((fn: () => void, ms: number): number => {
    const id = window.setInterval(fn, ms * BOOT_PACE_MULTIPLIER);
    timers.current.push(id);
    return id;
  }, []);

  const clearAll = useCallback(() => {
    for (const id of timers.current) {
      window.clearTimeout(id);
      window.clearInterval(id);
    }
    timers.current = [];
  }, []);

  return { schedule, scheduleInterval, clearAll };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function soundEnabled(): boolean {
  return useSystemStore.getState().soundEnabled && soundEngine.isUnlocked();
}

// ── Skip helper: flatten all beats to completed lines ───────────────────────

function flattenBeats(beats: readonly BootBeat[]): CompletedLine[] {
  const lines: CompletedLine[] = [];
  for (const beat of beats) {
    switch (beat.kind) {
      case 'powerOn':
        lines.push({ text: POST_LINE, kind: 'post' });
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'whoami':
        lines.push({ text: 'whoami', kind: 'command' });
        lines.push({ text: WHOAMI_NAME, kind: 'output' });
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'identityCard':
        for (const l of IDENTITY_CARD) {
          lines.push({ text: l, kind: 'ascii' });
        }
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'work':
        lines.push({ text: WORK_HEADING, kind: 'output' });
        for (const role of WORK_ROLES) {
          lines.push({ text: role, kind: 'output' });
        }
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'research':
        lines.push({ text: './research --list', kind: 'command' });
        for (const a of RESEARCH_AREAS) {
          lines.push({ text: a, kind: 'output' });
        }
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'impact':
        lines.push({
          text: `BENI corpus loaded: ${BENI_DISPLAY} Bangla news articles`,
          kind: 'output',
        });
        lines.push({ text: BANGALA_CORPUS, kind: 'output' });
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'humanity':
        lines.push({ text: WHOAMI_NAME, kind: 'output' });
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'glitch':
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'technoGlitch':
        for (const l of TECHNO_GLITCH_LINES) {
          lines.push({ text: l, kind: 'technoGlitch' });
        }
        lines.push({ text: '', kind: 'blank' });
        break;
      case 'signOff':
        lines.push({ text: LINKS_LINE, kind: 'output' });
        lines.push({ text: '', kind: 'blank' });
        lines.push({ text: './welcome.sh', kind: 'command' });
        lines.push({ text: WELCOME_MSG, kind: 'output' });
        break;
    }
  }
  return lines;
}

// ── Public hook ─────────────────────────────────────────────────────────────

export interface UseBootSequenceResult {
  state: BootRenderState;
  skip: () => void;
  prompt: string;
}

export function useBootSequence(
  beats: readonly BootBeat[],
  onComplete: () => void,
  enabled = true,
): UseBootSequenceResult {
  const [state, setState] = useState<BootRenderState>(INITIAL_STATE);
  const [generation, setGeneration] = useState(0);

  const beatIdx = useRef(0);
  const { schedule, scheduleInterval, clearAll } = useTimerList();
  const skipRequested = useRef(false);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // ── Helpers that mutate refs + render state ────────────────────────────

  const addLine = useCallback((text: string, kind: CompletedLine['kind']) => {
    setState((prev) => ({
      ...prev,
      lines: [...prev.lines, { text, kind }],
    }));
  }, []);

  const advanceBeat = useCallback(() => {
    beatIdx.current++;
    setState((prev) => ({
      ...prev,
      typingText: null,
      typingVisibleChars: 0,
      typingIsCommand: false,
      progressPercent: 0,
      progressLabel: '',
      spinnerChar: null,
      countupDisplay: null,
      glitchActive: false,
      powerOnFlash: false,
      technoGlitchActive: false,
      screenTearActive: false,
      rgbSplitActive: false,
      scanlineIntensity: 0,
      themeCycleActive: false,
    }));
    setGeneration((g) => g + 1);
  }, []);

  const markComplete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    clearAll();
    setState((prev) => ({
      ...prev,
      isDone: true,
      typingText: null,
      typingVisibleChars: 0,
      glitchActive: false,
      powerOnFlash: false,
    }));
    schedule(() => onCompleteRef.current(), 600);
  }, [clearAll, schedule]);

  // ── Skip ──────────────────────────────────────────────────────────────

  const skip = useCallback(() => {
    if (skipRequested.current || completed.current) return;
    skipRequested.current = true;
    clearAll();

    const remaining = beats.slice(beatIdx.current);
    const skipLines = flattenBeats(remaining);

    setState((prev) => ({
      ...prev,
      lines: [...prev.lines, ...skipLines],
      typingText: null,
      typingVisibleChars: 0,
      typingIsCommand: false,
      progressPercent: 0,
      progressLabel: '',
      spinnerChar: null,
      countupDisplay: null,
      glitchActive: false,
      powerOnFlash: false,
      isDone: true,
    }));

    schedule(() => onCompleteRef.current(), 150);
  }, [beats, clearAll, schedule]);

  // ── Main beat engine ──────────────────────────────────────────────────
  // Depends ONLY on `generation`. Each beat advances beatIdx.current and
  // increments generation when done — triggering exactly one re-run.

  useEffect(() => {
    if (!enabled) return;
    if (completed.current || skipRequested.current) return;

    // Clear timers from the previous beat
    clearAll();

    const beat = beats[beatIdx.current];
    if (!beat) {
      markComplete();
      return;
    }

    switch (beat.kind) {
      // ─── BEAT 1: Power-on flash + POST + progress bar ───────────────
      case 'powerOn': {
        setState((prev) => ({ ...prev, powerOnFlash: true }));
        if (soundEnabled()) soundEngine.bootChirp();

        schedule(() => {
          setState((prev) => ({ ...prev, powerOnFlash: false }));
          addLine(POST_LINE, 'post');

          let moduleIndex = 0;
          let progress = 0;
          const pInterval = scheduleInterval(() => {
            progress += 4;
            const idx = Math.min(
              Math.floor((progress / 100) * PROGRESS_MODULES.length),
              PROGRESS_MODULES.length - 1,
            );
            if (idx !== moduleIndex) {
              moduleIndex = idx;
              if (soundEnabled()) soundEngine.diskSeek();
            }
            setState((prev) => ({
              ...prev,
              progressPercent: Math.min(progress, 100),
              progressLabel: PROGRESS_MODULES[idx] ?? '',
            }));
            if (progress >= 100) {
              window.clearInterval(pInterval);
              schedule(() => advanceBeat(), 150);
            }
          }, 70);
        }, 100);

        break;
      }

      // ─── BEAT 2: whoami → Ann Naser Nabil ───────────────────────────
      case 'whoami': {
        const cmd = 'whoami';
        setState((prev) => ({
          ...prev,
          typingText: cmd,
          typingVisibleChars: 0,
          typingIsCommand: true,
        }));
        let ci = 0;
        const tInterval = scheduleInterval(() => {
          ci++;
          if (soundEnabled()) soundEngine.keyClick();
          setState((prev) => ({ ...prev, typingVisibleChars: ci }));
          if (ci >= cmd.length) {
            window.clearInterval(tInterval);
            schedule(() => {
              addLine(cmd, 'command');
              setState((prev) => ({
                ...prev,
                typingText: null,
                typingVisibleChars: 0,
              }));
              schedule(() => {
                addLine(WHOAMI_NAME, 'output');
                if (soundEnabled()) soundEngine.navBlip();
                schedule(() => advanceBeat(), 200);
              }, 150);
            }, 100);
          }
        }, 35);

        break;
      }

      // ─── BEAT 3: ASCII identity card, line by line ──────────────────
      case 'identityCard': {
        let li = 0;
        const showNext = () => {
          if (li >= IDENTITY_CARD.length) {
            if (soundEnabled()) soundEngine.successChime();
            schedule(() => advanceBeat(), 200);
            return;
          }
          addLine(IDENTITY_CARD[li], 'ascii');
          if (soundEnabled()) soundEngine.dataTick();
          li++;
          schedule(showNext, 120);
        };
        schedule(showNext, 100);

        break;
      }

      case 'work': {
        addLine(WORK_HEADING, 'output');
        if (soundEnabled()) soundEngine.navBlip();
        let ri = 0;
        const showNextRole = () => {
          if (ri >= WORK_ROLES.length) {
            schedule(() => advanceBeat(), 200);
            return;
          }
          addLine(WORK_ROLES[ri], 'output');
          if (soundEnabled()) soundEngine.dataTick();
          ri++;
          schedule(showNextRole, 130);
        };
        schedule(showNextRole, 130);

        break;
      }

      // ─── BEAT 4: ./research --list → spinner → areas ───────────────
      case 'research': {
        const cmd = './research --list';
        setState((prev) => ({
          ...prev,
          typingText: cmd,
          typingVisibleChars: 0,
          typingIsCommand: true,
        }));
        let ci = 0;
        const tInterval = scheduleInterval(() => {
          ci++;
          if (soundEnabled()) soundEngine.keyClick();
          setState((prev) => ({ ...prev, typingVisibleChars: ci }));
          if (ci >= cmd.length) {
            window.clearInterval(tInterval);
            schedule(() => {
              addLine(cmd, 'command');
              setState((prev) => ({
                ...prev,
                typingText: null,
                typingVisibleChars: 0,
              }));

              const spinChars = ['|', '/', '-', '\\'];
              let si = 0;
              setState((prev) => ({ ...prev, spinnerChar: spinChars[0] }));
              if (soundEnabled()) soundEngine.diskSeek();
              const sInterval = scheduleInterval(() => {
                si = (si + 1) % spinChars.length;
                setState((prev) => ({ ...prev, spinnerChar: spinChars[si] }));
              }, 120);

              schedule(() => {
                window.clearInterval(sInterval);
                setState((prev) => ({ ...prev, spinnerChar: null }));
                for (const area of RESEARCH_AREAS) {
                  addLine(area, 'output');
                }
                if (soundEnabled()) soundEngine.navBlip();
                schedule(() => advanceBeat(), 200);
              }, 800);
            }, 100);
          }
        }, 30);

        break;
      }

      // ─── BEAT 5: BENI countup ──────────────────────────────────────
      case 'impact': {
        const target = BENI_COUNTUP_TARGET;
        const steps = 30;
        const stepMs = 1000 / steps;
        let step = 0;

        setState((prev) => ({ ...prev, countupDisplay: 'BENI corpus: 0' }));

        const cInterval = scheduleInterval(() => {
          step++;
          const progress = Math.min(step / steps, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          const display =
            current >= target
              ? `BENI corpus loaded: ${BENI_DISPLAY} Bangla news articles`
              : `BENI corpus: ${current.toLocaleString()}`;
          setState((prev) => ({ ...prev, countupDisplay: display }));
          if (soundEnabled() && step % 3 === 0) soundEngine.dataTick();

          if (step >= steps) {
            window.clearInterval(cInterval);
            schedule(() => {
              addLine(
                `BENI corpus loaded: ${BENI_DISPLAY} Bangla news articles`,
                'output',
              );
              setState((prev) => ({ ...prev, countupDisplay: null }));
              if (soundEnabled()) soundEngine.successChime();
              schedule(() => {
                addLine(BANGALA_CORPUS, 'output');
                schedule(() => advanceBeat(), 200);
              }, 200);
            }, 350);
          }
        }, stepMs);

        break;
      }

      // ─── BEAT 6: Humanity — typo + backspace + correction ───────────
      case 'humanity': {
        const wrong = HUMANITY_WRONG;
        setState((prev) => ({
          ...prev,
          typingText: wrong,
          typingVisibleChars: 0,
          typingIsCommand: false,
        }));
        let ci = 0;
        const tInterval = scheduleInterval(() => {
          ci++;
          if (soundEnabled()) soundEngine.keyClick();
          setState((prev) => ({ ...prev, typingVisibleChars: ci }));
          if (ci >= wrong.length) {
            window.clearInterval(tInterval);

            schedule(() => {
              let backIdx = wrong.length;
              const bInterval = scheduleInterval(() => {
                backIdx--;
                if (soundEnabled()) soundEngine.keyClick();
                setState((prev) => ({ ...prev, typingVisibleChars: backIdx }));
                if (backIdx <= wrong.length - 3) {
                  window.clearInterval(bInterval);

                  const correct = WHOAMI_NAME;
                  setState((prev) => ({
                    ...prev,
                    typingText: correct,
                  }));
                  let corrIdx = wrong.length - 3;
                  const rInterval = scheduleInterval(() => {
                    corrIdx++;
                    if (soundEnabled()) soundEngine.keyClick();
                    setState((prev) => ({
                      ...prev,
                      typingVisibleChars: corrIdx,
                    }));
                    if (corrIdx >= correct.length) {
                      window.clearInterval(rInterval);
                      schedule(() => {
                        addLine(correct, 'output');
                        setState((prev) => ({
                          ...prev,
                          typingText: null,
                          typingVisibleChars: 0,
                        }));
                        if (soundEnabled()) soundEngine.navBlip();
                        schedule(() => advanceBeat(), 200);
                      }, 200);
                    }
                  }, 40);
                }
              }, 50);
            }, 400);
          }
        }, 35);

        break;
      }

      // ─── BEAT 7: Self-healing glitch ────────────────────────────────
      case 'glitch': {
        setState((prev) => ({
          ...prev,
          glitchActive: true,
        }));
        if (soundEnabled()) soundEngine.errorBuzz();

        schedule(() => {
          setState((prev) => ({ ...prev, glitchActive: false }));
          if (soundEnabled()) soundEngine.bootChirp();
          schedule(() => advanceBeat(), 300);
        }, 900);

        break;
      }

      case 'technoGlitch': {
        // Phase 1: Digital interference + theme cycling
        setState((prev) => ({
          ...prev,
          technoGlitchActive: true,
          rgbSplitActive: true,
          screenTearActive: true,
          scanlineIntensity: 0.8,
          themeCycleActive: true,
        }));
        if (soundEnabled()) soundEngine.technoGlitchSound();

        // Show glitch lines one by one with rapid theme cycling
        let gi = 0;
        const showGlitch = () => {
          if (gi >= TECHNO_GLITCH_LINES.length) {
            // Phase 2: Screen tear burst + theme settling
            schedule(() => {
              setState((prev) => ({
                ...prev,
                screenTearActive: true,
              }));

              // Phase 3: Recovery — stop theme cycling, settle
              schedule(() => {
                setState((prev) => ({
                  ...prev,
                  technoGlitchActive: false,
                  rgbSplitActive: false,
                  screenTearActive: false,
                  scanlineIntensity: 0,
                  themeCycleActive: false,
                }));
                if (soundEnabled()) soundEngine.bootChirp();
                schedule(() => advanceBeat(), 200);
              }, 400);
            }, 300);
            return;
          }
          addLine(TECHNO_GLITCH_LINES[gi], 'technoGlitch');
          gi++;
          schedule(showGlitch, 120);
        };
        showGlitch();

        break;
      }

      case 'signOff': {
        addLine(LINKS_LINE, 'output');
        if (soundEnabled()) soundEngine.navBlip();

        schedule(() => {
          schedule(() => {
            const cmd = './welcome.sh';
            setState((prev) => ({
              ...prev,
              typingText: cmd,
              typingVisibleChars: 0,
              typingIsCommand: true,
            }));
            let ci = 0;
            const tInterval = scheduleInterval(() => {
              ci++;
              if (soundEnabled()) soundEngine.keyClick();
              setState((prev) => ({ ...prev, typingVisibleChars: ci }));
              if (ci >= cmd.length) {
                window.clearInterval(tInterval);
                schedule(() => {
                  addLine(cmd, 'command');
                  setState((prev) => ({
                    ...prev,
                    typingText: null,
                    typingVisibleChars: 0,
                  }));
                  schedule(() => {
                    addLine(WELCOME_MSG, 'output');
                    if (soundEnabled()) soundEngine.successChime();
                    schedule(() => markComplete(), 600);
                  }, 200);
                }, 100);
              }
            }, 30);
          }, 200);
        }, 200);

        break;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation, enabled]);

  // ── Watchdog: never trap the user ─────────────────────────────────────

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      if (!completed.current && !skipRequested.current) {
        skip();
      }
    }, MAX_DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { state, skip, prompt: PROMPT };
}
