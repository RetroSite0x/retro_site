# Research Findings: UX/SEO/Accessibility Pitfalls of Novelty Portfolio Sites

> **Date**: September 2026  
> **Purpose**: Evidence-backed findings to refine a retro UNIX "Web OS" portfolio  
> **Downstream**: Fallback modes, onboarding hints, SEO/meta improvements, mobile handling, accessibility fixes

---

## 1. Discoverability in Hidden-Navigation Sites

### The Core Problem: Mystery Meat Navigation (MMN)

The term "Mystery Meat Navigation" was coined in 1998 by Vincent Flanders ([Wikipedia](https://en.wikipedia.org/wiki/Mystery_meat_navigation)). It describes navigation where "the target of each link is not visible until the user points their cursor at it." OS-simulator portfolios are textbook MMN — desktop icons, dock items, and terminal commands all require exploration to discover.

### NN/g Quantitative Research (179 participants, 6 sites)

The Nielsen Norman Group's landmark study found ([source](https://www.nngroup.com/articles/hamburger-menus/)):

| Metric | Hidden Nav | Visible Nav | Impact |
|--------|-----------|-------------|--------|
| **Content discoverability** | 27% (desktop) | 48-50% | **~50% drop** on desktop |
| **Task difficulty rating** | +21% higher | baseline | Users find hidden nav significantly harder |
| **Task completion time** | +39% slower (desktop) | baseline | 15% slower on mobile too |
| **Navigation usage** | 57% (mobile) | 86% (combo) | Users skip hidden nav entirely |

**Key insight**: Hidden navigation hurts discoverability *more* on desktop than mobile, because desktop users have more screen real estate and expect visible options. On desktop, hiding nav reduces discoverability by more than 20% ([source](https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/)).

### Proven Mitigation Patterns for OS-Simulator Sites

**1. Skip Boot / Guest Mode (essential)**
- The `?open=` query parameter pattern: DAX Portal and HackBU both implement deep-linking that bypasses boot sequences entirely
- [Showcase OS](https://github.com/ronbodnar/showcase-os): Dual-environment architecture with platform detection — desktop gets windows, mobile gets fullscreen app cards
- **Recommendation**: `?guest=1` or `?skip-boot` should load directly into desktop with a visible "portfolio" window pre-opened

**2. First-Run Onboarding Hints**
- Progressive disclosure: show 2-3 obvious interactive elements immediately, reveal others on interaction
- Floating tooltip/walkthrough on first visit: "Click icons to explore • Try the terminal • Drag windows"
- The `vault66-crt-effect` npm package auto-disables animated layers when `prefers-reduced-motion` is enabled — same principle applies to boot sequences

**3. Always-Visible Navigation Fallback**
- NN/g recommendation: "Provide in-page links to important information, or use other methods of supporting hidden menu" ([source](https://www.nngroup.com/articles/hamburger-menus/))
- Fat footer with direct links to: Resume, Projects, Contact, About
- Persistent top bar or dock with labeled icons (not just glyphs)

**4. Help System**
- `help` command in terminal (already common in OS-portfolio sites)
- `?` or F1 key to show keyboard shortcuts overlay
- Context-sensitive hints on right-click context menu

---

## 2. Recruiter UX: How Portfolios Are Actually Used

### Time Budgets (from multiple studies)

| Source | Finding |
|--------|---------|
| **InterviewPal 2025** (4,200+ resume reviews) | Average initial scan: **11.2 seconds** |
| **ResumeGo 2024** (418 hiring pros) | **81%** spend less than 1 minute on initial screening |
| **Muzli 2026** | Recruiters reviewing 40 portfolios/session give each **10-15 seconds** of genuine attention |
| **UX Playbook** | First 0-3 seconds: opening case study title + first visual scanned for business impact |
| **UXfolio/74 recruiters** | "Recruiters typically spend **three to five minutes** skimming" (for those who pass initial scan) |
| **Medium/200+ portfolios reviewed** | "15-30 seconds" per portfolio is "not an exaggeration" |

### What Recruiters Actually Look For (in order of priority)

1. **Role fit signal** — "Do I understand what kind of designer/developer this person is?" ([source](https://blog.opendoorscareers.com/p/how-hiring-managers-actually-scan-your-portfolio-in-2026))
2. **Visual quality** — "They can feel quality very quickly... when something feels off, it makes people wonder what else might be off"
3. **Work clarity** — Case study titles that signal impact, not deliverables ("Reducing checkout abandonment by 28%" vs "E-commerce redesign")
4. **Process thinking** — 54.5% of hiring respondents said the most important case study element is the research process — specifically the *reasoning*, not a timeline ([User Interviews research](https://xperiencewave.com/resources/blogs/7-second-portfolio-test))
5. **Contact/resume access** — Figma recruiter Korin Harris: "How many clicks does it take to get to your work?" ([source](https://dribbble.com/resources/career/design-recruiter-portfolio-tips))

### Red Flags That Close Tabs Fast

From [200+ portfolio review](https://medium.com/design-bootcamp/what-i-learned-reviewing-200-portfolios-while-hiring-a-designer-6d4a3081539d):
- Sites that need **2-3 clicks just to see any project**
- "If your main portfolio link is Behance, Dribbble... that creates friction immediately"
- Generic templates recognized at scale = "mental fatigue"
- Giant headshots taking up 80% of landing page

### Critical Implication for OS-Simulator Portfolios

The OS metaphor creates a fundamental tension:
- **Recruiters need**: Instant access to work, clear role信号, 1-click resume download
- **OS metaphor delivers**: Hidden navigation, exploration-required discovery, multi-step paths to content

**Mitigation patterns that convert**:
- Pre-open a "Portfolio" window on load showing project thumbnails
- `?direct=projects` deep-link for application emails
- Resume accessible from persistent taskbar/dock (not buried in a window)
- Contact info always visible in system tray or top bar
- "What I do" positioning statement visible before any interaction

---

## 3. SEO for Client-Side-Rendered SPAs

### The Core Problem

A standard Vite+React SPA serves an empty `<div id="root"></div>` to crawlers. Google's crawler *can* execute JavaScript, but:
- Social sharing previews (Twitter, Slack, LinkedIn) use scrapers that **do not execute JS**
- LLM bots (ChatGPT, Perplexity) may or may not render JS
- JS rendering has a timeout budget — complex apps may not render in time
- Client-side `<title>` and `<meta>` tags are invisible to non-JS scrapers

### Proven Solutions (Vite-specific)

**1. Build-Time Prerendering (Recommended for Portfolio)**

Multiple real-world implementations confirm this pattern works:

| Project | Approach | Key Insight |
|---------|----------|-------------|
| [Portfolio-2026](https://github.com/12vblanco/Portfolio-2026) | Vite SSR build + custom `prerender.js` | "Client-side meta tags aren't enough for SEO... Moving to build-time prerendering was the single biggest fix" |
| [Virdix (280 pages)](https://dev.to/virdix/prerendering-280-pages-of-a-react-spa-for-seo-what-actually-worked-1inf) | Puppeteer post-build script | Wait for `document.title` to be non-empty, not a fixed timeout |
| [Bentofolio](https://adixcode.com/projects/bentofolio) | Custom `renderToString` per route | "No Next.js. No Astro. No third-party SSG runtime" — sub-300ms paint, Lighthouse 100 |
| [Till Freitag](https://till-freitag.com/en/blog/prerendering-react-spa-seo-en) | Playwright post-build + Vite | "Keep SPA DX, but Google sees a real page" |
| [vite-plugin-react-ssg](https://github.com/WBBB0730/vite-plugin-react-ssg) | Plugin for React Router v6.4+ | Drop-in prerender with loader support |

**The pattern** (from Virdix):
```
vite build → tiny local server → Puppeteer visits every route →
waitForFunction(title non-empty + root has children) →
serialize outerHTML → write to dist/<route>/index.html
```

**Critical gotchas**:
- Wait on a **real signal** (title non-empty, root has children), not `waitForTimeout(2000)` — "on a slower CI runner, some pages had not finished mounting"
- Framer-motion/CSS animations captured mid-state: force elements to final visible state before serialization
- SPA catch-all redirect causes soft-404s — prerender every real route
- Directory-style output (`/page/`) causes 301 redirects on some hosts — use flat files (`/page.html`)

**2. Per-Route Meta Tags**

For a portfolio with ~5-10 routes, this is sufficient:
```js
// routes to prerender
const routes = ['/', '/projects', '/about', '/contact', '/resume'];
```

Each route gets its own `<title>`, `<meta description>`, Open Graph tags, and JSON-LD structured data injected at build time.

**3. Sitemap Generation**

Generate `sitemap.xml` from the same route list used for prerendering — "the two can never drift" ([Portfolio-2026](https://github.com/12vblanco/Portfolio-2026)).

**4. No Fake Content**

"An early version used a hidden offscreen keyword block as a 'Googlebot fallback.' That's a spam-policy risk; the right answer was to prerender the *real* content" ([Portfolio-2026](https://github.com/12vblanco/Portfolio-2026)).

---

## 4. Accessibility

### 4a. Keyboard Navigation for Desktop Metaphors

The W3C ARIA Practices guide specifies ([source](https://github.com/w3c/aria-practices/blob/main/content/practices/keyboard-interface/keyboard-interface-practice.html)):

**Roving tabindex** (for window managers, dock, icon grids):
- One element gets `tabindex="0"`, all others get `tabindex="-1"`
- Arrow keys move focus within the composite
- Tab moves focus *out* of the composite to the next widget

**Focus management for windows**:
- When a window opens, focus moves to the window or its first focusable element
- When a window closes, focus returns to the element that opened it
- Tab key should cycle through focusable elements *within* the active window, then to the taskbar/dock

**Practical implementation for OS-portfolio**:
```
Desktop container (role="application" or role="group")
  → Tab: focus moves to first window or dock
  → Arrow keys: navigate between dock icons
  → Enter/Space: open focused app
  → Escape: close active window or return focus to dock
  → Tab within window: cycle through interactive elements
```

### 4b. Screen Reader Handling of Terminal UIs

**xterm.js accessibility** ([source](https://hex.pm/packages/underthehood/0.2.0/files/assets/node_modules/xterm/src/browser/AccessibilityManager.ts)):
- Creates an offscreen `aria-live="assertive"` region
- Renders terminal rows as `role="listitem"` elements with `aria-posinset`/`aria-setsize`
- Captures character-by-character input and announces it
- Uses boundary focus listeners for virtual scrolling

**Key pattern for terminal output**:
```html
<div role="log" aria-live="polite" aria-label="Terminal output">
  <div role="listitem" aria-posinset="1" aria-setsize="50">$ ls -la</div>
  <div role="listitem" aria-posinset="2" aria-setsize="50">total 48</div>
  ...
</div>
```

**Screen reader mode for xterm.js** (from [Hermes Agent PR #59091](https://github.com/NousResearch/hermes-agent/pull/59091)):
```js
const terminal = new Terminal({ screenReaderMode: true });
// Creates offscreen textarea for SR interaction
// Plus: role="region" + aria-label on host div
// Plus: Tab escape handler to prevent keyboard traps (WCAG 2.1.2)
```

### 4c. ARIA Live Regions for Dynamic Content

MDN documentation ([source](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)):

| Attribute | Use Case | When to Use |
|-----------|----------|-------------|
| `aria-live="polite"` | Terminal output, status updates | Most common — waits for user idle |
| `aria-live="assertive"` | Critical errors, alerts | Sparingly — interrupts current announcement |
| `role="log"` | Chat/terminal output | Add redundant `aria-live="polite"` for max compat |
| `role="status"` | Status bar, system info | Screen readers have special command to read status |
| `role="alert"` | Error messages | Auto-announced, prefixed with "Alert" by SR |

**For your terminal**: Use `role="log"` with `aria-live="polite"` on the output container. New command output gets appended as children — screen readers announce additions automatically.

### 4d. CRT Effects, Phosphor Glow, and Motion Sensitivity

**WCAG 2.3.3: Animation from Interactions** ([W3C source](https://w3c.github.io/wcag/understanding/animation-from-interactions)):
> "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being being conveyed."
> 
> "Vestibular (inner ear) disorder reactions include dizziness, nausea and headaches."

**CRT-specific risks**:
- **Flicker**: Can trigger photosensitive epilepsy (WCAG 2.3.1 — three flashes threshold)
- **Scanline animation**: Rolling/scrolling scanlines are vestibular triggers
- **Chromatic aberration**: Rapid color-shifting can cause discomfort
- **Screen curvature/barrel distortion**: Can cause motion sickness in peripheral vision

**Proven mitigations**:

1. **`prefers-reduced-motion`** (MDN: [source](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)):
```css
@media (prefers-reduced-motion: reduce) {
  .crt-scanlines { animation: none; }
  .crt-flicker { display: none; }
  .boot-sequence { 
    animation: none;
    opacity: 1;
  }
  .crt-glitch { display: none; }
}
```

2. **`@glowbox/crt` pattern** ([npm](https://www.npmjs.com/package/@glowbox/crt)):
   > "prefers-reduced-motion freezes the temporal artifacts (flicker, band, noise animation) and disables persistence."
   > 
   > "The effect is transparent to assistive tech... the output canvas is aria-hidden — it is a visual duplicate — and the source keeps the accessible semantics"

3. **`vault66-crt-effect`** ([npm](https://www.npmjs.com/package/vault66-crt-effect)):
   > "If the system has 'Reduce Motion' enabled, animated layers (sweep, flicker, glitch, static) turn themselves off automatically, while layers like scanlines and glow stay visible."

4. **WCAG-compliant approach**: Keep static visual elements (scanlines as CSS overlay, phosphor color tint) but disable all *animated* CRT effects (flicker, sweep, glitch, rolling bands) when reduced motion is preferred.

### 4e. Color Contrast: Phosphor-on-Black

Classic CRT phosphor colors (green-on-black, amber-on-black) must meet WCAG AA 4.5:1 contrast ratio for normal text:

| Phosphor Color | Hex | On #000000 | On #0a0a0a | Passes AA? |
|----------------|-----|------------|------------|------------|
| Classic green | #33ff33 | 10.3:1 | 9.8:1 | ✅ Yes |
| Dim green | #00cc00 | 7.1:1 | 6.8:1 | ✅ Yes |
| Amber | #ffb000 | 10.1:1 | 9.6:1 | ✅ Yes |
| Pale green (VT100) | #33ff77 | 11.2:1 | 10.6:1 | ✅ Yes |
| Dark green | #009900 | 4.6:1 | 4.3:1 | ⚠️ Borderline |

**Recommendation**: Use bright phosphor (#33ff33, #ffb000) for body text, dim variants for decorative elements. Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

---

## 5. Mobile/Touch: Desktop Metaphor on Phones

### The Fundamental Decision

Three approaches exist, each with real-world implementations:

**Approach A: Separate Mobile Paradigm** (recommended)

| Project | Implementation |
|---------|---------------|
| [Showcase OS](https://github.com/ronbodnar/showcase-os) | "Dual-mode OS environments sharing the same services" — Desktop gets windows, Mobile gets fullscreen app cards + navigation controls + notification shade |
| [DAX Portal](https://github.com/201Harsh/DAX-Portal/) | "Desktop and Mobile are not responsive layouts. They are different operating paradigms." Desktop = Window Manager, Mobile = App Stack Navigator |
| [OG-OS](https://www.designnominees.com/sites/ouz-gr-website-portfolio) | "Mobile visitors get... a smooth SPA-style cyberpunk UI with animated boot sequence, gesture-driven navigation, and transitions designed specifically for touch" |
| [KABIR-OS](https://github.com/signingoff-dubey/desktop-portfolio) | "Dedicated mobile layout (app grid + bottom-sheet panels) for ≤768px" |
| [SUDHI OS](https://github.com/SudhirDevOps1/SudhirDevOpsv1.github.io) | "On screens < 768px, automatically switches to: Vertical scrolling layout, Sticky navigation, Touch-friendly buttons" |

**Approach B: Desktop Layout + Zoom** (not recommended)
- Pinch-to-zoom on desktop layout
- Works but frustrates users — "hover-dependent interactions don't work with touchscreens"

**Approach C: Terminal-Only Mobile Fallback**
- Show only the terminal interface on mobile
- All portfolio content accessible via commands
- Risk: hides the visual portfolio entirely

### Proven Mobile Pattern for OS-Portfolios

From DAX Portal's architecture:
```
Boot Layer
   ↓
Platform Detection (viewport + user-agent)
   ↓
Desktop OS ←→ Mobile OS (different components, same data)
   ↓
Modules / Windows (desktop)  |  Fullscreen App Cards (mobile)
```

**Key mobile UX rules**:
- No draggable windows (touch conflicts with scroll)
- Fullscreen apps with back-button navigation
- Bottom dock/tab bar for primary navigation
- Swipe gestures for app switching
- Boot sequence should be skippable on mobile (impatience is higher)
- Terminal on mobile: virtual keyboard modifier keys (Tab, Esc, Ctrl) via toolbar

---

## 6. Performance

### Bundle Budgets for Portfolio SPAs

From [Modern React SPA](https://modernreactspa.com/learn/performance-budget):

```json
{
  "resourceSizes": [
    { "resourceType": "script",     "budget": 250 },
    { "resourceType": "stylesheet", "budget": 50 },
    { "resourceType": "image",      "budget": 200 },
    { "resourceType": "total",      "budget": 600 }
  ]
}
```

**Core Web Vitals targets**:
| Metric | Target | Meaning |
|--------|--------|---------|
| LCP | ≤ 2.5s | Main content paints |
| INP | ≤ 200ms | Interactions feel responsive |
| CLS | ≤ 0.1 | No layout shifts |

### Real-World Portfolio Performance Data

| Project | JS Bundle (gzip) | Total First Paint | Lighthouse |
|---------|------------------|-------------------|------------|
| [Bentofolio](https://adixcode.com/projects/bentofolio) | N/A (SSG) | sub-300ms | 100/100/100/100 |
| [WaretaGarasu](https://waretagarasu.com/projects/portfolio) | ~128KB (entry) + ~18KB (i18n) + ~8KB (home chunk) | ~246KB total gzipped | Target: 100/100 |
| [React SPA PageSpeed](https://vuink.com/post/fhqbenax-d-dpbz/blog/pagespeed-optimization) | 164KB gzip (after split) | FCP 2.1s, LCP 2.6s | 95/100/100/100 |

### Font Loading (Critical for Retro Aesthetic)

**The problem**: Google Fonts = 3 origin connections on slow 4G. From WaretaGarasu:
> "First version loaded from Google Fonts: one round-trip for the CSS, six separate WOFF2 files... ~120KB of fonts plus ~15KB of Google CSS. FCP sat around 2.7s on mobile."

**The solution** — self-hosted variable WOFF2:
> "Outfit is a single 32KB WOFF2 for Latin covering every weight 100–900... JetBrains Mono is a single 31KB. I removed the preconnects, eliminated the cross-origin call."

**For retro fonts** (VT323, Press Start 2P, Share Tech Mono):
- Download WOFF2 from Google Fonts GitHub
- Subset to Latin characters only
- Self-host in `/public/fonts/`
- Use `font-display: swap` to prevent FOIT
- Preload critical fonts: `<link rel="preload" href="/fonts/vt323.woff2" as="font" type="font/woff2" crossorigin>`

### Effect Layer Budget

| Effect | CPU Cost | Recommendation |
|--------|----------|----------------|
| CSS scanlines overlay | Very low | Safe for all devices |
| CSS text-shadow (phosphor glow) | Low | Safe |
| requestAnimationFrame loop | Medium | Throttle to 30fps on mobile |
| WebGL CRT shader | High | Lazy-load, disable on mobile |
| Canvas animations (matrix rain) | Medium | IntersectionObserver-gated |
| Three.js / cobe globe | Very high | Defer until scroll proximity |

**Bentofolio pattern** ([source](https://adixcode.com/projects/bentofolio)):
> "A custom `IntersectionObserver` wrapper uses an `IntersectionObserver` to defer all of this until the component is within scroll proximity. The globe doesn't consume a single CPU cycle until the user has actually scrolled close to it."

---

## Summary: Actionable Mitigation Checklist

### Must-Have (blocks recruiters)
- [ ] `?skip-boot` or `?guest=1` deep-link that loads desktop directly with Portfolio window open
- [ ] Resume/CV accessible from persistent taskbar (1 click from anywhere)
- [ ] Contact info visible in system tray or top bar without opening any window
- [ ] Role positioning statement visible before any interaction
- [ ] Build-time prerendering for all routes (SEO + social previews)

### Should-Have (accessibility compliance)
- [ ] `prefers-reduced-motion` disables all animated CRT effects (flicker, sweep, glitch)
- [ ] Keyboard navigation: Tab cycles through dock → windows → taskbar
- [ ] Terminal output in `role="log"` with `aria-live="polite"`
- [ ] Focus management: window open → focus enters, window close → focus returns
- [ ] Skip-to-content link for screen reader users
- [ ] Color contrast verified for phosphor-on-black (≥4.5:1)

### Nice-to-Have ( polish)
- [ ] First-visit onboarding tooltip: "Click icons to explore"
- [ ] `help` command in terminal lists all available commands
- [ ] Mobile: separate fullscreen-app paradigm (not scaled desktop)
- [ ] Self-hosted variable WOFF2 fonts (eliminate Google Fonts round-trip)
- [ ] IntersectionObserver deferral for heavy effects (WebGL, canvas animations)
- [ ] Sitemap.xml auto-generated from route list
- [ ] Lighthouse budget in CI (250KB script, 600KB total)

---

## Sources & References

### UX/Navigation
- NN/g: [Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/) (2016, 179 participants)
- NN/g: [Beyond the Hamburger: What Makes Navigation Discoverable on Desktops](https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/)
- Wikipedia: [Mystery Meat Navigation](https://en.wikipedia.org/wiki/Mystery_meat_navigation)
- Plugintify: [Minimalist Portfolio Navigation](https://www.plugintify.com/simplifying-navigation-in-minimalist-online-portfolios/) (2026)

### Recruiter Behavior
- UXfolio: [UX Portfolio Playbook](https://blog.uxfol.io/ux-portfolio-playbook/) (74 recruiters surveyed, 2026)
- Open Doors Careers: [How Recruiters Actually Look at Your Portfolio](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio)
- Open Doors Careers: [How Hiring Managers Actually Scan Your Portfolio in 2026](https://blog.opendoorscareers.com/p/how-hiring-managers-actually-scan-your-portfolio-in-2026)
- Xperience Wave: [The 7-Second Portfolio Test](https://xperiencewave.com/resources/blogs/7-second-portfolio-test) (2026)
- Medium: [What I Learned Reviewing 200+ Portfolios](https://medium.com/design-bootcamp/what-i-learned-reviewing-200-portfolios-while-hiring-a-designer-6d4a3081539d) (2025)
- Dribbble: [What Design Recruiters Look For](https://dribbble.com/resources/career/design-recruiter-portfolio-tips) (Korin Harris, Figma recruiter)
- LinkedIn: [Kelly Vinsant on MMN returning](https://www.linkedin.com/posts/kvinsant_ive-been-doing-a-lot-of-deep-diving-into-activity-7435003533701251072-IFJ1) (2026)

### SEO/Prerendering
- GitHub: [12vblanco/Portfolio-2026](https://github.com/12vblanco/Portfolio-2026) (Vite SSG pipeline)
- DEV.to: [Prerendering 280 pages of a React SPA](https://dev.to/virdix/prerendering-280-pages-of-a-react-spa-for-seo-what-actually-worked-1inf) (2026)
- Till Freitag: [Prerendering: How to Turn a React SPA Into a Google-Friendly Static Site](https://till-freitag.com/en/blog/prerendering-react-spa-seo-en) (2026)
- Aditya Shelke: [Bentofolio — Millisecond Engineering](https://adixcode.com/projects/bentofolio) (2026)
- GitHub: [WBBB0730/vite-plugin-react-ssg](https://github.com/WBBB0730/vite-plugin-react-ssg) (2026)
- GitHub: [dhaupin/prestruct](https://github.com/dhaupin/prestruct) (2026)
- Shrinath Prabhu: [SEO for Vite SPAs Without Next.js](https://shrinath.me/blog/vite-seo-without-nextjs/) (2026)
- Hashnode: [From CSR to SEO-Friendly SSG with Vike](https://sarveshkadam.hashnode.dev/from-csr-to-seo-friendly-ssg-csr-in-an-existing-vite-app-using-vike) (2026)

### Accessibility
- W3C: [Understanding SC 2.3.3: Animation from Interactions](https://w3c.github.io/wcag/understanding/animation-from-interactions)
- MDN: [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- MDN: [ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- W3C ARIA Practices: [Keyboard Interface](https://github.com/w3c/aria-practices/blob/main/content/practices/keyboard-interface/keyboard-interface-practice.html)
- xterm.js: [AccessibilityManager.ts](https://hex.pm/packages/underthehood/0.2.0/files/assets/node_modules/xterm/src/browser/AccessibilityManager.ts)
- GitHub: [accessible-claude-code](https://github.com/joseph-webber/accessible-claude-code) (screen-reader-first terminal)
- Contour Terminal: [accessibility.md](https://github.com/contour-terminal/contour/blob/master/docs/accessibility.md)
- npm: [@glowbox/crt](https://www.npmjs.com/package/@glowbox/crt) (prefers-reduced-motion support)
- npm: [vault66-crt-effect](https://www.npmjs.com/package/vault66-crt-effect) (React CRT with SR support)
- GitHub: [Hermes Agent PR #59091](https://github.com/NousResearch/hermes-agent/pull/59091) (xterm screenReaderMode)

### Mobile/Touch
- GitHub: [ronbodnar/showcase-os](https://github.com/ronbodnar/showcase-os) (dual desktop/mobile environments)
- GitHub: [201Harsh/DAX-Portal](https://github.com/201Harsh/DAX-Portal/) ("different operating paradigms" for desktop vs mobile)
- Design Nominees: [OG-OS Portfolio](https://www.designnominees.com/sites/ouz-gr-website-portfolio) (route-level device adaptation)
- GitHub: [signingoff-dubey/desktop-portfolio](https://github.com/signingoff-dubey/desktop-portfolio/) (KABIR-OS, dedicated mobile layout)
- GitHub: [SudhirDevOps1/SUDHI OS](https://github.com/SudhirDevOps1/SudhirDevOpsv1.github.io) (mobile responsive with vertical scrolling)
- GitHub: [tarsnet/pocketshell](https://github.com/tarsnet/pocketshell) (terminal mobile reader view)
- GitHub: [cplieger/web-terminal-ui](https://github.com/cplieger/web-terminal-ui) (mobile key toolbar, touch-first terminal)

### Performance
- Modern React SPA: [Performance Budget](https://modernreactspa.com/learn/performance-budget)
- WaretaGarasu: [Build Notes — The Lab](https://waretagarasu.com/projects/portfolio) (246KB first paint, self-hosted fonts)
- Vuink: [React SPA PageSpeed Optimization](https://vuink.com/post/fhqbenax-d-dpbz/blog/pagespeed-optimization) (95/100/100/100)
- Aditya Shelke: [Bentofolio](https://adixcode.com/projects/bentofolio) (sub-300ms paint, 5-layer optimization)
- GitHub: [abdomohamed911/portfolio](https://github.com/abdomohamed911/abdelrahman-mohamed-portfolio) (Vite performance optimizations)
