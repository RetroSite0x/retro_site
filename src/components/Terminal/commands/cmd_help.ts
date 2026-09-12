import type { CommandHandler } from '../../../types/terminal';
import { getRegisteredCommands } from '../CommandRegistry';
import { commandDescriptions, categoryLabels } from '../../../data/commandHelp';

type CategoryKey = 'files' | 'portfolio' | 'system' | 'fun';

const CATEGORY_ORDER: CategoryKey[] = ['files', 'portfolio', 'system', 'fun'];

export const cmd_help: CommandHandler = () => {
  // Gather all known commands: registered + easter eggs in the map
  const registered = getRegisteredCommands();
  const allCmds = new Set([...registered, ...Object.keys(commandDescriptions)]);

  // Bucket by category
  const buckets: Record<CategoryKey, string[]> = {
    files: [],
    portfolio: [],
    system: [],
    fun: [],
  };

  for (const cmd of [...allCmds].sort()) {
    const entry = commandDescriptions[cmd];
    if (entry) {
      buckets[entry.category].push(`  ${cmd.padEnd(12)}${entry.description}`);
    } else {
      // Unknown command without a help entry — still show it
      buckets.system.push(`  ${cmd.padEnd(12)}(no description)`);
    }
  }

  const lines: string[] = ['Available commands:', ''];

  for (const cat of CATEGORY_ORDER) {
    const cmds = buckets[cat];
    if (cmds.length === 0) continue;
    lines.push(`  --- ${categoryLabels[cat]} ---`);
    lines.push(...cmds);
    lines.push('');
  }

  return { type: 'output', content: lines.join('\n') };
};
