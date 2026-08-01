import { registerCommand } from '../CommandRegistry';
import { cmd_help } from './cmd_help';
import { cmd_ls } from './cmd_ls';
import { cmd_cd } from './cmd_cd';
import { cmd_cat } from './cmd_cat';
import { cmd_clear } from './cmd_clear';
import { cmd_sysinfo } from './cmd_sysinfo';
import { cmd_pwd } from './cmd_pwd';
import { cmd_theme } from './cmd_theme';

import { cmd_about } from './cmd_about';
import { cmd_projects } from './cmd_projects';
import { cmd_research } from './cmd_research';
import { cmd_papers } from './cmd_papers';
import { cmd_datasets } from './cmd_datasets';
import { cmd_experience } from './cmd_experience';
import { cmd_skills } from './cmd_skills';
import { cmd_timeline } from './cmd_timeline';
import { cmd_resume } from './cmd_resume';
import { cmd_github } from './cmd_github';
import { cmd_linkedin } from './cmd_linkedin';
import { cmd_contact } from './cmd_contact';
import { cmd_blog } from './cmd_blog';
import { cmd_tree } from './cmd_tree';
import { cmd_man } from './cmd_man';

export function registerAllCommands() {
  registerCommand('help', cmd_help);
  registerCommand('ls', cmd_ls);
  registerCommand('cd', cmd_cd);
  registerCommand('cat', cmd_cat);
  registerCommand('clear', cmd_clear);
  registerCommand('sysinfo', cmd_sysinfo);
  registerCommand('pwd', cmd_pwd);
  registerCommand('theme', cmd_theme);

  registerCommand('about', cmd_about);
  registerCommand('projects', cmd_projects);
  registerCommand('research', cmd_research);
  registerCommand('papers', cmd_papers);
  registerCommand('datasets', cmd_datasets);
  registerCommand('experience', cmd_experience);
  registerCommand('skills', cmd_skills);
  registerCommand('timeline', cmd_timeline);
  registerCommand('resume', cmd_resume);
  registerCommand('github', cmd_github);
  registerCommand('linkedin', cmd_linkedin);
  registerCommand('contact', cmd_contact);
  registerCommand('blog', cmd_blog);
  registerCommand('tree', cmd_tree);
  registerCommand('man', cmd_man);
}
