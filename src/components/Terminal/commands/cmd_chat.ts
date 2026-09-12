import type { CommandHandler } from '../../../types/terminal';

interface Bot {
  name: string;
  responses: string[];
}

const bots: Record<string, Bot> = {
  nabil_ai: {
    name: 'nabil_ai',
    responses: [
      "Ann is focused on computational linguistics and Bangla NLP — bridging the gap between under-resourced languages and modern NLP pipelines.",
      "Currently exploring narrative economics applied to Bengali economic discourse. It's fascinating how stories shape financial markets.",
      "Ann's work spans financial NLP, mental health discourse analysis, and causal inference methods. Multidisciplinary by design.",
      "The BENI (Bangla Economic Narrative Index) project tracks economic narratives in Bengali media. Sentiment shapes real outcomes.",
      "Ann is passionate about making NLP accessible for low-resource languages. Every language deserves intelligent text processing.",
    ],
  },
  research_bot: {
    name: 'research_bot',
    responses: [
      "Published research covers stance detection, sentiment analysis, and topic modeling in Bengali corpora. Check the papers section!",
      "Datasets built for this research include annotated Bengali financial text and mental health forum posts from Moner Janala.",
      "Systematic literature reviews on narrative economics reveal how economic stories propagate through non-English media.",
      "Methodology ranges from computational text analysis to quasi-experimental causal inference designs — mixed methods are powerful.",
      "Research outputs include PRISMA-compliant reviews, reproducible Python pipelines, and annotated corpora for Bangla NLP.",
    ],
  },
  code_bot: {
    name: 'code_bot',
    responses: [
      "Tech stack includes Python, PyTorch, Hugging Face Transformers, spaCy, and DuckDB for large-scale text analysis.",
      "Data pipelines built with Polars for speed, NLTK for preprocessing, and custom Bangla tokenizers for accurate segmentation.",
      "Version control on GitHub with reproducible environments via uv and Poetry. CI/CD with GitHub Actions.",
      "Visualization toolkit: matplotlib, seaborn, plotly for interactive charts, and custom terminal-based displays for this portfolio.",
      "Architecture emphasizes modularity — each research project is its own package with shared preprocessing utilities.",
    ],
  },
  nlp_guru: {
    name: 'nlp_guru',
    responses: [
      "Bangla NLP challenges: complex morphology, verb conjugations, and lack of standardized tokenizers. Custom solutions required.",
      "Fine-tuning multilingual transformers (mBERT, XLM-R) for Bangla sentiment detection yields strong cross-lingual transfer.",
      "Text preprocessing pipeline: Unicode normalization, stopword removal, stemming via Morphological analyzer, and vectorization.",
      "Topic modeling on Bengali text uses LDA with custom dictionary filtering. Domain-specific stopword lists are essential.",
      "Language model evaluation considers both automatic metrics (F1, BLEU) and human judgment from native Bengali speakers.",
    ],
  },
};

function getTimestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getHelp(): string {
  const lines = [
    '╔══════════════════════════════════════════════════════╗',
    '║           RETRO CHAT — Multi-User Terminal          ║',
    '╠══════════════════════════════════════════════════════╣',
    '║                                                      ║',
    '║  Welcome to the chat room! Talk with Ann\'s AI bots. ║',
    '║                                                      ║',
    '║  Usage:                                              ║',
    '║    chat              Show this help message           ║',
    '║    chat say "msg"    Send a message (all bots reply) ║',
    '║    chat users        List available bot users         ║',
    '║                                                      ║',
    '║  Bots available:                                     ║',
    '║    nabil_ai    — Ann\'s AI persona                    ║',
    '║    research_bot — Papers & academic topics           ║',
    '║    code_bot    — Programming & tech stack            ║',
    '║    nlp_guru    — NLP & language models               ║',
    '║                                                      ║',
    '╚══════════════════════════════════════════════════════╝',
  ];
  return lines.join('\n');
}

function listUsers(): string {
  const lines = [
    '╔═══════════════════════════════════════╗',
    '║         ONLINE USERS                  ║',
    '╠═══════════════════════════════════════╣',
    '║  ● nabil_ai     — Ann\'s AI persona   ║',
    '║  ● research_bot — Academic researcher ║',
    '║  ● code_bot     — Tech enthusiast     ║',
    '║  ● nlp_guru     — NLP specialist      ║',
    '╚═══════════════════════════════════════╝',
  ];
  return lines.join('\n');
}

function formatBotResponse(bot: Bot, message: string): string {
  const ts = getTimestamp();
  const response = pickRandom(bot.responses);
  const trigger = message.length > 30 ? message.slice(0, 27) + '...' : message;
  return `[${ts}] <${bot.name}> Re: "${trigger}"\n${response}`;
}

export const cmd_chat: CommandHandler = (args) => {
  const sub = args[0];

  if (!sub || sub === 'help') {
    return { type: 'output', content: getHelp() };
  }

  if (sub === 'users') {
    return { type: 'output', content: listUsers() };
  }

  if (sub === 'say') {
    const message = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
    if (!message) {
      return { type: 'error', content: 'chat say: missing message. Usage: chat say "your message"' };
    }

    const ts = getTimestamp();
    const header = `[${ts}] <you> ${message}`;
    const replies = Object.values(bots).map((bot) => formatBotResponse(bot, message));
    const separator = '─'.repeat(48);

    return {
      type: 'output',
      content: [header, separator, ...replies, separator].join('\n'),
    };
  }

  return { type: 'error', content: `chat: unknown subcommand '${sub}'. Try 'chat' for help.` };
};
