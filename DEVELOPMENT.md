# Development Guide — Retro UNIX "Web OS" Portfolio

> **Project:** Ann Naser Nabil — retro UNIX web OS portfolio
> **Stack:** React 18 · TypeScript · Vite 5 · Zustand 4 · CSS Modules · Vitest · Playwright
> **Repo:** `/mnt/work/retro_site` · **Deploy:** GitHub Pages (`base: /retro_site/`)
> **Created:** September 2026
> **Status:** Living document — update checkboxes/status as items ship.

This document consolidates **all research, audits, defects, and the implementation roadmap** so future work can proceed without re-discovering context. It is the single source of truth for *what to change and why*.

---

## 0. How to use this document

**Status legend (used in the backlog and roadmap):**

| Tag | Meaning |
|---|---|
| `TODO` | Not started |
| `WIP` | In progress |
| `DONE` | Shipped and verified |
| `WONTFIX` | Deliberately declined (record reason) |

**Workflow for any backlog item:**

1. Read the item's **Problem / Evidence / Fix / Acceptance** fields.
2. Locate the referenced file(s); read before editing.
3. Implement the minimal change that satisfies **Acceptance** (do not expand scope).
4. Verify per §11 (diagnostics, tests, build).
5. Update the item status here in the same commit.

**Companion artifacts:**

- `RESEARCH-UX-SEO-A11Y-FINDINGS.md` — extended evidence + source links for §5.6–5.9 (keep as the detailed appendix; do not duplicate claims here without updating both).
- `TODO.md` — original informal wishlist (superseded by §9, but kept for history; reconcile or retire).

---

## 1. Project Overview

A portfolio for **Ann Naser Nabil** presented as a simulated retro UNIX workstation: boot BIOS → kernel boot → login → desktop with draggable/resizable windows, a filesystem, a terminal with ~38 commands, CRT effects, chiptune audio, and four phosphor themes.

**Canonical identity (must be used consistently everywhere):**

- **Name:** Ann Naser Nabil
- **Location:** Dhaka, Bangladesh
- **Roles (pick ONE canonical string — see defect FND-06):** `AI Engineer · Applied Data Scientist · NLP Researcher`
- **Email:** ann.n.nabil@gmail.com
- **Links:** GitHub `AnnNaserNabil`, LinkedIn `ann-naser-nabil`, website `nabil.iam.bd`, academic `Ann-Naser-Nabil.github.io`, Twitter/X `@ann_naser`, HuggingFace `AnnNaserNabil`, arXiv author search
- **Education:** MS Economics, Jahangirnagar University (2024–2025); BS Economics, JU (2018–2024)
- **Current role:** Automation Operation Specialist @ Khub Soja (Oct 2024–present)
- **Research:** Bangla NLP, economic narrative analysis (BENI), computational social science

**Scripts (`package.json`):**

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest run |
| `npm run test:watch` | Vitest watch |
| `npm run test:coverage` | Vitest coverage |
| `npm run test:e2e` | Playwright (`playwright.config.ts`) |

---

## 2. Architecture Map

### 2.1 Directory structure

```
src/
├── App.tsx                 # Boot-phase routing + global effects
├── main.tsx               # React root
├── components/
│   ├── BootScreen/         # BootScreen, BiosOutput, LoginPrompt
│   ├── Desktop/            # Desktop, IconGrid, DesktopIcon, MenuBar, DirectoryViewer
│   ├── WindowManager/      # WindowManager, Window, TitleBar, ResizeHandle
│   ├── Terminal/           # Terminal, TerminalInput, CommandOutput, CommandParser,
│   │                       #   CommandRegistry, commands/ (38 × cmd_*.ts + index.ts)
│   ├── FileManager/        # FileManager
│   ├── FileRenderers/      # Text/Config/Markdown/Image/File viewers
│   ├── WebBrowser/         # BrowserViewer
│   └── Effects/            # CRTOverlay, SoundEngine
├── store/                  # Zustand: useSystem, useTerminal, useVFS, useWindows, vfs-tree
├── lib/                    # vfs, windowManager, bootSequence, sound, storage
├── hooks/                  # useBootSequence, useDrag, useResize, useKeyboard, useTheme
├── types/                  # system, terminal, vfs, window
└── styles/                 # global.css, variables.css, themes/*, components/*.module.css
tests/{unit,integration,e2e}/
```

### 2.2 Boot flow

`BootPhase = 'bios' | 'login' | 'desktop'` (`src/types/system.ts`).

- `useSystemStore` holds `bootPhase`; `App.tsx` renders `BootScreen` for `bios|login` and `Desktop` when `bootPhase === 'desktop' && isLoggedIn`.
- `BootScreen` dispatches: `bios → TypingIntro` (types Ann's info character-by-character), `login → LoginPrompt`; completion calls `advanceBoot()`.
- Phases advance `bios → login → desktop` (`PHASE_ORDER`); `LoginPrompt` calls `login()` which sets `desktop` directly.
- The old fake-hardware animation (`BIOS_STEPS`/`BOOT_STEPS`, `BiosOutput`, `useBootSequence`) was removed and replaced by the typing intro — see §2.8.

### 2.3 State stores (Zustand)

| Store | Responsibility | Persistence |
|---|---|---|
| `store/useSystem.ts` | boot phase, login, theme, sound, CRT flicker, volume, username | `persist` → localStorage (`nabilos-system`); partialize keeps theme/sound/flicker/volume |
| `store/useWindows.ts` | window list, z-order, focus, min/max/move/resize, cascade | `persist` |
| `store/useTerminal.ts` | terminal lines/history/cwd | in-memory |
| `store/useVFS.ts` | VFS navigation, readFile, search, addNode | in-memory (built from `vfs-tree.ts`) |
| `store/vfs-tree.ts` | static filesystem content (805 lines) | source constant |

### 2.4 Window system

- **Content types** (`types/window.ts`): `terminal`, `directoryViewer`, `fileViewer`, `imageViewer`, `browser`, `fileManager`, `dashboard`, `memoire`.
- `Window.tsx` routes content via a `switch`; sets inline `zIndex`.
- Interactions wired: open/close/focus/minimize/maximize+restore/drag/8-way resize/cascade; maximized windows reflow on browser resize; taskbar restore.
- Not wired: snapping/tiling, close animation.
- Desktop icons open on pointerup without movement; a 350ms debounce prevents a double-click from opening duplicate windows.

### 2.5 VFS + terminal

- `lib/vfs.ts`: `splitPath`, `normalizePath` (handles `~`, `.`, `..`), `getParentPath`.
- Commands registered via `commands/index.ts` → `registerAllCommands()`; `CommandRegistry.ts` executes + holds easter eggs (`whoami`, `uname -a`, `exit`, `reboot`, `sudo`).
- `CommandParser.ts` handles parsing + fuzzy matching.
- Commands are ~38 `cmd_*.ts` modules. Portfolio content currently hardcoded in most; only `resume` reads VFS.

### 2.6 Theming

- `useTheme()` sets `document.documentElement.dataset.theme`.
- Variables in `styles/variables.css` (`:root` defaults = green) + per-theme files `styles/themes/{green,amber,white,blue}.css`, each defining ~10 vars (`--phosphor`, `--phosphor-dim`, `--phosphor-bg`, `--phosphor-glow`, `--phosphor-scanline`, `--window-title-bg`, `--window-border`, `--menu-bar-bg`, `--text-cursor`, `--phosphor-glow-strong`).

### 2.7 Effects

- `CRTOverlay.tsx`: 5 CSS layers (scanlines, refresh sweep, vignette, phosphor glow, flicker), `pointer-events:none`, `z-index:99999`, respects `prefers-reduced-motion`.
- `lib/sound.ts`: WebAudio synth — `bootChirp`, `keyClick`, `diskSeek`, `windowOpen`, `windowClose`, `errorBuzz`, `bootSequence`; all output gains scaled by `volume`.
- `SoundEngine.tsx`: volume sync + first-gesture audio unlock + window open/close deltas; boot/typing sounds are driven by `TypingIntro`; gate on `soundEnabled`.
- Audio starts only after a user gesture (`soundEngine.unlock()`); before that, sound calls are no-ops, avoiding browser autoplay warnings.

### 2.8 Boot intro (cinematic "NABIL/86 — COLD BOOT")

- `src/lib/bootSequence.ts` — a discriminated-union **beat model** (`BOOT_BEATS`) plus factual content constants (name, identity card, research areas, BENI, stack, **work roles**, links, welcome). Beats: `powerOn` (POST + progress bar), `whoami`, `identityCard`, `work` (Work & Passion roles), `research` (spinner), `impact` (BENI count-up), `humanity` (typo + backspace), `glitch` (self-healing), `signOff`.
- `src/hooks/useBootSequence.ts` — beat-driven driver. The main effect depends **only on a `generation` counter** (never on the state it sets), eliminating infinite-loop risk. Each beat schedules its own timers; `skip()` flattens remaining beats; a **15s watchdog** force-completes; `flattenBeats` keeps skip output consistent.
- `src/components/BootScreen/BootIntro.tsx` — renders committed lines, active typing, progress bar, spinner, count-up, glitch overlay, power-on flash. Decorative animations are suppressed under `prefers-reduced-motion: reduce`, but the sequence always progresses; `SKIP >>` is always available.
- Pseudo-graphics use **ASCII-only glyphs** (`+ - | # -`) because VT323 lacks box-drawing/block glyphs and fallback fonts break alignment. The POST line uses the `post` line kind and renders without the shell prompt.
- **Regression fixed (earlier version):** a reduced-motion branch called `setState` inside a state-keyed effect, causing an infinite render loop that trapped reduced-motion users on the intro with no SKIP.

### 2.9 Memoire board (Supabase-backed bulletin board)

A public bulletin board where visitors can pin messages. Runs in a draggable/resizable window, accessible from the terminal (`memoire` command) and a desktop icon.

| File | Role |
|---|---|
| `src/types/memoire.ts` | `MemoirePost`, `MemoireMode`, constants (`MAX_HANDLE`, `MAX_MESSAGE`, `MIN_INTERVAL_MS`) |
| `src/lib/memoire.ts` | `listPosts()`, `createPost()`, `getMemoireMode()`, `validateHandle`, `validateMessage`, `MemoireError` |
| `src/components/Memoire/MemoireBoard.tsx` | React component (fetches & renders posts, handles create form) |
| `src/styles/components/memoire.module.css` | Component styles |
| `src/components/Terminal/commands/cmd_memoire.ts` | Terminal command + `openMemoire()` helper |

**Supabase table:** `memoire` (columns: `id`, `handle`, `message`, `created_at`).
**Migration:** `supabase/migrations/0001_memoire.sql` (create table + RLS insert-only for anon).

**Env vars (required for remote mode):**

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

**Local dev:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` (gitignored). Without these, the board falls back to localStorage with seed posts.

**GitHub Pages deployment:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository **variables** (Settings → Secrets and variables → Actions → Variables). The deploy workflow passes them to `npm run build` as env vars.

**Security model:** Supabase anon key only + RLS policies (insert-only for anon role, no update/delete). Rate-limited client-side (`MEMOIRE_MIN_INTERVAL_MS = 20s`). The board degrades to localStorage when offline or env vars are missing.

---

## 3. Known Defects & Safety Issues (fix first)

| ID | Severity | Defect | Evidence | Fix |
|---|---|---|---|---|
| **FND-01** | 🔴 Safety | CRT flicker runs at ~6.7 Hz (0.15s cycle) — exceeds WCAG 2.3.1 three-flash threshold; seizure risk | `styles/variables.css` `--crt-flicker-speed: 0.15s`; flicker layer in `CRTOverlay.tsx:~81` | Raise cycle to ≥0.33s (≤3 Hz) and/or reduce amplitude below threshold |
| **FND-02** | ✅ Done | `boot` phase was unreachable (`advanceBoot()` jumped `bios → login`) | `store/useSystem.ts` vs `types/system.ts` | **Superseded:** `boot` phase removed; fake BIOS/kernel animation replaced by the typing intro (`bios → login → desktop`). See §2.8. |
| **FND-03** | 🟠 UX | `Escape` unconditionally closes the focused window, even when a menu is open or an input has focus; conflicts with MenuBar's own Escape handler | `hooks/useKeyboard.ts:46-51`; `MenuBar.tsx:72-79` | Guard: only close if no menu open, no modal, and not editing terminal input; consume+stop when menu handles it |
| **FND-04** | 🟠 UX | Escape in terminal closes the window instead of clearing input | same as FND-03 | Same guard; prefer clearing terminal input first |
| **FND-05** | 🟡 Hygiene | `help` lists only ~22 of 38 commands (missing all portfolio + many system/fun commands) | `commands/cmd_help.ts` literal list | Generate from registry's registered command metadata |
| **FND-06** | 🟡 Consistency | Role/identity strings differ across commands | `cmd_about` "AI Engineer \| Applied Data Scientist \| Researcher"; `cmd_sysinfo` "Developer, Economist, Researcher"; `skills` omits Rust/TypeScript that `sysinfo` claims | Introduce canonical `src/data/portfolio.ts` (CON-01); reference everywhere |
| **FND-07** | 🟡 Hygiene | Dead code: `lib/windowManager.ts` (75 lines, zero imports), `isClosing`/`setWindowClosing`, `keyClick()`, `errorBuzz()`, `volume`/`setVolume`, `.windowFocused` z-index | audit §7.3 | Delete or wire up (see FX-01, TERM-04, WM-02) |
| **FND-08** | 🟡 UX | Maximized window doesn't re-track browser resize | `store/useWindows.ts:136-137` reads `innerWidth/Height` once | Add resize listener; recompute maximized rects |
| **FND-09** | 🟡 UX | Theme flash on first load (persisted theme rehydrates after first paint); no transition | `useTheme.ts` effect after render; Zustand async rehydrate | Inline pre-hydration script in `index.html` sets `data-theme` from localStorage before paint; optional 0.3s transition |
| **FND-10** | 🟢 Hygiene | `CRTOverlay` re-injects `<style>` keyframes every render | `CRTOverlay.tsx:~93-111` | Move keyframes to a CSS module/global stylesheet |
| **FND-11** | 🟢 Hygiene | `.windowFocused { z-index:100 }` dead — overridden by inline style | `styles/components/window.module.css:17` | Remove rule or drop inline z-index (pick one) |

---

## 4. Benchmark Research — Retro OS Portfolios

### 4.1 Notable examples

| # | Site | URL / Repo | Standout | Copy this |
|---|---|---|---|---|
| 1 | **daedalOS** (13k★) | dustinbrett.com · github.com/DustinBrett/daedalOS | Full FS, IndexedDB, Web Worker clock, animated wallpapers, Winamp | Session persistence; one deep "hero" feature |
| 2 | **Windows 98 Web Edition** | azayrahmad.github.io/win98-web | DOS games via Emscripten, AI Clippy, mount real folders as drives | Utility bridge (mount real content) + playful assistant |
| 3 | **rahul.io** (147★) | rahul.io | Win98 portfolio, Wolf3D, ClippyJS | Long-lived personal OS site pattern |
| 4 | **PortfolioXP** | awwwards.com/sites/portfoliopxp | Awwwards Honorable Mention (Apr 2025) | Retro OS can win design awards |
| 5 | **macOS-Web-Simulator** | github.com/LikhithSP/... | Boot → lock → desktop, dock magnification, auto-lock | Boot→lock→desktop flow; auto-lock realism |
| 6 | **Windows 93** | windows93.net | Surreal parody, dense Easter eggs, viral press | Personality + absurd easter-egg density |
| 7 | **Poolsuite** (Awwwards SOTD) | poolsuite.net | Classic Mac UI, **mobile = Nokia 3310**, brand extension | Different device metaphor per form factor; world-building |
| 8 | **neal.fun** | neal.fun | 30+ self-contained interactive experiences | Coherent body of work; curiosity-driven exploration |
| 9 | **satnaing terminal-portfolio** (808★) | terminal.satnaing.dev | 6 themes, Tab autocomplete, history, PWA, Vitest | Terminal UX baseline; theme variety; tests |
| 10 | **CRT Terminal Portfolio** | github.com/atmozki/CRT-terminal-portfolio | "Classified personnel file" framing; hidden commands | Narrative framing; unlisted-command rewards |
| 11 | **Retro TUI Portfolio** | astro.build/themes/details/retro-tui-portfolio | **Dual mode CLI + GUI dashboard**, 6 CRT themes, keypress audio | Dual mode solves discoverability |
| 12 | **clearPath terminal-portfolio** | github.com/clearPath-Dev/terminal-portfolio | Theme-specific easter eggs (Matrix/Star Trek/Borg) | Theme unlocks themed content |
| 13 | **98.css / XP.css / 7.css** | github.com/jdan/98.css | Pure-CSS Win9x/XP/7 chrome | Wrong era for UNIX look; steal semantic-CSS discipline |
| 14 | **React95** | github.com/React95/React95 | Win95 React kit, Clippy, authentic FON→WOFF2 fonts | `@react95/clippy` as easter egg; font pipeline |
| 15 | **oldweb.today** | oldweb.today | Emulated old browsers via WASM | Make the *interaction* the artifact |

### 4.2 What gets praised vs. criticized

**Praise:** fidelity/depth ("more than a desktop UI"), personality/humor, consistent world-building, physical-world bridges, form-factor-appropriate mobile.

**Criticism (avoid):** gimmick fatigue ("wouldn't use as a portfolio"), mobile UX destruction, poor discoverability, heavy/broken-on-mobile effects, "why not use a real OS?".

### 4.3 Top "steal-this" ideas for this project

1. **Poolsuite mobile strategy** — a *different* retro device on mobile (terminal/PDA), never a shrunken desktop.
2. **daedalOS persistence** — persist window layouts, open files, theme, terminal history (partially done: windows + theme persist; icons don't).
3. **Windows 93 easter-egg density** — 5–10 unlisted commands reward exploration.
4. **satnaing theme system** — richer theme set; each theme feels like a distinct era.
5. **Retro TUI dual mode** — a `gui` command renders a visual portfolio dashboard.

---

## 5. Technique Reference

### 5.1 Retro UI component libraries — fit assessment

Conclusion: **do not adopt** 98.css / XP.css / 7.css / React95 / windows-98-ui. All are Windows chrome, conflicting with the UNIX phosphor aesthetic; React95 also brings styled-components (architecture conflict). Keep the custom window manager + CSS Modules. Steal only: semantic-CSS discipline and the CSS-custom-property theming approach (already in use).

### 5.2 CRT effect tiers

| Tier | Technique | Cost | Notes |
|---|---|---|---|
| 1 | CSS scanlines / RGB phosphor stripe mask / chromatic aberration (`text-shadow`) / barrel distortion (`perspective`) | ~0 GPU | Add RGB stripe mask first — biggest visual win |
| 2 | SVG `feTurbulence` noise / blend | CPU-rasterized | Apply to overlay container only |
| 3 | WebGL CRT shader (`crt-fx`, `@glowbox/crt`, `cool-retro-term-webgl`, `three-retropass`) | GPU, ~1ms/frame @1080p | Lazy-load, apply to terminal canvas only, disable on mobile |
| — | `@glowbox/crt` / `vault66-crt-effect` | — | Both auto-respect `prefers-reduced-motion` (freeze temporal artifacts, keep scanlines/glow) |

Reference implementations: `cool-retro-term` (26k★), `cool-retro-term-webgl`, `gingerbeardman/glsl-web-crt-shader` (tested to iPhone XS).

### 5.3 Terminal emulation decision

**Stay custom.** xterm.js adds ~200KB for VT100/curses features a portfolio doesn't need and makes phosphor styling/CRT overlay harder. Custom terminal is lighter and fully integrated with VFS.

**UX upgrades to add:**

- Ghost-text inline autocomplete + Tab cycling through matches (currently shows all matches).
- `Ctrl+R` reverse incremental history search (lib `~/.bashrc` aliases too — see TODO.md).
- ANSI-style syntax highlighting for `cat`/`ls`/`tree` output. The `outputLink` CSS class exists but no command uses it.
- Pipe support (`cat file | grep x`) — future.
- Mobile modifier toolbar (Tab/Esc/Ctrl) for touch keyboards.

### 5.4 WebAudio retro sound

Existing `lib/sound.ts` is already the right hand-rolled approach; **Tone.js is overkill (≈130KB, <5% used)**. Expand:

- `keyClick()` with per-keystroke pitch variation (wire to terminal input).
- `errorBuzz()` on invalid command/error.
- Multi-tone boot chime (e.g., C5-E5-G5 arpeggio).
- 60 Hz CRT power-on hum.
- Make all gains read `useSystemStore.volume` (currently hardcoded; ref FND-07).
- Optional per-theme sound packs (green=square beep, amber=warm sine, white=triangle, blue=cold square).

### 5.5 Retro typography

Keep **VT323** (terminal/display) + **IBM Plex Mono** (UI chrome/code). Consider adding as alternates/theme fonts: **Fixedsys Excelsior** (8×16 bitmap + ligatures), **Perfect DOS VGA 437**, **Terminus**, **More Perfect DOS VGA** (broader charset). Self-host + subset to Latin (`font-display: swap`, preload critical font) — see PERF-01.

### 5.6 Accessibility techniques

- **Live regions:** terminal output `role="log"` + `aria-live="polite"`; status `role="status"`; errors `role="alert"`/`assertive` sparingly.
- **Roving tabindex** for icon grid/dock/menus: one `tabindex=0`, others `-1`, arrows move focus, Tab exits composite.
- **Focus management:** window open → focus enters; window close → focus returns to opener; Tab cycles within active window then taskbar.
- **Skip-to-content** link.
- **Contrast:** bright phosphor passes AA (green #33ff33 ≈ 9.8:1 on #0a0a0a; amber #ffb000 ≈ 9.6:1). Verify white/blue + dim variants; dark green #009900 is borderline.
- **Motion:** `prefers-reduced-motion` must disable flicker/sweep/glitch; keep static scanlines/glow. Add `prefers-contrast: more` and an in-app motion toggle (`auto|on|off`).

### 5.7 Mobile paradigms

Three approaches; pick **A (separate paradigm)**:

- **A — separate mobile OS** (recommended): fullscreen app stack + back navigation; no draggable windows; bottom dock; swipe app switching; skippable boot; terminal modifier toolbar. (DAX Portal, Showcase OS, OG-OS, KABIR-OS, SUDHI OS.)
- **B — desktop layout + pinch-zoom**: not recommended (hover-dependent, frustrating).
- **C — terminal-only fallback**: viable but hides visual portfolio.

### 5.8 SEO / prerendering

Client-rendered SPA serves empty `<div id="root">`; social scrapers don't run JS. Pattern (~5 real Vite projects): `vite build` → local server → Puppeteer/Playwright visits each route → wait for **real signal** (`document.title` non-empty + root has children) → serialize `outerHTML` → write `dist/<route>.html`. Gotchas: don't use fixed `setTimeout`; force animations to final state before capture; avoid directory-style output (use flat `.html`); no hidden keyword blocks (spam risk). Add per-route meta + Open Graph + JSON-LD `Person`, `sitemap.xml` from same route list, static `<noscript>` fallback.

### 5.9 Performance budgets

- Budget: **250KB JS / 50KB CSS / 200KB images / 600KB total** (gzip). Targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.
- Self-host variable WOFF2 (Google Fonts costs ~120KB + 3 connections).
- Gate heavy effects with `IntersectionObserver`; throttle rAF loops to 30fps on mobile; disable WebGL on mobile.
- Lighthouse budget check in CI.

---

## 6. Current-State Audit — Content Layer

### 6.1 VFS tree (`store/vfs-tree.ts`)

```
/
├── bin/                              (empty)
├── home/guest/
│   ├── about.txt                     bio
│   ├── skills.conf                   8 skill categories
│   ├── resume.txt                    experience, education, publications, projects
│   └── contact.md                    9 contact links
├── projects/<6>/{project.conf, README.md, [source|tests|data|models]/}
├── logs/{2024,2025,2026}.log         diary entries (career + projects)
├── lab/{exp_01_cuda,exp_02_llm}.txt + notes/*.md
├── papers/{beni_global_10,beni_v1,institutional_quality_finance}.md
├── music/{playlist_2025.txt, ambient_works.md}
├── art/{pixel_art_notes.txt, shader_notes.md}
├── secret/{konami.txt, .easter_egg.bin}   (rwx------)
├── blog/{hello-world.md, beni-story.md}
├── tmp/ archive/ trash/              (empty)
```

Empty dirs create false expectations: `/bin`, `/tmp`, `/archive`, `/trash`, `projects/*/{source,tests,data,models}`.

### 6.2 Command inventory (39)

**Portfolio commands (15):**

| Command | Source | Notes |
|---|---|---|
| `about` | hardcoded | ASCII box; role string differs from others |
| `projects` | hardcoded array (6) | no URLs; points to `cat /projects/.../README.md` |
| `papers` | hardcoded (3) | full detail lives in VFS |
| `research` | hardcoded (4 areas) | repeats BENI/arXiv info |
| `experience` | hardcoded (4 roles) | duplicates resume.txt |
| `skills` | hardcoded (8 cats) | exact duplicate of skills.conf |
| `contact` | hardcoded (9 links) | links are plain text, no `--open` |
| `github` | hardcoded | supports `--open` |
| `linkedin` | hardcoded | supports `--open` |
| `resume` | **VFS** | only portfolio command reading VFS |
| `blog` | hardcoded (2 titles) | content in VFS; should list dynamically |
| `datasets` | hardcoded (2) | duplicates paper summaries |
| `timeline` | hardcoded (11 events) | synthesizes logs |
| `neofetch` | hardcoded | ASCII logo + system info |
| `sysinfo` | hardcoded | different role/languages than others |
| `memoire` | Supabase / localStorage | bulletin board; opens window; sync handler with async fire-and-forget |

**VFS-aware utilities:** `ls`, `cd`, `cat`, `pwd`, `grep`, `tree`, `mkdir` (tmp only), `touch` (tmp only).
**Utilities:** `echo`, `clear`, `theme`.
**Simulated system/fun:** `weather`, `ping`, `curl`, `top`, `htop`, `hostname`, `uptime`, `neofetch`, `fortune`, `cowsay`, `matrix`.
**Registry eggs:** `whoami`, `uname -a`, `exit`, `reboot`, `sudo`.
**Docs:** `help`, `man` (25 pages; `-l` documented as not implemented).

### 6.3 Duplication

| Content | VFS | Also hardcoded in |
|---|---|---|
| Bio | `about.txt` | `about`, `sysinfo` |
| Skills | `skills.conf` | `skills` (verbatim) |
| Contact | `contact.md` | `contact`, `github`, `linkedin` |
| Experience | `resume.txt` | `experience` |
| Projects | `projects/*/project.conf` | `projects` |
| Papers | `papers/*.md` | `papers`, `research`, `datasets` |
| Blog | `blog/*.md` | `blog` |

**Root cause:** only `resume` reads VFS. Editing VFS files changes nothing in commands → parallel copies drift (already visible: role/skills inconsistency).

### 6.4 Content gaps

- No `education`, spoken-`languages`, `awards`/`certifications`, citations metrics, or `website` (open nabil.iam.bd) command.
- `--open` only on `github`/`linkedin`.
- Blog is skeletal (2 posts).
- Empty VFS dirs (see 6.1).

---

## 7. Current-State Audit — Shell

### 7.1 Window manager

- **Working:** open/close/focus + z-promotion/minimize/maximize+restore/drag/8-way resize (min 300×150)/cascade/persist/taskbar restore; content routing switch; `contentRef` focuses first focusable child.
- **Missing/broken:** snapping/tiling; close animation (`isClosing` set but never read); maximize not resize-tracked (FND-08); per-type size constraints; no `maxWidth/Height` cap; `x:0` vs undefined cascade edge case.
- **Dead:** `lib/windowManager.ts` entirely (`getHighestZIndex`, `getCascadePosition`, `resetCascadeCounter`, `hasOverlap`, `findNonOverlappingPosition` — none imported); `windowCounter` duplicates store's counter; `.windowFocused` z-index.

### 7.2 Desktop / MenuBar

- **Menus:** FILE (New Terminal, Logout — working); **EDIT (Cut/Copy/Paste/Select All — all `() => {}` stubs)**; **VIEW (Sort by Name/Date — stubs)**; PROJECTS (dynamic from VFS — working); SETTINGS (Theme submenu, Sound, CRT Flicker — working).
- **Keyboard:** only Escape closes the open menu (returns focus). No arrow-key navigation, Enter activation, accelerators, Home/End.
- **Submenus hover-only** (CSS `display`), so Theme submenu is unreachable by keyboard.
- **IconGrid:** 12 icons (9 folder entries + terminal/web/files blocks), drag-reposition via pointer, 4px double-click threshold. No selection, no context menu, no keyboard nav. Positions in `useState` → not persisted (window state persists — asymmetry).
- **DesktopIcon:** no `tabIndex`/`role`/`aria-label` → invisible to keyboard/SR.
- MenuBar clock updates every 60s (weekday + date only).

### 7.3 Keyboard (`hooks/useKeyboard.ts`)

Only 3 shortcuts: Konami code (opens `/secret` + bootChirp), `Alt+Tab` (cycle non-minimized), `Escape` (close focused — unconditional, see FND-03/04). Missing: clipboard, `Ctrl+W/M/N`, `Alt+F4`, F11, menu accelerators, focus trapping, terminal-focus shortcut.

### 7.4 Themes

4 themes × 10 vars. Gaps: no switch transition + first-load flash (FND-09); icon positions not persisted; white theme disables glow → weak focus indication; no custom themes; `variables.css` `:root` duplicates green defaults.

### 7.5 CRT / sound

- `CRTOverlay`: 5 CSS layers, `will-change:opacity`, reduced-motion respected, keyframes re-injected per render (FND-10), 5 full-screen compositor layers (mobile GPU concern).
- `SoundEngine`: boot sequence + window open/close; `keyClick`/`errorBuzz` defined but never called; volume state unused; no maximize/minimize/menu sounds; AudioContext never suspended when sound disabled; `windowCount` ref could be stale after HMR.

### 7.6 Mobile / responsive

- Breakpoints 768px/480px adjust font-size, window min sizes, wallpaper, taskbar, boot screen.
- **Not responsive:** MenuBar (no rules → clips <~600px); IconGrid (`GRID_COLS=2` hardcoded); FileManager sidebar fixed 180px; resize handles 4–10px (touch targets); no touch gestures/viewport-orientation hooks.
- PointerEvents + `touch-action:none` give basic touch drag.

### 7.7 Dead code / stubs summary

`lib/windowManager.ts`; `isClosing`/`setWindowClosing`; `keyClick()`; `errorBuzz()`; `volume`/`setVolume`; `.windowFocused` z-index; EDIT + VIEW menu actions; `man -l` (documented only); `vfs-tree.ts:506 TODO` is *content*, not code.

---

## 8. Roadmap

### Phase 0 — Safety & correctness — ✅ SHIPPED (Sep 2026)
FND-01 (flicker ≤3/s), FND-03/04 (Escape guarded; terminal Escape clears input), FND-07 (dead code removed; `keyClick`/`errorBuzz`/`volume` wired), FND-08 (maximized reflow on resize). FND-02 superseded by the typing intro (§2.8).
Verified: `tsc -b` clean · 109/109 Vitest · `vite build` exit 0 · E2E `bootToDesktop` passes (run against system Chrome; Playwright's bundled browser is not installed).

### Phase 1 — Quick wins — ✅ SHIPPED (Sep 2026)
FND-05 (`help` lists all 43 commands via the registry), FND-06 + CON-01 (`src/data/portfolio.ts` canonical content; identity reconciled), WM-02 (async close animation via `beginClose`), WM-04 (icon positions persisted under `nabilos-icons`), FX-03 (RGB phosphor mask + subtle chromatic aberration), PERF-01 (self-hosted VT323 + IBM Plex Mono WOFF2), FND-09 (pre-paint theme script). FX-01 (wire sounds) shipped earlier in Phase 0.
Verified: `tsc -b` clean · 109/109 Vitest · `vite build` exit 0 · E2E `bootToDesktop` + `desktopIcons` pass.

### Phase 2 — UX depth — ◐ PARTIAL (Sep 2026)
Shipped: DIS-01 (`?skip-boot`/`?guest`/`?open` deep links), DIS-02 (first-run onboarding), DIS-03 (`gui` dashboard command + window), TERM-01/02/03 (ghost-text + Tab cycling, Ctrl+R reverse search, output highlighting), A11Y-01/02/03 (menu-bar, submenu, and icon-grid keyboard navigation). Also added `useTypeToTerminal` — a focus fallback that routes stray keystrokes to the terminal when nothing is focused.
Also shipped: MOB-01 (separate mobile app-stack + dock) and TERM-07 (mobile key bar). Remaining: CON-02 (VFS-backed commands).
Verified: `tsc -b` clean · 109/109 Vitest · `vite build` exit 0 · E2E `bootToDesktop` + `desktopIcons` pass · keyboard nav verified live (Tab → menu arrows → SETTINGS submenu; icon-grid arrows + Enter).
Note: A11Y-01/02/03 were built by a subagent that was cancelled mid-edit; re-verified functional afterward.

### Phase 3 — Reach & polish — ◐ PARTIAL (Sep 2026)
Shipped: SEO-02 (descriptive meta + Open Graph/Twitter + JSON-LD `Person`/`WebSite` + `<noscript>` fallback + `robots.txt` + `sitemap.xml`), A11Y-04 (skip-to-content + `#main` targets), A11Y-05 (all 4 theme `--phosphor-dim` raised to WCAG AA + `prefers-contrast: more`), A11Y-06 (motion toggle auto/on/off), PERF-02 (`npm run size` bundle budget + warn-only CI step). Hygiene: favicon, Vitest now exits 0 (pointer-capture polyfill), Discord domain verification file (`.well-known/discord`).
Not applicable: SEO-01 (a JS prerender would capture the typing intro, not portfolio content — replaced by the JSON-LD + `<noscript>` + sitemap approach).
Also shipped: FX-05 (WebGL CRT overlay on the terminal — gated off on mobile and when motion is off), DEL-01 (hidden Easter-egg commands), DEL-03 (Now page + memoire board shipped).
Hygiene: CI actions bumped to `checkout@v7` / `setup-node@v7` / `upload-pages-artifact@v5` / `deploy-pages@v5` on Node 22; `test-setup.ts` now polyfills `matchMedia` + `ResizeObserver`.

---

## 9. Backlog (detailed)

> Every item: **Problem → Evidence → Fix → Acceptance**. Effort: S(≤2h) · M(≤1d) · L(>1d).

### Foundation / correctness

**FND-01 · Reduce CRT flicker to ≤3 Hz · ✅ SHIPPED**
- Problem: flicker at ~6.7 Hz risks photosensitive seizures (WCAG 2.3.1).
- Evidence: `styles/variables.css` `--crt-flicker-speed: 0.15s`; `CRTOverlay.tsx` flicker layer.
- Fix: set cycle ≥0.33s (≤3 Hz) and/or lower amplitude; keep reduced-motion guard.
- Acceptance: computed flicker ≤3 Hz; reduced-motion disables it; no visual regression in all 4 themes.

**FND-02 · Make `boot` phase reachable · ✅ SUPERSEDED**
- Resolution: the `boot` phase was removed and the fake animation replaced by the typing intro (§2.8). No reachability issue remains.

**FND-03 · Guard Escape window-close · ✅ SHIPPED**
- Problem: Escape always closes focused window, conflicting with menu Escape.
- Evidence: `hooks/useKeyboard.ts:46-51`; `MenuBar.tsx:72-79`.
- Fix: skip close when a menu/modal is open or an input is focused; ensure single handler owns Escape per state.
- Acceptance: Escape closes menu only when menu open; closes window only when nothing else consumes it; focus returns correctly.

**FND-04 · Escape clears terminal input first · ✅ SHIPPED**
- Same guard as FND-03; terminal input Escape clears line before any window close.

**FND-05 · `help` lists all commands · ✅ SHIPPED**
- Evidence: `cmd_help.ts` partial list.
- Fix: derive from registry (single source), grouped by category.
- Acceptance: every registered command appears; no stale entries; test asserts count parity.

**FND-06 · Canonical identity strings · ✅ SHIPPED**
- Fix: define `src/data/portfolio.ts` identity (see CON-01) and reference from all commands.
- Acceptance: no divergent role strings; `skills`/`sysinfo` agree on languages.

**FND-07 · Remove/wire dead code · ✅ SHIPPED**
- Delete `lib/windowManager.ts`, `isClosing`/`setWindowClosing` (or wire WM-02), `.windowFocused` z-index, unused `windowCounter`.
- Wire `keyClick`/`errorBuzz` (FX-01) and `volume` (FX-02) instead of deleting.
- Acceptance: lint/build clean; no unused exports remain.

**FND-08 · Re-track maximized windows on resize · ✅ SHIPPED**
- Fix: add resize listener; recompute maximized rects.
- Acceptance: maximized window fills viewport after browser resize; restore returns to prior rect.

**FND-09 · Eliminate first-load theme flash · ✅ SHIPPED**
- Fix: inline `index.html` script reads persisted theme and sets `data-theme` before React; optional transition.
- Acceptance: no green flash when stored theme is amber/white/blue.

**FND-10 · Move CRT keyframes out of render · P3 · S · 🟢**
**FND-11 · Remove dead `.windowFocused` z-index · P3 · S · 🟢**

### Content

**CON-01 · Single source of truth (`src/data/portfolio.ts`) · ✅ SHIPPED**
- Problem: 14/15 portfolio commands hardcode data duplicated in VFS; drift already occurring.
- Fix: typed canonical data module (identity, projects, papers, experience, skills, contact, education, datasets, blog) consumed by commands and used to build VFS (or vice versa).
- Acceptance: editing one source updates both terminal output and VFS; a test asserts no divergent values; no content duplicated inline.

**CON-02 · Convert hardcoded commands to VFS/data readers · P1 · M · 🟠**
- Commands: `about`, `skills`, `contact`, `projects`, `papers`, `datasets`, `experience`.
- Acceptance: each reads canonical source; output unchanged or improved.

**CON-03 · `cmd_blog` lists VFS dynamically · P2 · S · 🟡**
- Acceptance: adding `/blog/*.md` appears without editing the command.

**CON-04 · Add missing sections · P2 · M · 🟡**
- `education`, spoken `languages`, `awards`, `website` (opens nabil.iam.bd), citation metrics.
- Acceptance: new commands documented in `help`/`man`; data sourced canonically.

**CON-05 · `--open` for all external links · P2 · S · 🟡**
- Extend to `contact`, `datasets`, `website`, HuggingFace/arXiv/Twitter/academic.
- Acceptance: each opens correct URL; fallback if popup blocked.

**CON-06 · Resolve empty VFS dirs · P3 · S · 🟢**
- Populate `projects/*/source` with real snippets, or remove empty dirs.
- Acceptance: no directory that opens to nothing without explanation.

### Discoverability / onboarding

**DIS-01 · Deep-link entry (`?skip-boot`, `?guest=1`, `?open=<path>`) · ✅ SHIPPED**
- Problem: OS metaphor hides content; recruiters need 1-click access.
- Fix: query params to skip boot, log in as guest, and pre-open a window (e.g., Portfolio/projects).
- Acceptance: `?skip-boot=1` lands on desktop with Portfolio window; `?open=projects/...` opens that item; invalid params degrade gracefully.

**DIS-02 · First-run onboarding hint · ✅ SHIPPED**
- Problem: mystery-meat navigation (NN/g: ~50% discoverability drop).
- Fix: one-time overlay/tooltip ("Click icons • Try the terminal • Tab autocompletes"), persisted flag (coordinate TODO.md's `motdShown`).
- Acceptance: shows once per browser; dismissible; keyboard-accessible.

**DIS-03 · `gui` visual dashboard command · ✅ SHIPPED**
- Fix: `gui` opens a visual portfolio dashboard window (projects/resume/contact) — solves "I don't use terminals".
- Acceptance: dashboard reachable from terminal and menu; content from canonical data.

**DIS-04 · Persistent resume/contact affordance · P1 · S · 🔴**
- Fix: resume + contact reachable in 1 click from taskbar/menu/status area.
- Acceptance: ≤1 click from desktop to résumé; visible without opening a window.

### Terminal

**TERM-01 · Ghost-text autocomplete + Tab cycling · ✅ SHIPPED**
**TERM-02 · `Ctrl+R` reverse history search · ✅ SHIPPED**
**TERM-03 · Syntax highlighting for `cat`/`ls`/`tree` output · ✅ SHIPPED** (use existing `outputLink` class at minimum)
**TERM-04 · Wire `keyClick` to keystrokes · P1 · S · 🟢** (depends FX-01)
**TERM-05 · Command aliases (`alias`) · P3 · M · 🟢**
**TERM-06 · Pipe support · P3 · L · 🟢**
**TERM-07 · Mobile modifier toolbar (Tab/Esc/Ctrl) · ✅ SHIPPED** (part of MOB-01)

### Window manager / desktop

**WM-01 · Window snapping/tiling · P3 · M · 🟡** (use dead `lib/windowManager.ts` helpers)
**WM-02 · Close animation via `isClosing` · ✅ SHIPPED**
**WM-03 · Double-click titlebar → maximize · P2 · S · 🟢**
**WM-04 · Persist icon positions · ✅ SHIPPED** (mirror window persistence)
**WM-05 · Per-type window size constraints · P3 · S · 🟢**
**WM-06 · Finish or remove EDIT/VIEW menus · P2 · M · 🟠** (implement clipboard + sort, or remove items)
**WM-07 · Clipboard integration (Ctrl+C/V/X/A) · P2 · M · 🟡** (pairs WM-06)

### Effects (visual/audio)

**FX-01 · Wire unused sounds · ✅ SHIPPED** (`keyClick`, `errorBuzz`) — done in Phase 0
**FX-02 · Respect `volume` in SoundEngine · ✅ SHIPPED**
**FX-03 · RGB phosphor stripe mask + chromatic aberration · ✅ SHIPPED**
**FX-04 · 60 Hz CRT power-on hum + multi-tone boot chime · ✅ SHIPPED**
**FX-05 · Optional WebGL CRT on terminal canvas · ✅ SHIPPED** (lazy, mobile-off, reduced-motion-safe)
**FX-06 · SVG noise film-grain · P3 · S · 🟢**
**FX-07 · Theme switch transition · P3 · S · 🟢**
**FX-08 · Per-theme sound packs · P3 · M · 🟢**
**FX-09 · CRT overlay perf: consolidate layers / canvas option · P3 · M · 🟡**

### Accessibility

**A11Y-01 · Keyboard nav for MenuBar (arrows/Enter/Home/End/accelerators) · ✅ SHIPPED**
**A11Y-02 · Keyboard-accessible submenus · ✅ SHIPPED** (replace hover-only with JS state)
**A11Y-03 · Keyboard + ARIA for desktop icons (roving tabindex) · ✅ SHIPPED**
**A11Y-04 · Focus management (window open/close, cycling) + skip link · ✅ SHIPPED**
**A11Y-05 · Verify/fix contrast incl. white theme focus indication · ✅ SHIPPED**
**A11Y-06 · In-app motion toggle (auto/on/off) + `prefers-contrast` · ✅ SHIPPED**
**A11Y-07 · Confirm terminal `role=log`/aria-live + window focus trap · P2 · S · 🟡**

### SEO

**SEO-01 · Build-time prerendering for routes · ⚠️ N/A** (a JS prerender captures the typing intro, not content — replaced by JSON-LD + `<noscript>` + sitemap)
- Fix: Puppeteer/Playwright post-build script; wait on real signal; flat `.html` output.
- Acceptance: crawlers receive rendered HTML; social previews resolve; CI step added.

**SEO-02 · Per-route meta + JSON-LD `Person` + `sitemap.xml` + `<noscript>` fallback · ✅ SHIPPED**
- Acceptance: each route has title/description/OG; sitemap matches prerender routes; noscript shows core links.

### Mobile

**MOB-01 · Separate mobile paradigm · ✅ SHIPPED**
- Problem: MenuBar clips, icon grid overflows, resize handles untappable.
- Fix: platform detection → mobile app stack (fullscreen apps, back nav, bottom dock, skippable boot, terminal modifier toolbar); no draggable windows.
- Acceptance: usable at 320–480px; all portfolio content reachable; boot skippable; Lighthouse mobile pass.

### Performance

**PERF-01 · Self-host variable WOFF2 (VT323 + IBM Plex Mono) · ✅ SHIPPED**
- Acceptance: no Google Fonts runtime request; `font-display:swap`; preload critical; FCP improves on 4G.
**PERF-02 · CI performance budget (250KB JS / 600KB total) · ✅ SHIPPED**
**PERF-03 · IntersectionObserver-gate heavy effects · P3 · M · 🟢**

### Delight / world-building

**DEL-01 · 5–10 hidden Easter-egg commands · ✅ SHIPPED**
**DEL-02 · Theme-specific egg content · ✅ SHIPPED**
**DEL-03 · Guestbook / Now page / Memoire board · ✅ SHIPPED**
**DEL-04 · Selectable ASCII wallpapers (`ann`/`grid`/`circuit`/`none`) · ✅ SHIPPED**
**DEL-04 · Occasional self-healing "kernel panic" boot variation · P3 · S · 🟢**

---

## 10. Implementation Conventions & Guardrails

- **Never** suppress types (`as any`, `@ts-ignore`, `@ts-expect-error`) — fix the type.
- **Never** commit unless explicitly asked; **never** leave the tree broken after a failed attempt (revert first).
- Match existing patterns: CSS Modules, Zustand stores, command modules exporting a registered command, ARIA attributes already present.
- Fix bugs **minimally** — no refactors while fixing (e.g., FND-03 is a guard, not a keyboard-system rewrite).
- Prefer existing libraries; adding a dependency (e.g., a CRT lib) requires justification vs. the ~600KB budget.
- Accessibility is not optional: keyboard path + reduced-motion must work for every new interaction.
- Content lives in **one** place (CON-01); never inline portfolio data in a command again.
- Update this doc's status tags in the same change.

---

## 11. Verification & Quality Gates

Run before marking any non-trivial item DONE:

1. `lsp_diagnostics` clean on changed files.
2. `npm test` — all pass (note pre-existing failures explicitly).
3. `npm run build` — exit 0 (`tsc -b && vite build`).
4. For UI changes: `npm run test:e2e`; manually verify boot→desktop in all 4 themes.
5. For a11y changes: keyboard-only pass (Tab/Shift+Tab/arrows/Enter/Escape) + reduced-motion emulation.
6. For perf changes: compare bundle size (`dist/assets`) against budget; no budget regression without note.
7. Record evidence (command output / screenshot) in the PR or commit description.

---

## 12. Open Questions / Decisions Needed

1. ~~**Mobile**: commit to paradigm A (separate app-stack) or C (terminal-only)?~~ **Decided:** app-stack + dock (MOB-01 shipped).
2. **Content source direction**: `portfolio.ts` → generate VFS, or VFS → generate commands? (Recommend: typed TS module is canonical; VFS built from it.)
3. **`RESEARCH-UX-SEO-A11Y-FINDINGS.md`**: keep as linked appendix, or fold into this doc and delete? (Prevents drift.)
4. **WebGL CRT**: worth the budget/fidelity vs. CSS-only? Decide before FX-05.
5. **Prerender host compatibility**: confirm GitHub Pages flat-file/redirect behavior before SEO-01.
6. **EDIT/VIEW menus**: implement clipboard or remove the menus (WM-06)?
7. **`TODO.md`**: retire into §9 or keep as a thin pointer?

---

## 13. References

### Benchmarks
daedalOS (github.com/DustinBrett/daedalOS) · Windows 98 Web (azayrahmad.github.io/win98-web) · rahul.io · PortfolioXP (awwwards.com/sites/portfoliopxp) · macOS-Web-Simulator · windows93.net · poolsuite.net · neal.fun · satnaing terminal-portfolio · CRT Terminal Portfolio (github.com/atmozki) · Retro TUI Portfolio (astro.build) · clearPath terminal-portfolio · 98.css · React95 · oldweb.today

### UX / navigation
- NN/g — Hamburger Menus and Hidden Navigation Hurt UX Metrics (179 participants): nngroup.com/articles/hamburger-menus/
- NN/g — Find Navigation: Desktop, Not Hamburger
- Wikipedia — Mystery Meat Navigation

### Recruiter behaviour
UXfolio UX Portfolio Playbook · Open Doors Careers (how recruiters scan portfolios, 2026) · Xperience Wave 7-Second Portfolio Test · Medium 200+ portfolio review · Dribbble (Korin Harris, Figma)

### SEO / prerendering
12vblanco/Portfolio-2026 · DEV.to — Prerendering 280 pages of a React SPA · Till Freitag — prerendering React SPA · Bentofolio (adixcode.com) · WBBB0730/vite-plugin-react-ssg · Shrinath — Vite SEO without Next.js

### Accessibility
W3C — Understanding SC 2.3.3 Animation from Interactions · MDN prefers-reduced-motion · MDN ARIA live regions · W3C ARIA Practices — Keyboard Interface · xterm.js AccessibilityManager · npm @glowbox/crt · npm vault66-crt-effect

### Mobile
ronbodnar/showcase-os · 201Harsh/DAX-Portal · OG-OS · signingoff-dubey/desktop-portfolio (KABIR-OS) · SudhirDevOps1/SUDHI OS · tarsnet/pocketshell · cplieger/web-terminal-ui

### CRT / terminal / audio / fonts
cool-retro-term (26k★) · cool-retro-term-webgl · crt-fx · gingerbeardman/glsl-web-crt-shader · three-retropass · Tone.js (reference) · 8bit-sound-engine · retro-audio · Perfect DOS VGA 437 · Fixedsys Excelsior · Terminus · IBM Plex · int10h.org oldschool PC fonts

### Performance
Modern React SPA — performance budget · WaretaGarasu build notes (self-hosted fonts)

---

*End of document. Update status tags as work lands; keep §3, §9, and §12 in sync with reality.*
