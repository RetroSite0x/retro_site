import { registerCommand } from '../CommandRegistry';
import { cmd_help } from './cmd_help';
import { cmd_ls } from './cmd_ls';
import { cmd_cd } from './cmd_cd';
import { cmd_cat } from './cmd_cat';
import { cmd_clear } from './cmd_clear';
import { cmd_sysinfo } from './cmd_sysinfo';
import { cmd_pwd } from './cmd_pwd';
import { cmd_echo } from './cmd_echo';
import { cmd_grep } from './cmd_grep';
import { cmd_theme } from './cmd_theme';
import { cmd_mkdir } from './cmd_mkdir';
import { cmd_touch } from './cmd_touch';

export function registerAllCommands() {
  registerCommand('help', cmd_help);
  registerCommand('ls', cmd_ls);
  registerCommand('cd', cmd_cd);
  registerCommand('cat', cmd_cat);
  registerCommand('clear', cmd_clear);
  registerCommand('sysinfo', cmd_sysinfo);
  registerCommand('pwd', cmd_pwd);
  registerCommand('echo', cmd_echo);
  registerCommand('grep', cmd_grep);
  registerCommand('theme', cmd_theme);
  registerCommand('mkdir', cmd_mkdir);
  registerCommand('touch', cmd_touch);
}
