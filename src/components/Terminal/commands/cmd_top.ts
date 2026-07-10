import type { CommandHandler } from '../../../types/terminal';

export const cmd_top: CommandHandler = () => {
  const content = [
    'top - 14:32:07 up 42 days,  3:17,  1 user,  load average: 0.42, 0.31, 0.28',
    'Tasks:   6 total,   1 running,   5 sleeping,   0 stopped,   0 zombie',
    '%Cpu(s):  2.1 us,  0.3 sy,  0.0 ni, 97.3 id,  0.3 wa,  0.0 hi,  0.0 si',
    'MiB Mem :   6144.0 total,   2048.0 free,   2048.0 used,   2048.0 buff/cache',
    'MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   4096.0 avail Mem',
    '',
    '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
    '  256 guest     20   0   65536  16384   8192 S   1.7  25.0   0:04.82 nabil-httpd',
    '   42 guest     20   0    8192   2048   1024 R   2.1   3.1   0:00.15 nabilsh',
    ' 1024 root      20   0  131072  32768  16384 S   0.5  50.0   0:12.91 nabil-wm',
    '  128 guest     20   0   32768   8192   4096 S   0.3  12.5   0:01.07 node',
    '  512 guest     20   0   16384   4096   2048 S   0.0   6.2   0:00.33 cron',
    '    1 root      20   0   16384   4096   2048 S   0.0   6.2   0:02.41 init',
  ].join('\n');

  return { type: 'output', content };
};
