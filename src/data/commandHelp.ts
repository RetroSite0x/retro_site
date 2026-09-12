// One-line descriptions for every command, grouped by category.
// Used by cmd_help to render the full help listing.

export interface CommandHelpEntry {
  description: string;
  category: 'files' | 'portfolio' | 'system' | 'fun';
}

// All 38 registered commands + 5 registry easter eggs.
export const commandDescriptions: Record<string, CommandHelpEntry> = {
  // ── Files ──────────────────────────────────────────────────────
  ls:         { description: 'List directory contents',        category: 'files' },
  cd:         { description: 'Change directory',               category: 'files' },
  cat:        { description: 'Print file contents',            category: 'files' },
  pwd:        { description: 'Print working directory',        category: 'files' },
  grep:       { description: 'Search file contents',           category: 'files' },
  mkdir:      { description: 'Create directory',               category: 'files' },
  touch:      { description: 'Create empty file',              category: 'files' },
  echo:       { description: 'Print text',                     category: 'files' },
  tree:       { description: 'Display directory tree',         category: 'files' },
  // ── Portfolio ──────────────────────────────────────────────────
  about:      { description: 'Display user profile',           category: 'portfolio' },
  skills:     { description: 'List technical skills',          category: 'portfolio' },
  contact:    { description: 'Display contact information',    category: 'portfolio' },
  projects:   { description: 'List portfolio projects',        category: 'portfolio' },
  papers:     { description: 'List publications',              category: 'portfolio' },
  datasets:   { description: 'List published datasets',        category: 'portfolio' },
  experience: { description: 'Show work experience',           category: 'portfolio' },
  research:   { description: 'Display research interests',     category: 'portfolio' },
  resume:     { description: 'Display resume',                 category: 'portfolio' },
  github:     { description: 'Show GitHub profile',            category: 'portfolio' },
  linkedin:   { description: 'Show LinkedIn profile',          category: 'portfolio' },
  blog:       { description: 'List blog posts',                category: 'portfolio' },
  timeline:   { description: 'Show career timeline',           category: 'portfolio' },
  gui:        { description: 'Open portfolio dashboard window', category: 'portfolio' },
  memoire:    { description: 'Open the public bulletin board',   category: 'portfolio' },
  now:        { description: 'Show what I\'m working on now',   category: 'portfolio' },
  // ── System ─────────────────────────────────────────────────────
  sysinfo:    { description: 'Print system information',       category: 'system' },
  help:       { description: 'Show this help message',         category: 'system' },
  clear:      { description: 'Clear terminal',                 category: 'system' },
  theme:      { description: 'Switch phosphor theme',          category: 'system' },
  man:        { description: 'Display manual page',            category: 'system' },
  uptime:     { description: 'Show system uptime',             category: 'system' },
  hostname:   { description: 'Show system hostname',           category: 'system' },
  neofetch:   { description: 'System info with ASCII art',     category: 'system' },
  top:        { description: 'Display running processes',      category: 'system' },
  htop:       { description: 'Interactive process viewer',     category: 'system' },
  ping:       { description: 'Simulated ICMP echo requests',   category: 'system' },
  curl:       { description: 'Simulated HTTP requests',        category: 'system' },
  weather:    { description: 'Display weather for Dhaka',      category: 'system' },
  wallpaper:  { description: 'Switch desktop wallpaper',       category: 'system' },
  // ── Fun ────────────────────────────────────────────────────────
  fortune:    { description: 'Display a random fortune',       category: 'fun' },
  cowsay:     { description: 'Cow says something',             category: 'fun' },
  matrix:     { description: 'Matrix digital rain effect',     category: 'fun' },
  // ── Registry easter eggs (not registered, handled inline) ─────
  whoami:     { description: 'Display current user',           category: 'system' },
  uname:      { description: 'Print system info',              category: 'system' },
  exit:       { description: 'Logout',                         category: 'system' },
  reboot:     { description: 'Reboot system',                  category: 'system' },
  sudo:       { description: 'Superuser do (denied)',          category: 'system' },
};

export const categoryLabels: Record<string, string> = {
  files:     'Files',
  portfolio: 'Portfolio',
  system:    'System',
  fun:       'Fun',
};
