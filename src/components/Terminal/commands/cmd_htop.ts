import type { CommandHandler } from '../../../types/terminal';

export const cmd_htop: CommandHandler = () => {
  const content = [
    '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
    '    1 root      20   0   16384   4096   2048 S   0.0   6.2   0:02.41 init',
    '   42 guest     20   0    8192   2048   1024 R   2.1   3.1   0:00.15 nabilsh',
    '  128 guest     20   0   32768   8192   4096 S   0.3  12.5   0:01.07 node',
    '  256 guest     20   0   65536  16384   8192 S   1.7  25.0   0:04.82 nabil-httpd',
    '  512 guest     20   0   16384   4096   2048 S   0.0   6.2   0:00.33 cron',
    ' 1024 root      20   0  131072  32768  16384 S   0.5  50.0   0:12.91 nabil-wm',
    '',
    'Mem[|||||||||||       4.0M/6.0M]   Load[0.42]   Uptime[42d]',
  ].join('\n');

  return { type: 'output', content };
};
