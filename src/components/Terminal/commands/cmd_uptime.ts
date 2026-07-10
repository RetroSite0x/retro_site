import type { CommandHandler } from '../../../types/terminal';

// Fixed system start: July 1, 2026 (the "epoch" for this retro system)
const SYSTEM_START = new Date('2026-07-01T00:00:00Z').getTime();

export const cmd_uptime: CommandHandler = () => {
  const now = Date.now();
  const uptimeMs = now - SYSTEM_START;

  // Clamp to prevent negative uptime
  const safeUptime = Math.max(0, uptimeMs);

  const totalSeconds = Math.floor(safeUptime / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  const nowDate = new Date(now);
  const timeStr = nowDate.toLocaleTimeString('en-US', { hour12: false });

  // Generate a deterministic-ish load average
  const load1 = (0.1 + (totalMinutes % 100) / 100).toFixed(2);
  const load5 = (0.2 + (totalMinutes % 60) / 100).toFixed(2);
  const load15 = (0.3 + (totalMinutes % 40) / 100).toFixed(2);

  const uptimeStr = totalDays > 0
    ? `${totalDays} days, ${hours}:${minutes.toString().padStart(2, '0')}`
    : `${hours}:${minutes.toString().padStart(2, '0')}`;

  return {
    type: 'output',
    content: ` ${timeStr} up ${uptimeStr}, 1 user, load average: ${load1}, ${load5}, ${load15}`,
  };
};
