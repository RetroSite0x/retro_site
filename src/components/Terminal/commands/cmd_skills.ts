import type { CommandHandler } from '../../../types/terminal';

export const cmd_skills: CommandHandler = () => {
  const content = [
    'SKILLS',
    '\u2550'.repeat(40),
    '',
    '  Languages      Python, SQL, Bash, JavaScript',
    '  ML/AI          NLP, Deep Learning, TensorFlow, PyTorch, Scikit-Learn',
    '  NLP            spaCy, NLTK, Transformers, RAG, LLM Evaluation',
    '  Automation     n8n, APIs, Webhooks, Workflow Automation',
    '  Data           Pandas, NumPy, Econometrics, Time Series',
    '  Tools          Git, Docker, FastAPI, Flask, Streamlit',
    '  Databases      PostgreSQL, MySQL, SQLite',
    '  Research       Bangla NLP, Economic Narrative Analysis, CSS',
  ].join('\n');

  return { type: 'output', content };
};
