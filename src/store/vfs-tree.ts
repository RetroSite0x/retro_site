import type { FSNode } from '../types/vfs';

const NOW = '2026-07-09T00:00:00.000Z';

export const INITIAL_TREE: FSNode = {
  name: '/',
  type: 'directory',
  metadata: { size: 1024, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
  children: [
    {
      name: 'bin',
      type: 'directory',
      metadata: { size: 512, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [],
    },
    {
      name: 'home',
      type: 'directory',
      metadata: { size: 512, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'guest',
          type: 'directory',
          metadata: { size: 512, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'about.txt',
              type: 'file',
              content: `SYSTEM INFORMATION
====================
Name: Ann Naser Nabil
Location: Dhaka, Bangladesh
Research: Bangla NLP, Computational Social Science
Education: MS Economics (Jahangirar University)
           BS Economics (Jahangirnagar University)
Work: Automation Engineer @ Khub Soja
      Data Science Intern @ Somikoron AI
      Writer @ Prothom Alo, Earki
Mission: NLP for low-resource languages + CSS
Status: Online`,
              metadata: { size: 360, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'skills.conf',
              type: 'file',
              content: `# Skills & Technologies
Languages: Python, SQL, Bash, JavaScript
ML/AI: NLP, Deep Learning, TensorFlow, PyTorch, Scikit-Learn
NLP: spaCy, NLTK, Transformers, RAG, LLM Evaluation
Automation: n8n, APIs, Webhooks, Workflow Automation
Data: Pandas, NumPy, Econometrics, Time Series
Tools: Git, Docker, FastAPI, Flask, Streamlit
Databases: PostgreSQL, MySQL, SQLite
Research: Bangla NLP, Economic Narrative Analysis, CSS`,
              metadata: { size: 400, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'resume.txt',
              type: 'file',
              content: `RESUME
======
Ann Naser Nabil
AI Engineer | Applied Data Scientist | NLP Researcher
ann.n.nabil@gmail.com

EXPERIENCE
- Automation Operation Specialist @ Khub Soja (Oct 2024-Present)
  Built 20+ n8n automation workflows, 10+ API integrations
- Data Science Intern @ Somikoron AI (Jan-Jun 2024)
  NLP news recommendation system, 50K+ articles, 75% faster extraction
- Freelance Writer @ Prothom Alo (2014-Present)
  Feature stories, satire, youth content
- Writer @ Earki (2017-Present)
  Satirical writing, social commentary

EDUCATION
- MS Economics, Jahangirnagar University (2024-2025 expected)
- BS Economics, Jahangirnagar University (2018-2024)

PUBLICATIONS
- BENI Global 10: Multilingual Economic Narrative Corpus (arXiv 2026)
- BENI v1.0: Bangla Economic Narrative Index Dataset (HuggingFace 2026)

PROJECTS
- AutoMLBench: Automated ML benchmarking library (Python)
- Disease Prediction System: 85% accuracy, 100+ users (TensorFlow)
- NLP News Recommender: 50K articles, 20% retention boost (spaCy/NLTK)`,
              metadata: { size: 950, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'contact.md',
              type: 'file',
              content: `# Contact & Online Presence

**Email:** ann.n.nabil@gmail.com
**GitHub:** [github.com/AnnNaserNabil](https://github.com/AnnNaserNabil)
**Website:** [nabil.iam.bd](https://nabil.iam.bd/)
**Academic:** [Ann-Naser-Nabil.github.io](https://Ann-Naser-Nabil.github.io/)
**LinkedIn:** [linkedin.com/in/ann-naser-nabil](https://linkedin.com/in/ann-naser-nabil)
**Twitter/X:** [@ann_naser](https://x.com/ann_naser)
**HuggingFace:** [huggingface.co/AnnNaserNabil](https://huggingface.co/AnnNaserNabil)
**arXiv:** [arxiv.org/search/?query=Ann+Naser+Nabil](https://arxiv.org/search/?query=Ann+Naser+Nabil)
**Location:** Dhaka, Bangladesh`,
              metadata: { size: 480, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
          ],
        },
      ],
    },
    {
      name: 'projects',
      type: 'directory',
      metadata: { size: 512, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'automlbench',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: AutoMLBench
status: ACTIVE
language: Python
type: library
description: Automated ML Model Benchmarking framework
url: https://github.com/AnnNaserNabil`,
              metadata: { size: 150, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# AutoMLBench

A lightweight, extensible benchmarking suite for comparing popular
AutoML frameworks on real-world datasets.

## Features
- Supports classification, regression, and clustering
- Automated model comparison across frameworks
- Feature engineering and performance visualization
- Support for XGBoost, LightGBM, and CatBoost

## Use Case
Helps researchers and developers quickly evaluate metrics of
different machine learning models on their data.`,
              metadata: { size: 380, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
            {
              name: 'source',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
            {
              name: 'tests',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
          ],
        },
        {
          name: 'tidyflow',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: TidyFlow
status: ACTIVE
language: Python
type: library
description: Lightweight Data Preprocessing Toolbox
url: https://github.com/AnnNaserNabil`,
              metadata: { size: 150, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# TidyFlow

A lightweight data preprocessing toolbox for Python.

## Features
- Modular functions for cleaning, encoding, scaling, and transformation
- Seamless integration with Pandas & Scikit-learn
- Smart preprocessing suggestions
- Chainable operations for pipeline construction

## Installation
\`\`\`
pip install tidyflow
\`\`\`

\`\`\`python
from tidyflow import preprocess
clean_data = preprocess(df).dropna().scale().encode()
\`\`\``,
              metadata: { size: 380, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
            {
              name: 'source',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
          ],
        },
        {
          name: 'fireviz',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: FireViz
status: ACTIVE
language: Python
type: library
description: Fast & Simple Data Visualization library
url: https://github.com/AnnNaserNabil`,
              metadata: { size: 150, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# FireViz

A fast and simple data visualization library for Python.

## Features
- Multiple plot types: scatter, bar, heatmap, treemap, network
- Built-in EDA functions
- Automatic handling of Pandas DataFrames
- Minimal code required for common visualizations

## Quick Start
\`\`\`python
from fireviz import quick_plot
quick_plot(df, type='scatter', x='col1', y='col2')
\`\`\``,
              metadata: { size: 320, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
          ],
        },
        {
          name: 'nlp-news-recommender',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: NLP News Recommender
status: ACTIVE
language: Python
type: application
description: NLP-based news recommendation system
url: https://github.com/AnnNaserNabil/NLP-News-Recommender`,
              metadata: { size: 160, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# NLP News Recommendation System

An NLP-based news recommendation system built at Somikoron AI.

## Features
- Processes 50,000+ Bangla/English news articles
- Automated real-time data extraction covering 50+ countries
- AI-driven recommendation engine via FastAPI
- 20% boost in user retention, 75% less manual processing

## Tech Stack
Python • spaCy • NLTK • FastAPI • SQL

## Highlights
- Built automated pipeline reducing manual work by 75%
- Integrated recommendation engine increasing DAU by 100%
- A/B testing optimized model accuracy by 15%`,
              metadata: { size: 450, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
            {
              name: 'data',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
            {
              name: 'models',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
          ],
        },
        {
          name: 'disease-predictor',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: Disease Predictor
status: ACTIVE
language: Python
type: application
description: AI-powered disease prediction and drug recommendation
url: https://github.com/AnnNaserNabil`,
              metadata: { size: 155, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# Disease Prediction & Drug Recommendation System

An AI-powered health tech system delivering real-time disease
prediction and personalized drug recommendations.

## Features
- 85% accuracy predicting 50+ common diseases
- 10,000+ medical records processed with Scikit-Learn
- Deployed on Render via FastAPI
- 100+ monthly active users, 95% satisfaction rate

## Tech Stack
Python • TensorFlow • Scikit-Learn • FastAPI • Render`,
              metadata: { size: 350, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
            {
              name: 'data',
              type: 'directory',
              metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
              children: [],
            },
          ],
        },
        {
          name: 'movie-recommender',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'project.conf',
              type: 'file',
              content: `name: Movie Recommender
status: ACTIVE
language: Python
type: application
description: Intelligent movie recommendation engine
url: https://github.com/AnnNaserNabil`,
              metadata: { size: 155, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
            },
            {
              name: 'README.md',
              type: 'file',
              content: `# Intelligent Movie Recommendation Engine

A personalized movie recommendation system using NLP.

## Features
- TMDB API integration, 100,000+ movie records processed
- Mood-based filtering with PyTorch
- Real-time data fetching in under 2 seconds
- Interactive Streamlit UI
- 30% increase in user interaction rates

## Tech Stack
Python • PyTorch • TMDB API • Streamlit`,
              metadata: { size: 320, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
          ],
        },
      ],
    },
    {
      name: 'logs',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: '2024.log',
          type: 'file',
          content: `01-10
Joined Somikoron AI as Data Science Intern.
NLP project: Bangla news recommendation system.

03-15
Built real-time extraction pipeline for 50+ countries.
75% reduction in manual processing time.

06-01
Internship completed. Shipped NLP recommender in production.
50K articles processed, 20% retention boost.

10-01
Started as Automation Engineer at Khub Soja.
n8n workflows, API integrations, event-driven systems.

12-31
2024 in review: 1 internship, 1 job, shipped 2 systems.
Feels good.`,
          metadata: { size: 440, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: '2025.log',
          type: 'file',
          content: `01-15
Working on AutoMLBench. Python library for benchmarking.
Goal: make model comparison less painful.

04-20
AutoMLBench released. Classification, regression, clustering.
Supports XGBoost, LightGBM, CatBoost.

07-10
Started TidyFlow and FireViz libraries.
Data preprocessing and visualization tools.

10-05
BENI project started.
Bangla Economic Narrative Index — combining NLP + economics.

12-20
BENI v1.0 dataset published on HuggingFace.
First open dataset!`,
          metadata: { size: 400, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: '2026.log',
          type: 'file',
          content: `01-15
BENI Global 10: expanded to 10 languages across Global South.
620K+ economic articles. This is real research.

03-10
Preparing PhD applications. Bangla NLP + CSS focus.
CGPA 2.87 means I need strategy, not just applications.

06-08
BENI Global 10 paper published on arXiv:2606.10225.
First first-author paper. Huge milestone.

07-09
Building this retro UNIX Web OS.
Not a portfolio. A computer that reflects who I am.
Every pixel, every file, every paper — it's all here.`,
          metadata: { size: 420, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
      ],
    },
    {
      name: 'lab',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'exp_01_cuda.txt',
          type: 'file',
          content: `EXPERIMENT 01: CUDA Acceleration
Status: SUCCESS
Date: 2025-03-15

Achieved 12x speedup on matrix operations.
Notes: Memory management needs improvement.`,
          metadata: { size: 150, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: 'exp_02_llm.txt',
          type: 'file',
          content: `EXPERIMENT 02: LLM Fine-tuning
Status: FAILED
Date: 2025-06-20

Out of memory. Need better batching strategy.
Notes: Try gradient accumulation next.`,
          metadata: { size: 150, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: 'notes',
          type: 'directory',
          metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
          children: [
            {
              name: 'note_cuda_optimization.md',
              type: 'file',
              content: `# CUDA Optimization Notes

## Key Findings
- Memory coalescing gives 3x speedup on matrix multiply
- Shared memory is fast but small (48KB per block)
- Bank conflicts kill performance on strided access

## Best Practices
1. Minimize global memory reads
2. Coalesce all memory accesses
3. Use shared memory for reusable data
4. Avoid thread divergence

## TODO
- [ ] Implement tiled matrix multiplication
- [ ] Profile with nvcc
- [ ] Compare with cuBLAS`,
              metadata: { size: 320, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
            {
              name: 'note_rust_async.md',
              type: 'file',
              content: `# Rust Async/Await Notes

## Async runtimes
- Tokio: most popular, batteries included
- smol: minimal, elegant
- async-std: familiar API

## Common patterns
- Use tokio::spawn for CPU-bound work
- Prefer channels over shared state
- Bounded channels for backpressure

## Gotchas
- async Drop is not a thing
- Recursive async fns need boxing
- Send bound on .await across tasks`,
              metadata: { size: 300, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
            },
          ],
        },
      ],
    },
    {
      name: 'papers',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'beni_global_10.md',
          type: 'file',
          content: `# BENI Global 10: Multilingual Economic Narrative Corpus for the Global South

**Authors:** Ann Naser Nabil
**Published:** arXiv:2606.10225, June 2026
**License:** arXiv perpetual non-exclusive license

## Abstract
Economic narrative indices are predominantly English-centric; 84% of
sentiment-based forecasting research focuses on developed economies.
BENI Global 10 is the first multilingual economic news corpus spanning
10 languages across 7 language families and 5 economic regions:
Bangla (Bangladesh), Hindi (India), Turkish (Turkey),
Indonesian (Indonesia), Portuguese (Brazil), Arabic (Egypt),
Filipino (Philippines), Swahili (Tanzania), Urdu (Pakistan),
and Vietnamese (Vietnam).

## Dataset
- 10 languages, 620K+ economic articles
- 7 language families, 5 economic regions
- Binary economic relevance labels
- Source diversity: national newspapers, Wikipedia-derived, news crawls

## Key Results
- BERT-based classifier achieves 93.8% macro F1 on Bangla
- Cross-language classifier transfer improves low-resource performance
- Captures economically meaningful signal (62pp spread)

## Links
- GitHub: github.com/nabil0x/beni-multilingual
- HuggingFace: huggingface.co/AnnNaserNabil

## Limitations
- 4 languages sourced from Wikipedia (encyclopedic, not news)
- Only Bangla has full temporal coverage (2018-2024)
- No sentiment annotations yet (binary relevance only)`,
          metadata: { size: 1100, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
        {
          name: 'beni_v1.md',
          type: 'file',
          content: `# BENI v1.0: Bangla Economic Narrative Index

**Authors:** Ann Naser Nabil
**Published:** HuggingFace Datasets, 2026

## Description
A derived data-and-measurement layer built from existing Bangla news
corpora (Potrika 2014-2020, BNAD 2021-2024) for economic narrative
research. Tracks economic narrative sentiment in Bangladeshi news media
over time.

## Key Features
- Bangla-language economic news classification
- Temporal analysis of economic narratives
- Cross-media comparison (pro-government vs opposition newspapers)
- Open-access dataset on HuggingFace

## Links
- Dataset: huggingface.co/datasets/AnnNaserNabil/BENI_v1_0_A_Harmonised_Bangla_News_Dataset_for_Economic_Narrative_Measurement`,
          metadata: { size: 650, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
        {
          name: 'institutional_quality_finance.md',
          type: 'file',
          content: `# Does Institutional Quality Matter for Financial Development?

**Authors:** Ann Naser Nabil
**Published:** Undergraduate thesis, Jahangirnagar University

## Abstract
Investigates the relationship between institutional quality indicators
and financial development outcomes in developing economies.

## Keywords
Institutional economics, financial development, econometric analysis,
developing countries`,
          metadata: { size: 350, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
      ],
    },
    {
      name: 'music',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'playlist_2025.txt',
          type: 'file',
          content: `PLAYLIST: Coding Sessions 2025
=================================
1. Daft Punk — Harder, Better, Faster, Stronger
2. Carpenter Brut — Turbo Killer
3. Lorn — Anvil
4. Perturbator — Sentient
5. Tangerine Dream — Love on a Real Train
6. Boards of Canada — Roygbiv
7. Kavinsky — Nightcall
8. Disasterpeace — It Follows (Score)`,
          metadata: { size: 280, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: 'ambient_works.md',
          type: 'file',
          content: `# Ambient Works for Dev Sessions

## Focus Playlist
- Aphex Twin — Selected Ambient Works 85-92
- Brian Eno — Music for Airports
- Hiroshi Yoshimura — Green
- Boards of Canada — Music Has the Right to Children

## Why Ambient
No lyrics = no distraction.
Repetitive patterns = flow state.`,
          metadata: { size: 250, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
      ],
    },
    {
      name: 'art',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'pixel_art_notes.txt',
          type: 'file',
          content: `PIXEL ART PROJECTS
===================
1. Terminal City — A pixel art cityscape made of ASCII
   Status: DRAFT
   Size: 80x24 characters

2. Retro Portrait — 16-color ANSI portrait
   Status: PLANNING
   Palette: Default VGA palette

3. Sprite Sheet — 32x32 RPG character sprites
   Status: IN PROGRESS
   Count: 12/24 sprites complete`,
          metadata: { size: 280, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/plain' },
        },
        {
          name: 'shader_notes.md',
          type: 'file',
          content: `# Shader Experiments

## GLSL Snippets

### CRT Effect
\`\`\`glsl
float crtCurve(vec2 uv) {
  return uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
}
\`\`\`

### Scanlines
\`\`\`glsl
float scanlines(vec2 uv, float freq) {
  return sin(uv.y * freq);
}
\`\`\`

## Tools
- Shadertoy for prototyping
- glslViewer for local testing
- Fragmentarium for demoscene stuff`,
          metadata: { size: 280, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
      ],
    },
    {
      name: 'secret',
      type: 'directory',
      metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwx------', mimeType: 'inode/directory' },
      children: [
        {
          name: 'konami.txt',
          type: 'file',
          content: 'You found the secret directory!\nThe Konami code lives here.\nUp Up Down Down Left Right Left Right B A Start',
          metadata: { size: 110, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-------', mimeType: 'text/plain' },
        },
        {
          name: '.easter_egg.bin',
          type: 'file',
          content: 'SECRET: This is a hidden easter egg file. You found it!',
          metadata: { size: 60, createdAt: NOW, updatedAt: NOW, executable: true, permissions: 'rwx------', mimeType: 'application/octet-stream' },
        },
      ],
    },
    {
      name: 'tmp',
      type: 'directory',
      metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxrwxrwx', mimeType: 'inode/directory' },
      children: [],
    },
    {
      name: 'archive',
      type: 'directory',
      metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [],
    },
    {
      name: 'blog',
      type: 'directory',
      metadata: { size: 256, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [
        {
          name: 'hello-world.md',
          type: 'file',
          content: `# Hello, World

Welcome to my digital garden. This is where I write about
NLP, economics, automation, and building things that matter.

## Why a blog?
I've been building tools, training models, and writing papers.
But I never wrote about *why*. This is where that changes.

## What to expect
- Bangla NLP research notes
- Automation deep-dives (n8n, APIs, event-driven systems)
- Economics x Data Science crossovers
- Retro computing and terminal aesthetics

— Ann`,
          metadata: { size: 380, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
        {
          name: 'beni-story.md',
          type: 'file',
          content: `# The Story Behind BENI

It started with a simple question:
*Why is all economic NLP research about English?*

84% of sentiment-based forecasting focuses on developed economies.
Bangla, the 7th most spoken language in the world? Almost nothing.

## The Dataset
BENI v1.0 is a Bangla Economic Narrative Index dataset.
620K+ articles across 10 languages from the Global South.
Published on HuggingFace and arXiv.

## What I Learned
1. Low-resource NLP is hard because the data doesn't exist.
2. Economic narratives matter — they shape policy, markets, perceptions.
3. Building the dataset IS the research.

Read the paper: arXiv:2606.10225`,
          metadata: { size: 500, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rw-r--r--', mimeType: 'text/markdown' },
        },
      ],
    },
    {
      name: 'trash',
      type: 'directory',
      metadata: { size: 128, createdAt: NOW, updatedAt: NOW, executable: false, permissions: 'rwxr-xr-x', mimeType: 'inode/directory' },
      children: [],
    },
  ],
};
