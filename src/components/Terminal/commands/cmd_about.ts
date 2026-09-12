import type { CommandHandler } from '../../../types/terminal';
import { identity, education, focusSummary, motto } from '../../../data/portfolio';

const BOX_WIDTH = 48;

function pad(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - text.length));
}

export const cmd_about: CommandHandler = () => {
  const sep = '-'.repeat(BOX_WIDTH);
  const content = [
    `+${sep}+`,
    `|  ${pad(identity.displayName, BOX_WIDTH - 3)}|`,
    `|  ${pad(identity.role, BOX_WIDTH - 3)}|`,
    `+${sep}+`,
    `|  ${pad(`Location:  ${identity.location}`, BOX_WIDTH - 3)}|`,
    `|  ${pad(`Education: ${education[0].degree} (${education[0].institution})`, BOX_WIDTH - 3)}|`,
    `|  ${pad(`             ${education[1].degree} (${education[1].institution})`, BOX_WIDTH - 3)}|`,
    `|  ${pad(`Focus:     ${focusSummary}`, BOX_WIDTH - 3)}|`,
    `|  ${pad(`Status:    ${identity.status}`, BOX_WIDTH - 3)}|`,
    `+${sep}+`,
    '',
    motto,
  ].join('\n');

  return { type: 'output', content };
};
