/**
 * Beat model + factual content for the cinematic "NABIL/86 — COLD BOOT" sequence.
 *
 * Architecture: a discriminated union of beat types, played in order by
 * `useBootSequence`. Each beat has a `kind` that the driver switches on to
 * schedule its own timers and state transitions.
 */

// ── Beat types ──────────────────────────────────────────────────────────────

export type BootBeatKind =
  | 'powerOn'
  | 'whoami'
  | 'identityCard'
  | 'work'
  | 'research'
  | 'impact'
  | 'humanity'
  | 'glitch'
  | 'signOff';

export interface BootBeat {
  readonly kind: BootBeatKind;
}

// ── Content constants (factual — do NOT invent) ─────────────────────────────

export const POST_LINE =
  'NABIL/86 BIOS v2.4 \u00b7 CRAY X-MP/48 \u00b7 phosphor P1';

export const PROGRESS_MODULES: readonly string[] = [
  'mounting /home/ann',
  'loading bangla-font',
  'narrative-engine',
  'beni-corpus',
  'llm-agents',
  'css-renderer',
];

export const WHOAMI_NAME = 'Ann Naser Nabil';

export const IDENTITY_CARD: readonly string[] = [
  '+-----------------------------------+',
  '|  Ann Naser Nabil                  |',
  '|  NLP Researcher & AI Engineer     |',
  '|  Dhaka, Bangladesh                |',
  '|  Jahangirnagar University         |',
  '|  BSc Economics \u00b7 MSc Economics    |',
  '+-----------------------------------+',
];

export const RESEARCH_AREAS: readonly string[] = [
  '\u2022 Low-Resource Bangla NLP',
  '\u2022 Multilingual LLMs',
  '\u2022 Computational Social Science',
  '\u2022 Economic Narrative Analysis',
];

export const BENI_COUNTUP_TARGET = 1_470_000;
export const BENI_DISPLAY = '1.47M+';
export const BANGALA_CORPUS = '10-language Global corpus';

export const HUMANITY_WRONG = 'Ann Naser Nabli';
export const HUMANITY_CORRECTION = 'bil';

export const GLITCH_LINES: readonly string[] = [
  '### SIGNAL LOST ###',
  '### RECONNECTING... ###',
];

export const LINKS_LINE =
  'github.com/nabil0x \u00b7 nabil.iam.bd \u00b7 ORCID 0009-0006-3561-045X';

export const WORK_HEADING = 'Work & Passion:';

export const WORK_ROLES: readonly string[] = [
  '\u2022 Maintainer @ LILA LAB',
  '\u2022 System Architect @ Doshomik IELTS',
  '\u2022 AI Engineer @ B2G Soft',
  '\u2022 Research Operation Lead @ Research Den',
];

export const WELCOME_MSG = 'System ready. Welcome, Ann.';

// ── Ordered beat sequence ───────────────────────────────────────────────────

export const BOOT_BEATS: readonly BootBeat[] = [
  { kind: 'powerOn' },
  { kind: 'whoami' },
  { kind: 'identityCard' },
  { kind: 'work' },
  { kind: 'research' },
  { kind: 'impact' },
  { kind: 'humanity' },
  { kind: 'glitch' },
  { kind: 'signOff' },
];
