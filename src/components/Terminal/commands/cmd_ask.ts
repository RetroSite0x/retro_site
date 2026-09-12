import type { CommandHandler } from '../../../types/terminal';
import { beni, focusAreas, skills, experience, education, papers } from '../../../data/portfolio';

const TOPICS: Record<string, { keywords: string[]; answer: string }> = {
  beni: {
    keywords: ['beni', 'economic narrative', 'narrative index', 'corpus', 'bangladesh economic'],
    answer: [
      `BENI = ${beni.fullName}`,
      ``,
      `A large-scale economic narrative analysis dataset sourced from`,
      `Bangladeshi newspapers. ${beni.banglaArticles} Bangla articles`,
      `spanning 2014-2024 from ${beni.sources}.`,
      ``,
      `BENI Global 10 extends this to a ${beni.global10Languages}-language`,
      `corpus (${beni.global10Families} language families), covering`,
      `${beni.global10Articles} articles from the Global South.`,
      `arXiv: ${beni.arxivId}`,
    ].join('\n'),
  },
  research: {
    keywords: ['research', 'focus', 'area', 'study', 'field'],
    answer: [
      `RESEARCH FOCUS AREAS`,
      `${'='.repeat(40)}`,
      ...focusAreas.map((a) => `  > ${a}`),
      ``,
      `Core mission: Building NLP resources for low-resource languages,`,
      `with emphasis on Bangla and economic discourse analysis.`,
    ].join('\n'),
  },
  skills: {
    keywords: ['skill', 'tech', 'stack', 'tool', 'language', 'proficiency'],
    answer: [
      `TECHNICAL SKILLS`,
      `${'='.repeat(40)}`,
      ...skills.map(
        (cat) =>
          `  ${cat.category}: ${cat.items.join(', ')}`
      ),
    ].join('\n'),
  },
  experience: {
    keywords: ['experience', 'work', 'job', 'role', 'career', 'position', 'intern'],
    answer: [
      `WORK EXPERIENCE`,
      `${'='.repeat(40)}`,
      ...experience.map(
        (e) =>
          [
            `  ${e.role} @ ${e.org}`,
            `  [${e.period}]`,
            ...e.bullets.map((b) => `    - ${b}`),
            ``,
          ].join('\n')
      ),
    ].join('\n'),
  },
  education: {
    keywords: ['education', 'degree', 'university', 'school', 'study', 'academic'],
    answer: [
      `EDUCATION`,
      `${'='.repeat(40)}`,
      ...education.map(
        (e) => `  ${e.degree} — ${e.institution} (${e.years})`
      ),
    ].join('\n'),
  },
  publications: {
    keywords: ['publication', 'paper', 'arxiv', 'journal', 'published', 'published paper', 'work'],
    answer: [
      `PUBLICATIONS`,
      `${'='.repeat(40)}`,
      ...papers.map(
        (p, i) =>
          [
            `  [${i + 1}] "${p.title}"`,
            `      ${p.venue} — ${p.year}`,
            ``,
          ].join('\n')
      ),
    ].join('\n'),
  },
  goals: {
    keywords: ['goal', 'future', 'plan', 'ambition', 'next', 'upcoming'],
    answer: [
      `FUTURE GOALS`,
      `${'='.repeat(40)}`,
      `  > Expand BENI to 50+ Global South languages`,
      `  > Build open-source Bangla NLP toolkit`,
      `  > PhD in Computational Social Science`,
      `  > Bridge economics and NLP for policy analysis`,
      `  > Mentor next-gen Bangla NLP researchers`,
    ].join('\n'),
  },
};

function matchTopic(input: string): string | null {
  const lower = input.toLowerCase();
  for (const [key, topic] of Object.entries(TOPICS)) {
    if (topic.keywords.some((kw) => lower.includes(kw))) {
      return key;
    }
  }
  return null;
}

const HELP = [
  `ask — AI-powered knowledge base`,
  ``,
  `Usage: ask <topic>`,
  ``,
  `Available topics:`,
  `  beni          — What is BENI?`,
  `  research      — Research focus areas`,
  `  skills        — Technical skills`,
  `  experience    — Work experience`,
  `  education     — Education history`,
  `  publications  — Published papers`,
  `  goals         — Future goals`,
  ``,
  `Example: ask "what is BENI?"`,
].join('\n');

export const cmd_ask: CommandHandler = (args) => {
  const query = args.join(' ').trim();

  if (!query) {
    return { type: 'output', content: HELP };
  }

  const matched = matchTopic(query);

  if (matched) {
    const topic = TOPICS[matched];
    return { type: 'output', content: topic.answer };
  }

  return {
    type: 'output',
    content: [
      `SYNAPSE ERROR: topic not found in neural database`,
      `> Query: "${query}"`,
      `> Try: ask (with no args) for available topics`,
    ].join('\n'),
  };
};
