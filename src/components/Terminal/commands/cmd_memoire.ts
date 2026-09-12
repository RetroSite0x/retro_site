import type { CommandHandler } from '../../../types/terminal';
import { useWindowsStore } from '../../../store/useWindows';
import { createPost, validateMessage } from '../../../lib/memoire';

export function openMemoire(): void {
  useWindowsStore.getState().openWindow({
    title: 'memoire',
    content: { type: 'memoire' },
    width: 720,
    height: 520,
  });
}

export const cmd_memoire: CommandHandler = (args, flags, { system }) => {
  // --list / list: open the board window (MemoireBoard fetches & renders posts)
  if (flags.list === true || args[0] === 'list' || args[0] === '--list') {
    openMemoire();
    return {
      type: 'output',
      content: [
        '╔══════════════════════════════════════════════════╗',
        '║             📌 MEMOIRE BOARD                     ║',
        '║    Opening board window with recent posts...     ║',
        '╠══════════════════════════════════════════════════╣',
        '',
        '  Posts are displayed in the memoire board window.',
        '  Post with: memoire --post "Your message"',
        '╚══════════════════════════════════════════════════╝',
      ].join('\n'),
    };
  }

  // --post / post: pin a message
  if (flags.post !== undefined || args[0] === 'post' || args[0] === '--post') {
    // Extract message from flags or args
    let message = '';
    if (typeof flags.post === 'string') {
      message = flags.post;
    } else if (args[0] === 'post' || args[0] === '--post') {
      message = args.slice(1).join(' ');
    } else {
      message = args.join(' ');
    }

    message = message.trim();
    if (!message) {
      return { type: 'error', content: 'Usage: memoire --post "Your message"' };
    }

    // Pre-validate synchronously (validateMessage is sync)
    const msgErr = validateMessage(message);
    if (msgErr) {
      return { type: 'error', content: `memoire: ${msgErr}` };
    }

    const handle = system.username || 'guest';
    openMemoire();

    // Fire-and-forget: createPost is async but the command registry is sync.
    // The MemoireBoard window reflects the new post on its next render cycle.
    createPost(handle, message).catch(() => {
      // Errors swallowed — the board shows local data as fallback.
    });

    return {
      type: 'output',
      content: [
        '╔══════════════════════════════════════════════════╗',
        '║           ✓ MEMOIRE — Message Pinned             ║',
        '╠══════════════════════════════════════════════════╣',
        '',
        `  handle: ${handle}`,
        `  message: ${message}`,
        '',
        '  Pinned to the memoire board. Check the window!',
        '╚══════════════════════════════════════════════════╝',
      ].join('\n'),
    };
  }

  // No args: open the board
  if (args.length === 0 && Object.keys(flags).length === 0) {
    openMemoire();
    return { type: 'output', content: 'Opening memoire bulletin board...' };
  }

  // Invalid usage
  return {
    type: 'error',
    content: 'Usage: memoire [--list | --post "message"]',
  };
};
