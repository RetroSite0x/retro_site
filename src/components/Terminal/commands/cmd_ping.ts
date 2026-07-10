import type { CommandHandler } from '../../../types/terminal';

const DEFAULT_HOST = 'nabil.iam.bd';
const DEFAULT_IP = '192.168.1.42';

export const cmd_ping: CommandHandler = (args) => {
  const host = args[0] || DEFAULT_HOST;

  const content = [
    `PING ${host} (${DEFAULT_IP}): 56 data bytes`,
    `64 bytes from ${DEFAULT_IP}: icmp_seq=0 ttl=64 time=0.042ms`,
    `64 bytes from ${DEFAULT_IP}: icmp_seq=1 ttl=64 time=0.038ms`,
    `64 bytes from ${DEFAULT_IP}: icmp_seq=2 ttl=64 time=0.041ms`,
    `64 bytes from ${DEFAULT_IP}: icmp_seq=3 ttl=64 time=0.040ms`,
    '',
    `--- ${host} ping statistics ---`,
    '5 packets transmitted, 5 packets received, 0.0% packet loss',
    'round-trip min/avg/max/stddev = 0.038/0.040/0.042/0.002 ms',
  ].join('\n');

  return { type: 'output', content };
};
