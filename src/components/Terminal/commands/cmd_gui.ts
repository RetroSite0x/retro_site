import type { CommandHandler } from '../../../types/terminal';
import { useWindowsStore } from '../../../store/useWindows';

export const cmd_gui: CommandHandler = () => {
  useWindowsStore.getState().openWindow({
    title: 'Dashboard',
    content: { type: 'dashboard' },
    width: 820,
    height: 560,
  });

  return { type: 'output', content: 'Opening portfolio dashboard...' };
};
