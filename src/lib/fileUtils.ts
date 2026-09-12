export type FileNodeType = 'dir' | 'file' | 'link' | 'exec' | 'pipe' | 'socket' | 'unknown';

const TYPE_INDICATORS: Record<FileNodeType, string> = {
  dir: '/',
  link: '@',
  exec: '*',
  pipe: '|',
  socket: '=',
  file: '',
  unknown: '?',
};

const TYPE_COLORS: Record<FileNodeType, string> = {
  dir: 'var(--color-dir, #5599ff)',
  link: 'var(--color-link, #00cccc)',
  exec: 'var(--color-exe, #44cc44)',
  pipe: 'var(--color-pipe, #cc8800)',
  socket: 'var(--color-socket, #cc44cc)',
  file: 'var(--color-file, inherit)',
  unknown: 'var(--color-unknown, #cc4444)',
};

const EXT_COLORS: Record<string, string> = {
  '.ts': '#3178c6',
  '.tsx': '#3178c6',
  '.js': '#f7df1e',
  '.jsx': '#f7df1e',
  '.py': '#3776ab',
  '.go': '#00add8',
  '.rs': '#dea584',
  '.c': '#555555',
  '.cpp': '#555555',
  '.h': '#555555',
  '.java': '#b07219',
  '.rb': '#cc342d',
  '.php': '#4f5d95',
  '.sh': '#89e051',
  '.bash': '#89e051',
  '.zsh': '#89e051',
  '.md': '#083fa1',
  '.txt': '#666666',
  '.json': '#292929',
  '.yaml': '#cb171e',
  '.yml': '#cb171e',
  '.toml': '#9c4221',
  '.css': '#563d7c',
  '.html': '#e34c26',
  '.svg': '#ffb13b',
  '.png': '#a374c7',
  '.jpg': '#a374c7',
  '.jpeg': '#a374c7',
  '.gif': '#a374c7',
  '.pdf': '#ff0000',
  '.zip': '#eca517',
  '.tar': '#eca517',
  '.gz': '#eca517',
};

export function getFileType(node: { type: string; name: string; content?: string }): FileNodeType {
  if (node.type === 'directory') return 'dir';
  const name = node.name.toLowerCase();
  if (name.endsWith('.sh') || name.endsWith('.bash') || name.endsWith('.zsh')) return 'exec';
  if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') ||
      name.endsWith('.jsx') || name.endsWith('.py') || name.endsWith('.go') ||
      name.endsWith('.rs') || name.endsWith('.c') || name.endsWith('.cpp') ||
      name.endsWith('.java') || name.endsWith('.rb') || name.endsWith('.php')) return 'exec';
  return 'file';
}

export function getTypeIndicator(nodeType: FileNodeType): string {
  return TYPE_INDICATORS[nodeType];
}

export function getTypeColor(nodeType: FileNodeType): string {
  return TYPE_COLORS[nodeType];
}

export function getExtColor(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return EXT_COLORS[ext] || 'inherit';
}

export function formatPermissions(mode: string): string {
  if (!mode || mode.length < 3) return 'rwxr-xr-x';
  const pad = mode.padEnd(3, '7');
  const octals = pad.split('').map((c) => parseInt(c, 8));
  const bits = octals.map((o) => [
    o & 4 ? 'r' : '-',
    o & 2 ? 'w' : '-',
    o & 1 ? 'x' : '-',
  ].join('')).join('');
  return bits;
}

export function formatPermissionsFromBits(isDir: boolean, mode?: string): string {
  const typeChar = isDir ? 'd' : '-';
  const perms = formatPermissions(mode || '755');
  return typeChar + perms;
}

export function coolsize(bytes: number): string {
  if (bytes === 0) return '0B';
  const units = ['B', 'K', 'M', 'G', 'T', 'P'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  if (i === 0) return `${size}${units[i]}`;
  return `${size.toFixed(size >= 10 ? 0 : 1)}${units[i]}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Jan 01 00:00';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Jan 01 00:00';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day} ${hours}:${mins}`;
}

export function padRight(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

export function padLeft(str: string, len: number): string {
  return str.length >= len ? str : ' '.repeat(len - str.length) + str;
}
