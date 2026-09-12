import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { HistoryEntry } from '../../types/terminal';
import { useVFSStore } from '../../store/useVFS';
import styles from '../../styles/components/terminal.module.css';

interface CommandOutputProps {
  history: HistoryEntry[];
}

const URL_RE = /https?:\/\/[^\s<>"')\]]+/g;
const PATH_RE = /(?:\/[\w.\-~]+)+(?:\/)?/g;
const HEADING_RE = /^[=\-*]{3,}\s*.*/;
const BULLET_RE = /^\s*[-*•]\s/;
const ERROR_RE = /\b(?:error|not found|failed|permission denied|no such|denied)\b/i;

function highlightInline(text: string, keyBase: string): ReactNode[] {
  const combined = new RegExp(`(${URL_RE.source})|(${PATH_RE.source})`, 'g');
  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.slice(lastIdx, match.index));
    }

    const matched = match[0];
    const k = `${keyBase}-${match.index}`;

    if (/^https?:\/\//.test(matched)) {
      nodes.push(
        <a
          key={k}
          className={styles.highlightUrl}
          href={matched}
          target="_blank"
          rel="noopener noreferrer"
        >
          {matched}
        </a>
      );
    } else {
      nodes.push(
        <span key={k} className={styles.highlightPath}>
          {matched}
        </span>
      );
    }

    lastIdx = match.index + matched.length;
  }

  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx));
  }

  return nodes.length > 0 ? nodes : [text];
}

function highlightLine(line: string, lineIdx: number): ReactNode {
  const base = `L${lineIdx}`;

  if (HEADING_RE.test(line)) {
    return (
      <span key={base} className={styles.highlightHeading}>
        {highlightInline(line, base)}
      </span>
    );
  }

  if (BULLET_RE.test(line)) {
    return (
      <span key={base} className={styles.highlightBullet}>
        {highlightInline(line, base)}
      </span>
    );
  }

  if (ERROR_RE.test(line)) {
    return (
      <span key={base} className={styles.highlightError}>
        {highlightInline(line, base)}
      </span>
    );
  }

  const inlined = highlightInline(line, base);
  if (inlined.length === 1 && typeof inlined[0] === 'string') {
    return line;
  }

  return <span key={base}>{inlined}</span>;
}

function highlightOutput(text: string): ReactNode[] {
  const lines = text.split('\n');
  const result: ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) result.push('\n');

    if (lines[i] === '') {
      continue;
    }

    result.push(highlightLine(lines[i], i));
  }

  return result;
}

function HighlightedOutput({ content }: { content: string }) {
  const highlighted = useMemo(() => highlightOutput(content), [content]);
  return (
    <pre className={styles.outputPre} role="document" tabIndex={-1}>
      {highlighted}
    </pre>
  );
}

const username = 'guest';
const hostname = 'retro';

export function CommandOutput({ history }: CommandOutputProps) {
  const currentPath = useVFSStore((s) => s.currentPath);

  return (
    <div className={styles.output} role="log" aria-label="Terminal output" aria-live="polite">
      {history.map((entry, i) => {
        if (entry.type === 'input') {
          const prompt = `${username}@${hostname}:${currentPath}$ `;
          return (
            <div key={i} className={styles.inputLine}>
              <span className={styles.prompt} aria-hidden="true">{prompt}</span>
              <span className={styles.inputText}>{entry.content}</span>
            </div>
          );
        }

        if (entry.type === 'error') {
          return (
            <div key={i} className={styles.errorLine} role="alert" aria-live="assertive">
              {entry.content}
            </div>
          );
        }

        if (entry.type === 'system') {
          return (
            <div key={i} className={styles.systemLine} aria-label="System message">
              {entry.content}
            </div>
          );
        }

        if (!entry.content) return <div key={i} className={styles.outputLine} aria-hidden="true">&nbsp;</div>;

        return (
          <div key={i} className={styles.outputLine}>
            <HighlightedOutput content={entry.content} />
          </div>
        );
      })}
    </div>
  );
}
