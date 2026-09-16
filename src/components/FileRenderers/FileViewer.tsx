import { useMemo } from 'react';
import { useVFSStore } from '../../store/useVFS';
import { readFileContent } from '../../lib/vfs';
import { MarkdownViewer } from './MarkdownViewer';
import { ConfigViewer } from './ConfigViewer';
import { TextViewer } from './TextViewer';
import { ImageViewer } from './ImageViewer';
import { CodeViewer } from './CodeViewer';
import styles from '../../styles/components/menu-bar.module.css';

interface FileViewerProps {
  filePath: string;
}

function getBlogSlug(filePath: string): string | null {
  if (!filePath.startsWith('/blog/')) return null;
  const filename = filePath.split('/').pop();
  if (!filename?.endsWith('.md')) return null;
  return filename.replace('.md', '');
}

function getExtension(filePath: string): string {
  const idx = filePath.lastIndexOf('.');
  if (idx === -1) return '';
  return filePath.slice(idx).toLowerCase();
}

function getRenderer(filePath: string): 'md' | 'conf' | 'txt' | 'image' | 'code' | 'text' {
  const ext = getExtension(filePath);
  switch (ext) {
    case '.md':
      return 'md';
    case '.conf':
      return 'conf';
    case '.txt':
      return 'txt';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
      return 'image';
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
    case '.py':
    case '.go':
    case '.rs':
    case '.c':
    case '.cpp':
    case '.h':
    case '.java':
    case '.rb':
    case '.php':
    case '.sh':
    case '.bash':
    case '.zsh':
    case '.css':
    case '.html':
    case '.json':
    case '.yaml':
    case '.yml':
    case '.toml':
      return 'code';
    default:
      return 'text';
  }
}

export function FileViewer({ filePath }: FileViewerProps) {
  const tree = useVFSStore((s) => s.tree);
  const content = useMemo(() => readFileContent(tree, filePath), [tree, filePath]);

  const blogSlug = getBlogSlug(filePath);
  if (blogSlug) {
    const blogUrl = `https://ann.iam.bd/blog/${blogSlug}/`;
    return (
      <div className={styles.fileViewer}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>📝</div>
          <div style={{ fontSize: 14, color: 'var(--phosphor)' }}>
            Blog posts are now on a dedicated page
          </div>
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--phosphor)',
              textDecoration: 'underline',
              fontSize: 14,
              padding: '8px 16px',
              border: '1px solid var(--phosphor)',
              cursor: 'pointer',
            }}
          >
            Open in browser →
          </a>
          <div style={{ fontSize: 11, color: 'var(--phosphor-dim)', marginTop: 8 }}>
            {blogUrl}
          </div>
        </div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className={styles.fileViewer}>
        <div className={styles.fileError}>File not found: {filePath}</div>
      </div>
    );
  }

  const renderer = getRenderer(filePath);

  switch (renderer) {
    case 'md':
      return <MarkdownViewer filePath={filePath} />;
    case 'conf':
      return <ConfigViewer filePath={filePath} />;
    case 'txt':
      return <TextViewer filePath={filePath} />;
    case 'image':
      return <ImageViewer filePath={filePath} />;
    case 'code':
      return <CodeViewer filePath={filePath} />;
    default:
      return <TextViewer filePath={filePath} />;
  }
}
