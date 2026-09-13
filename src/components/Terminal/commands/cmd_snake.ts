import type { CommandHandler } from '../../../types/terminal';

export const cmd_snake: CommandHandler = (_args, _flags, { terminal }) => {
  terminal.startGame('snake');
  return {
    type: 'system',
    content:
      'snake: arrows / WASD to steer, Space to pause, Esc to quit. Touch players: use the on-screen D-pad.',
  };
};
