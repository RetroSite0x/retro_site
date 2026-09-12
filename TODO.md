# Future Enhancements

## High Priority

- [ ] **Clipboard integration** — Wire Ctrl+C/V to `navigator.clipboard` API. Currently no copy/paste support.
- [ ] **Keyboard menu navigation** — Arrow keys should traverse menu bar items and submenus. Only Escape closes menus now.
- [ ] **EDIT menu functionality** — Cut/Copy/Paste/Select All are stub no-ops. Either implement or remove.

## Medium Priority

- [ ] **Content VFS migration** — Move portfolio data (projects, papers, skills, etc.) from hardcoded command files to VFS nodes. Editable via terminal commands without touching source code.
- [ ] **Command tests** — Vitest suite for command parser, registry, fuzzy matching, and all 38 commands.
- [ ] **Structured command output** — Replace plain strings with rich output (tables, colors, clickable links). `outputLink` CSS class exists but no command uses it.
- [ ] **Real API integration** — Wire `weather`, `curl`, `ping` to actual endpoints with mock fallback when offline.

## Low Priority

- [ ] **Mobile/touch support** — Desktop paradigm doesn't work on touch devices. Needs tap-to-type, virtual keyboard handling, simplified layout.
- [ ] **CRT overlay optimization** — Replace 4 stacked DOM layers with a single `<canvas>` or SVG filter for better GPU performance on low-end devices.
- [ ] **`neofetch` improvements** — Add OS-detection theming and color blocks instead of static ASCII art.
- [ ] **Robust MOTD state** — Replace `let motdShown` module variable with Zustand persist or sessionStorage flag so it survives HMR and works correctly across sessions.

## Nice to Have

- [ ] **Command aliases** — Support `~/.bashrc`-style aliases (`alias ll='ls -la'`).
- [ ] **Tab completion cycling** — Cycle through multiple matches on repeated Tab presses instead of showing them all.
- [ ] **Pipe support** — `cat file.txt | grep keyword` chaining between commands.
- [ ] **Command history search** — Ctrl+R reverse incremental search through history.
- [ ] **Syntax highlighting** — Colorize output for `cat`, `tree`, `neofetch` etc.
- [ ] **Window snap/tiling** — Drag windows to screen edges to snap into halves or thirds.
- [ ] **Draggable desktop icons** — Current icon grid is static.
- [ ] **Sound effects for commands** — Typing sounds, completion chime, error buzz.
