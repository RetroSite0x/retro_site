import type { CommandHandler, CommandResult } from '../../../types/terminal';
import { useTerminalStore } from '../../../store/useTerminal';

export const cmd_alias: CommandHandler = (args, _flags, _ctx): CommandResult => {
  const aliases = useTerminalStore.getState().aliases;

  if (args.length === 0) {
    const lines = Object.entries(aliases).map(([k, v]) => `${k}='${v}'`);
    return { type: 'output', content: lines.length > 0 ? lines.join('\n') : 'No aliases defined.' };
  }

  const [assignment] = args;
  const eqIdx = assignment.indexOf('=');
  if (eqIdx === -1) {
    const val = aliases[assignment];
    if (val) return { type: 'output', content: `${assignment}='${val}'` };
    return { type: 'error', content: `alias: ${assignment}: not found` };
  }

  const name = assignment.slice(0, eqIdx);
  const value = assignment.slice(eqIdx + 1).replace(/^['"]|['"]$/g, '');
  useTerminalStore.setState((s) => ({
    aliases: { ...s.aliases, [name]: value },
  }));
  return { type: 'output', content: '' };
};

export const cmd_unalias: CommandHandler = (args, _flags, _ctx): CommandResult => {
  if (args.length === 0) return { type: 'error', content: 'unalias: usage: unalias name' };
  const name = args[0];
  useTerminalStore.setState((s) => {
    const { [name]: _, ...rest } = s.aliases;
    return { aliases: rest };
  });
  return { type: 'output', content: '' };
};
