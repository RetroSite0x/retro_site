// Canonical portfolio data — single source of truth for all terminal commands.

export interface EducationEntry {
  degree: string;
  institution: string;
  years: string;
}

export interface WorkRole {
  role: string;
  org: string;
}

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectEntry {
  name: string;
  lang: string;
  status: string;
  desc: string;
}

export interface PaperEntry {
  title: string;
  venue: string;
  year: string;
}

export interface DatasetEntry {
  name: string;
  desc: string;
  source: string;
}

export interface TimelineEntry {
  year: string;
  event: string;
}

export interface BlogEntry {
  file: string;
  title: string;
}

// ── Identity ───────────────────────────────────────────────────────────

export const identity = {
  name: 'Ann Naser Nabil',
  displayName: 'ANN NASER NABIL',
  role: 'NLP Researcher & AI Engineer',
  location: 'Dhaka, Bangladesh',
  email: 'ann.n.nabil@gmail.com',
  status: 'Online',
} as const;

// ── Links ──────────────────────────────────────────────────────────────

export const links = {
  githubResearch: 'https://github.com/nabil0x',
  githubEngineering: 'https://github.com/AnnNaserNabil',
  githubUsername: 'AnnNaserNabil',
  website: 'https://nabil.iam.bd',
  portfolio: 'https://nabil.ami.bd',
  academic: 'https://ann-naser-nabil.github.io',
  linkedin: 'https://linkedin.com/in/ann-naser-nabil',
  linkedinUsername: 'ann-naser-nabil',
  x: 'https://x.com/ann_naser',
  xHandle: '@ann_naser',
  orcid: '0009-0006-3561-045X',
  arxivSearch: 'https://arxiv.org/search/?query=Ann+Naser+Nabil',
  huggingface: 'https://huggingface.co/AnnNaserNabil',
  huggingfaceUsername: 'AnnNaserNabil',
} as const;

// ── Education ──────────────────────────────────────────────────────────

export const education: readonly EducationEntry[] = [
  { degree: 'MSc Economics', institution: 'Jahangirnagar University', years: '2024\u20132025' },
  { degree: 'BSc Economics', institution: 'Jahangirnagar University', years: '2018\u20132024' },
];

// ── Research Focus ─────────────────────────────────────────────────────

export const focusAreas: readonly string[] = [
  'Low-Resource Bangla NLP',
  'Multilingual LLMs',
  'Computational Social Science',
  'Economic Narrative Analysis',
];

export const focusSummary = 'Bangla NLP, Computational Social Sci';

// ── Work & Passion Roles ───────────────────────────────────────────────

export const workRoles: readonly WorkRole[] = [
  { role: 'Maintainer', org: 'LILA LAB' },
  { role: 'System Architect', org: 'Doshomik IELTS' },
  { role: 'AI Engineer', org: 'B2G Soft' },
  { role: 'Research Operation Lead', org: 'Research Den' },
  { role: 'Automation Operation Specialist', org: 'Khub Soja' },
  { role: 'Data Science Intern', org: 'Somikoron AI' },
];

// ── BENI ───────────────────────────────────────────────────────────────

export const beni = {
  fullName: 'Bangladesh Economic Narrative Index',
  shortName: 'BENI',
  banglaArticles: '1.47M+',
  globalCorpus: '10-language Global corpus',
  arxivId: '2606.10225',
  global10Articles: '620K+',
  global10Languages: 10,
  global10Families: 7,
  sources: 'Potrika (2014-2020), BNAD (2021-2024)',
} as const;

// ── Skills ─────────────────────────────────────────────────────────────

export const skills: readonly SkillCategory[] = [
  { category: 'Languages',  items: ['Python', 'SQL', 'Bash', 'JavaScript', 'TypeScript'] },
  { category: 'ML/AI',      items: ['NLP', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-Learn'] },
  { category: 'NLP',        items: ['spaCy', 'NLTK', 'Transformers', 'RAG', 'LLM Evaluation'] },
  { category: 'Automation', items: ['n8n', 'APIs', 'Webhooks', 'Workflow Automation'] },
  { category: 'Data',       items: ['Pandas', 'NumPy', 'Econometrics', 'Time Series'] },
  { category: 'Tools',      items: ['Git', 'Docker', 'FastAPI', 'Flask', 'Streamlit'] },
  { category: 'Databases',  items: ['PostgreSQL', 'MySQL', 'SQLite'] },
  { category: 'Research',   items: ['Bangla NLP', 'Economic Narrative Analysis', 'CSS'] },
];

// ── Projects ───────────────────────────────────────────────────────────

export const projects: readonly ProjectEntry[] = [
  { name: 'AutoMLBench',     lang: 'Python', status: 'ACTIVE', desc: 'Automated ML Model Benchmarking framework' },
  { name: 'TidyFlow',        lang: 'Python', status: 'ACTIVE', desc: 'Lightweight Data Preprocessing Toolbox' },
  { name: 'FireViz',         lang: 'Python', status: 'ACTIVE', desc: 'Fast & Simple Data Visualization library' },
  { name: 'NLP News Rec.',   lang: 'Python', status: 'ACTIVE', desc: 'NLP-based news recommendation system' },
  { name: 'Disease Predictor', lang: 'Python', status: 'ACTIVE', desc: 'AI-powered disease prediction' },
  { name: 'Movie Recommender', lang: 'Python', status: 'ACTIVE', desc: 'Intelligent movie recommendation engine' },
];

// ── Papers ─────────────────────────────────────────────────────────────

export const papers: readonly PaperEntry[] = [
  {
    title: 'BENI Global 10: Multilingual Economic Narrative Corpus for the Global South',
    venue: 'arXiv:2606.10225',
    year: '2026',
  },
  {
    title: 'BENI v1.0: Bangla Economic Narrative Index Dataset',
    venue: 'HuggingFace',
    year: '2026',
  },
  {
    title: 'Does Institutional Quality Matter for Financial Development?',
    venue: 'Undergraduate Thesis \u2014 Jahangirnagar University',
    year: '2024',
  },
];

// ── Datasets ───────────────────────────────────────────────────────────

export const datasets: readonly DatasetEntry[] = [
  {
    name: 'BENI v1.0',
    desc: 'Bangla Economic Narrative Index',
    source: 'HuggingFace: AnnNaserNabil/BENI_v1_0',
  },
  {
    name: 'BENI Global 10',
    desc: `${beni.global10Languages} languages, ${beni.global10Articles} articles`,
    source: `arXiv:${beni.arxivId}`,
  },
];

// ── Experience ─────────────────────────────────────────────────────────

export const experience: readonly ExperienceEntry[] = [
  {
    role: 'Automation Operation Specialist',
    org: 'Khub Soja',
    period: 'Oct 2024 - Present',
    bullets: [
      'Built 20+ n8n automation workflows',
      '10+ API integrations',
      'Event-driven architecture',
    ],
  },
  {
    role: 'Data Science Intern',
    org: 'Somikoron AI',
    period: 'Jan - Jun 2024',
    bullets: [
      'NLP news recommendation system',
      '50K+ articles processed',
      '75% faster extraction',
    ],
  },
  {
    role: 'Freelance Writer',
    org: 'Prothom Alo',
    period: '2014 - Present',
    bullets: ['Feature stories, satire, youth content'],
  },
  {
    role: 'Writer',
    org: 'Earki',
    period: '2017 - Present',
    bullets: ['Satirical writing, social commentary'],
  },
];

// ── Timeline ───────────────────────────────────────────────────────────

export const timeline: readonly TimelineEntry[] = [
  { year: '2014', event: 'Started writing for Prothom Alo' },
  { year: '2017', event: 'Joined Earki as writer' },
  { year: '2018', event: 'Began BS Economics at Jahangirnagar University' },
  { year: '2024', event: 'BS Economics completed' },
  { year: '2024', event: 'Data Science Intern @ Somikoron AI' },
  { year: '2024', event: 'Started MS Economics' },
  { year: '2024', event: 'Automation Engineer @ Khub Soja' },
  { year: '2025', event: 'Released AutoMLBench, TidyFlow, FireViz' },
  { year: '2025', event: 'BENI v1.0 dataset published on HuggingFace' },
  { year: '2026', event: 'BENI Global 10 published on arXiv (first-author)' },
  { year: '2026', event: 'Building this retro UNIX portfolio' },
];

// ── Blog ───────────────────────────────────────────────────────────────

export const blogPosts: readonly BlogEntry[] = [
  { file: 'hello-world.md', title: 'Welcome to my digital garden' },
  { file: 'beni-story.md',  title: 'The Story Behind BENI' },
];

// ── Bengali Motto ──────────────────────────────────────────────────────

export const motto = '\u201c\u099a\u09bf\u09a8\u09cd\u09a4\u09be \u0995\u09b0\u09cb, \u09a4\u09be\u09b0\u09aa\u09b0 \u0995\u09cb\u09a1 \u0995\u09b0\u09cb\u0964\u201d';
