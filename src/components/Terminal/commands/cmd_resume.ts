import type { CommandHandler } from '../../../types/terminal';
import {
  identity,
  education,
  experience,
  skills,
  projects,
  papers,
  focusAreas,
  links,
} from '../../../data/portfolio';

function buildResumeText(): string {
  const w = 60;
  const line = (ch: string) => ch.repeat(w);
  const center = (s: string) => {
    const pad = Math.max(0, Math.floor((w - s.length) / 2));
    return ' '.repeat(pad) + s;
  };
  const section = (title: string) =>
    ['', line('═'), center(title), line('═'), ''].join('\n');

  const parts: string[] = [];

  parts.push(center(identity.name));
  parts.push(center(identity.role));
  parts.push(center(`${identity.email} | ${identity.location}`));
  parts.push(center(links.website));
  parts.push('');

  parts.push(section('EDUCATION'));
  for (const e of education) {
    parts.push(`  ${e.degree}`);
    parts.push(`  ${e.institution} (${e.years})`);
    parts.push('');
  }

  parts.push(section('EXPERIENCE'));
  for (const e of experience) {
    parts.push(`  ${e.role} — ${e.org}`);
    parts.push(`  ${e.period}`);
    for (const b of e.bullets) {
      parts.push(`    • ${b}`);
    }
    parts.push('');
  }

  parts.push(section('RESEARCH FOCUS'));
  for (const f of focusAreas) {
    parts.push(`  • ${f}`);
  }
  parts.push('');

  parts.push(section('SKILLS'));
  for (const cat of skills) {
    parts.push(`  ${cat.category}: ${cat.items.join(', ')}`);
  }
  parts.push('');

  parts.push(section('PROJECTS'));
  for (const p of projects) {
    parts.push(`  ${p.name} [${p.status}] (${p.lang})`);
    parts.push(`    ${p.desc}`);
    parts.push('');
  }

  parts.push(section('PUBLICATIONS'));
  for (const p of papers) {
    parts.push(`  "${p.title}"`);
    parts.push(`  ${p.venue}, ${p.year}`);
    parts.push('');
  }

  parts.push(section('LINKS'));
  parts.push(`  GitHub:    ${links.githubResearch}`);
  parts.push(`  LinkedIn:  ${links.linkedin}`);
  parts.push(`  Website:   ${links.website}`);
  parts.push(`  X/Twitter: ${links.xHandle}`);
  parts.push(`  ORCID:     ${links.orcid}`);
  parts.push('');
  parts.push(line('─'));
  parts.push(center('Generated from retro UNIX portfolio'));

  return parts.join('\n');
}

export const cmd_resume: CommandHandler = (_args, flags, { vfs }) => {
  if (flags.pdf || flags.p) {
    const text = buildResumeText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AnnNaserNabil_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { type: 'output', content: 'Resume downloaded as AnnNaserNabil_Resume.txt' };
  }

  const content = vfs.readFile('/home/guest/resume.txt');

  if (content === null) {
    return { type: 'error', content: 'resume: No resume file found' };
  }

  return { type: 'output', content };
};
