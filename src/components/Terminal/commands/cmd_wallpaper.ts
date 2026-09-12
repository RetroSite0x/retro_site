import type { CommandHandler } from '../../../types/terminal';
import { useSystemStore, type WallpaperId } from '../../../store/useSystem';

const VALID_WALLPAPERS: WallpaperId[] = ['ann', 'grid', 'circuit', 'none'];

export const cmd_wallpaper: CommandHandler = (args) => {
  if (args.length === 0) {
    const current = useSystemStore.getState().wallpaper;
    return {
      type: 'output',
      content: `Current wallpaper: ${current}\nAvailable: ${VALID_WALLPAPERS.join(', ')}`,
    };
  }

  const input = args[0].toLowerCase() as WallpaperId;
  if (!VALID_WALLPAPERS.includes(input)) {
    return {
      type: 'error',
      content: `wallpaper: '${args[0]}' is not a valid wallpaper. Available: ${VALID_WALLPAPERS.join(', ')}`,
    };
  }

  useSystemStore.getState().setWallpaper(input);
  return { type: 'output', content: `Wallpaper set to '${input}'.` };
};
