import type { CommandHandler } from '../../../types/terminal';

const BAR_WIDTH = 30;

function bar(value: number, max: number): string {
  const filled = Math.round((value / max) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function frame(title: string, lines: string[]): string {
  const inner = Math.max(title.length + 4, ...lines.map(l => l.length));
  const top = '┌' + '─'.repeat(inner) + '┐';
  const bot = '└' + '─'.repeat(inner) + '┘';
  const pad = (s: string) => s + ' '.repeat(inner - s.length);
  const titleLine = '│ ' + pad(` ${title} `) + '│';
  const sep = '├' + '─'.repeat(inner) + '┤';
  const body = lines.map(l => '│ ' + pad(l) + '│');
  return [top, titleLine, sep, ...body, bot].join('\n');
}

function researchChart(): string {
  const data: [string, number][] = [
    ['Bangla NLP', 93.8],
    ['Economic Narrative Analysis', 85],
    ['Computational Social Science', 75],
    ['Multilingual LLMs', 70],
  ];
  const lines: string[] = [];
  for (const [label, pct] of data) {
    lines.push(` ${label}`);
    lines.push(` ${bar(pct, 100)} ${pct.toFixed(1)}%`);
    lines.push('');
  }
  lines.pop();
  return frame('RESEARCH AREAS', lines);
}

function skillsChart(): string {
  const data: [string, number][] = [
    ['Python', 95],
    ['NLP', 90],
    ['Data Science', 85],
    ['Automation', 88],
    ['Deep Learning', 80],
  ];
  const lines: string[] = [];
  for (const [label, score] of data) {
    lines.push(` ${label}`);
    lines.push(` ${bar(score, 100)} ${score}`);
    lines.push('');
  }
  lines.pop();
  return frame('SKILL PROFICIENCY', lines);
}

function papersChart(): string {
  const data: [string, string][] = [
    ['BENI Global 10', 'arXiv 2026'],
    ['BENI v1.0', 'HuggingFace 2026'],
    ['Thesis', 'JU 2024'],
  ];
  const maxLen = Math.max(...data.map(([t]) => t.length));
  const lines = data.map(([title, venue]) => {
    const pad = ' '.repeat(maxLen - title.length);
    return ` ${pad}${title}  │  ${venue}`;
  });
  return frame('PUBLICATIONS', lines);
}

const USAGE = `Usage: chart --[type]

  --research   Research area proficiency chart
  --skills     Technical skill proficiency chart
  --papers     Publication stats

  Example: chart --research`;

export const cmd_chart: CommandHandler = (_args, flags) => {
  if ('research' in flags) {
    return { type: 'output', content: researchChart() };
  }
  if ('skills' in flags) {
    return { type: 'output', content: skillsChart() };
  }
  if ('papers' in flags) {
    return { type: 'output', content: papersChart() };
  }
  return { type: 'output', content: USAGE };
};
