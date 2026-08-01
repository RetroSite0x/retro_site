import { useState, useCallback } from 'react';
import styles from '../../styles/components/browser.module.css';

interface Bookmark {
  label: string;
  url: string;
  desc: string;
}

const BOOKMARKS: Bookmark[] = [
  { label: 'Personal Site', url: 'https://nabil.iam.bd/', desc: 'ann nabil — home' },
  { label: 'GitHub', url: 'https://github.com/nabil0x', desc: 'code & projects' },
  { label: 'Academic Site', url: 'https://Ann-Naser-Nabil.github.io/', desc: 'research & publications' },
  { label: 'HuggingFace', url: 'https://huggingface.co/AnnNaserNabil', desc: 'datasets & models' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/ann-naser-nabil', desc: 'professional profile' },
  { label: 'Bitly', url: 'https://bit.ly/m/Ubermensch', desc: 'links & pages' },
  { label: 'arXiv', url: 'https://arxiv.org/search/?query=Ann+Naser+Nabil', desc: 'papers' },
  { label: 'Resume', url: '/resume-nlp-ml-engineer.pdf', desc: 'open resume in browser' },
];

interface BrowserViewerProps {
  initialUrl?: string;
}

export function BrowserViewer({ initialUrl }: BrowserViewerProps) {
  const [url, setUrl] = useState(initialUrl ?? '');
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const navigate = useCallback((target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;

    let resolved = trimmed;
    if (resolved.startsWith('/') || resolved.startsWith('.')) {
      resolved = new URL(resolved, window.location.origin).href;
    } else if (!/^https?:\/\//i.test(resolved)) {
      resolved = 'https://' + resolved;
    }

    setUrl(resolved);
    setLastUrl(resolved);

    const link = document.createElement('a');
    link.href = resolved;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    link.remove();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(url);
  };

  const handleBookmark = (bookmark: Bookmark) => {
    setUrl(bookmark.url);
    navigate(bookmark.url);
  };

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <span className={styles.navDeco}>[WEB]</span>
        <form className={styles.urlForm} onSubmit={handleSubmit}>
          <input
            className={styles.urlInput}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            aria-label="URL"
          />
          <button type="submit" className={styles.goBtn} title="Open in new tab">GO</button>
        </form>
      </div>

      <div className={styles.content}>
        {lastUrl ? (
          <div className={styles.launched}>
            <p>Opened in new tab:</p>
            <p className={styles.launchedUrl}>{lastUrl}</p>
            <button className={styles.backBtn} onClick={() => setLastUrl(null)}>
              &larr; Back to bookmarks
            </button>
          </div>
        ) : (
          <div className={styles.bookmarks}>
            <div className={styles.bookmarksHeader}>bookmarks</div>
            <div className={styles.bookmarkGrid}>
              {BOOKMARKS.map((bm) => (
                <button
                  key={bm.url}
                  className={styles.bookmarkItem}
                  onClick={() => handleBookmark(bm)}
                  title={bm.url}
                >
                  <span className={styles.bookmarkLabel}>{bm.label}</span>
                  <span className={styles.bookmarkDesc}>{bm.desc}</span>
                </button>
              ))}
            </div>
            <p className={styles.bookmarksHint}>
              or type a URL above and press GO
            </p>
          </div>
        )}
      </div>

      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          {lastUrl ? `Connected — ${lastUrl}` : 'Ready'}
        </span>
      </div>
    </div>
  );
}
