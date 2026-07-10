import type { CommandHandler } from '../../../types/terminal';

const PROJECTS = [
  { name: 'AutoMLBench', lang: 'Python', status: 'ACTIVE', desc: 'Automated ML Model Benchmarking framework' },
  { name: 'TidyFlow', lang: 'Python', status: 'ACTIVE', desc: 'Lightweight Data Preprocessing Toolbox' },
  { name: 'FireViz', lang: 'Python', status: 'ACTIVE', desc: 'Fast & Simple Data Visualization library' },
  { name: 'NLP News Rec.', lang: 'Python', status: 'ACTIVE', desc: 'NLP-based news recommendation system' },
  { name: 'Disease Predictor', lang: 'Python', status: 'ACTIVE', desc: 'AI-powered disease prediction' },
  { name: 'Movie Recommender', lang: 'Python', status: 'ACTIVE', desc: 'Intelligent movie recommendation engine' },
];

export const cmd_projects: CommandHandler = () => {
  const lines: string[] = [
    'PROJECTS',
    '\u2550'.repeat(40),
  ];

  for (const p of PROJECTS) {
    lines.push(`  ${p.name.padEnd(20)} ${p.lang.padEnd(8)} ${p.status}`);
    lines.push(`    ${p.desc}`);
    lines.push('');
  }

  lines.push("Use 'cat /projects/<name>/README.md' for details.");

  return { type: 'output', content: lines.join('\n') };
};
