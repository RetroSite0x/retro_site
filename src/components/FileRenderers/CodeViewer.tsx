import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import styles from '../../styles/components/menu-bar.module.css';

interface CodeViewerProps {
  filePath: string;
}

type CommentStyle = 'slash' | 'hash' | 'block' | 'html' | 'none';
type TokenKind = 'comment' | 'string' | 'number' | 'keyword';

const EXT_LANGUAGE: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
  py: 'python', go: 'go', rs: 'rust', c: 'c', cpp: 'cpp', h: 'c',
  java: 'java', rb: 'ruby', php: 'php', sh: 'shell', bash: 'shell',
  zsh: 'shell', css: 'css', html: 'html', json: 'json',
  yaml: 'yaml', yml: 'yaml', toml: 'toml',
};

const COMMENT_STYLE: Record<string, CommentStyle> = {
  typescript: 'slash', javascript: 'slash', go: 'slash', rust: 'slash',
  c: 'slash', cpp: 'slash', java: 'slash', php: 'slash',
  python: 'hash', shell: 'hash', ruby: 'hash', yaml: 'hash', toml: 'hash',
  css: 'block', html: 'html', json: 'none',
};

function setOf(words: string): Set<string> {
  return new Set(words.split(' '));
}

const JS_WORDS =
  'const let var function return if else for while do switch case break continue new typeof instanceof in of class extends implements interface type enum import export from default as async await try catch finally throw void null undefined true false this super static get set readonly public private protected';

const KEYWORDS: Record<string, Set<string>> = {
  typescript: setOf(JS_WORDS),
  javascript: setOf(JS_WORDS),
  python: setOf('def class return if elif else for while break continue import from as try except finally raise with yield lambda pass True False None and or not in is del global nonlocal assert async await self'),
  go: setOf('func return if else for switch case break continue package import type struct interface map chan go defer select range var const make new len cap append error true false nil'),
  rust: setOf('fn let mut return if else for while loop break continue match struct enum impl trait pub use mod crate self super where async await move ref type const static true false Self Option Result Some None Ok Err'),
  c: setOf('int char float double void long short unsigned signed const static extern struct typedef enum union return if else for while do break continue sizeof NULL true false include define'),
  cpp: setOf('int char float double void long short unsigned signed const static extern struct typedef enum union class public private protected virtual override return if else for while do break continue sizeof nullptr true false namespace using template typename auto new delete this'),
  java: setOf('int char float double void long short boolean byte class public private protected static final abstract interface extends implements return if else for while do break continue new null true false import package try catch finally throw throws this super'),
  ruby: setOf('def end class module if elsif else unless while until for break next return require include extend yield lambda proc true false nil self super begin rescue ensure raise attr_accessor attr_reader attr_writer'),
  php: setOf('function return if else elseif for foreach while do break continue class extends implements public private protected static final abstract interface new null true false echo print require include namespace use as try catch finally throw match fn readonly'),
  shell: setOf('if then else elif fi for while do done case esac function return exit echo export source local readonly declare unset shift set eval exec trap wait cd pwd ls grep sed awk find sort head tail cat mkdir rm cp mv chmod chown touch'),
  css: setOf('color background margin padding border display position width height font text flex grid align justify overflow transition animation transform opacity cursor outline'),
  html: setOf('html head body div span p a h1 h2 h3 h4 h5 h6 ul ol li table tr td th form input button select option textarea img script style link meta title header footer nav main section article aside'),
};

const TOKEN_STYLES: Record<TokenKind, CSSProperties> = {
  comment: { color: 'var(--phosphor-dim)', fontStyle: 'italic' },
  string: { color: 'var(--phosphor-dim)' },
  number: { color: 'var(--phosphor)' },
  keyword: { color: 'var(--phosphor)', fontWeight: 600 },
};

function getLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LANGUAGE[ext] ?? 'typescript';
}

// Token priority is comment → string → number → word, resolved in a single
// regex pass so no later rule can rewrite markup produced by an earlier one.
function tokenizeLine(line: string, language: string): ReactNode[] {
  const commentStyle = COMMENT_STYLE[language] ?? 'slash';
  const keywords = KEYWORDS[language];

  const sources: string[] = [];
  let commentGroup = -1;
  if (commentStyle === 'slash') commentGroup = sources.push('\\/\\/[^\\n]*') - 1;
  else if (commentStyle === 'hash') commentGroup = sources.push('#[^\\n]*') - 1;
  else if (commentStyle === 'block') commentGroup = sources.push('\\/\\*[\\s\\S]*?\\*\\/') - 1;
  else if (commentStyle === 'html') commentGroup = sources.push('<!--[\\s\\S]*?-->') - 1;

  const stringGroup =
    sources.push('"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`') - 1;
  const numberGroup = sources.push('\\b\\d+(?:\\.\\d+)?\\b') - 1;
  sources.push('[A-Za-z_$][A-Za-z0-9_$]*');

  const pattern = new RegExp(sources.map((s) => `(${s})`).join('|'), 'g');

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    const text = match[0];
    if (text.length === 0) {
      pattern.lastIndex += 1;
      continue;
    }
    if (match.index > cursor) nodes.push(line.slice(cursor, match.index));

    let kind: TokenKind | null = null;
    if (commentGroup >= 0 && match[commentGroup + 1] !== undefined) kind = 'comment';
    else if (match[stringGroup + 1] !== undefined) kind = 'string';
    else if (match[numberGroup + 1] !== undefined) kind = 'number';
    else if (keywords?.has(text)) kind = 'keyword';

    if (kind) {
      nodes.push(
        <span key={key++} style={TOKEN_STYLES[kind]}>
          {text}
        </span>,
      );
    } else {
      nodes.push(text);
    }

    cursor = match.index + text.length;
  }

  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
}

function lineNum(n: number, total: number): string {
  return String(n).padStart(String(total).length, ' ');
}

export function CodeViewer({ filePath }: CodeViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);
  const language = getLanguage(filePath);

  if (content === null) {
    return (
      <div className={styles.fileViewer}>
        <div className={styles.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div className={styles.fileViewer}>
      <div className={styles.fileHeader}>
        <span className={styles.filePath}>{filePath}</span>
      </div>
      <div className={styles.fileContent}>
        <pre className={styles.filePre}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <span
                style={{
                  color: 'var(--phosphor-dim)',
                  minWidth: '3em',
                  textAlign: 'right',
                  paddingRight: '1em',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {lineNum(i + 1, lines.length)}
              </span>
              <span>{tokenizeLine(line, language)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
