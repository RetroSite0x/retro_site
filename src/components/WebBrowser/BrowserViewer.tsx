import { useState, useCallback } from 'react';
import styles from '../../styles/components/browser.module.css';

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
    if (!/^https?:\/\//i.test(resolved)) {
      resolved = 'https://' + resolved;
    }

    setUrl(resolved);
    setLastUrl(resolved);

    // Create and click an anchor to bypass popup blockers
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
          </div>
        ) : (
          <div className={styles.prompt}>
            <p>Type a URL above and press GO</p>
            <p className={styles.hint}>(opens in your actual browser)</p>
          </div>
        )}
      </div>
      <div className={styles.statusBar}>
        <span className={styles.statusText}>Ready</span>
      </div>
    </div>
  );
}
