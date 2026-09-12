import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import {
  listPosts,
  createPost,
  validateHandle,
  validateMessage,
  MemoireError,
} from '../../lib/memoire';
import {
  MEMOIRE_MAX_HANDLE,
  MEMOIRE_MAX_MESSAGE,
  MEMOIRE_MIN_INTERVAL_MS,
} from '../../types/memoire';
import type { MemoirePost, MemoireMode } from '../../types/memoire';
import styles from '../../styles/components/memoire.module.css';

/* ── Helpers ─────────────────────────────────────────────────── */

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '???';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return '???';
  }
}

/* ── Component ───────────────────────────────────────────────── */

export function MemoireBoard() {
  const [posts, setPosts] = useState<MemoirePost[]>([]);
  const [mode, setMode] = useState<MemoireMode>('local');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [handleError, setHandleError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastPostTime, setLastPostTime] = useState(0);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  /* ── Load posts on mount ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await listPosts();
        if (!cancelled) {
          setPosts(result.posts);
          setMode(result.mode);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof MemoireError ? err.message : 'Failed to load posts';
          setError(msg);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Track mounted state for unmount-safe updates ────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ── Clear success toast after delay ─────────────────────────── */
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  /* ── Validation ──────────────────────────────────────────────── */
  const validate = useCallback((): boolean => {
    const hErr = validateHandle(handle);
    const mErr = validateMessage(message);
    setHandleError(hErr);
    setMessageError(mErr);
    return hErr === null && mErr === null;
  }, [handle, message]);

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      /* Honeypot check */
      if (honeypotRef.current && honeypotRef.current.value !== '') {
        return;
      }

      if (!validate()) return;

      /* Rate-limit guard */
      const now = Date.now();
      if (now - lastPostTime < MEMOIRE_MIN_INTERVAL_MS) {
        const waitSec = Math.ceil(
          (MEMOIRE_MIN_INTERVAL_MS - (now - lastPostTime)) / 1000,
        );
        setError(`Please wait ${waitSec}s before posting again`);
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const result = await createPost(handle, message);
        if (!mountedRef.current) return;

        setPosts((prev) => [result.post, ...prev]);
        setMode(result.mode);
        setMessage('');
        setMessageError(null);
        setSuccess(true);
        setLastPostTime(Date.now());
      } catch (err: unknown) {
        if (!mountedRef.current) return;

        if (err instanceof MemoireError) {
          if (err.code === 'RATE_LIMIT') {
            setError('You are posting too fast. Please wait a moment and try again.');
            /* Do NOT clear the message so the user can retry */
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [handle, message, validate, lastPostTime],
  );

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className={styles.memoire}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.title}>MEMOIRE</h2>
        <p className={styles.subtitle}>PUBLIC BULLETIN BOARD</p>
        <p
          className={`${styles.mode} ${
            mode === 'remote' ? styles.modeConnected : styles.modeLocal
          }`}
        >
          {mode === 'remote'
            ? '\u25CF CONNECTED'
            : '\u25CB LOCAL (posts visible only on this device)'}
        </p>
      </header>

      {/* Compose form */}
      <form className={styles.compose} onSubmit={handleSubmit}>
        {/* Honeypot */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className={styles.srOnly}
        />

        <div className={styles.composeInputs}>
          <div className={styles.composeRow}>
            <label htmlFor="memoire-handle" className={styles.srOnly}>
              Handle
            </label>
            <input
              id="memoire-handle"
              type="text"
              className={styles.handleInput}
              placeholder="handle"
              maxLength={MEMOIRE_MAX_HANDLE}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onBlur={validate}
            />
          </div>

          <div>
            <label htmlFor="memoire-message" className={styles.srOnly}>
              Message
            </label>
            <textarea
              id="memoire-message"
              className={styles.messageInput}
              placeholder="Leave a note..."
              maxLength={MEMOIRE_MAX_MESSAGE}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={validate}
            />
          </div>

          {handleError && (
            <div className={styles.validationError}>{handleError}</div>
          )}
          {messageError && (
            <div className={styles.validationError}>{messageError}</div>
          )}

          <div className={styles.formRow}>
            <span className={styles.charCount}>
              {message.length}/{MEMOIRE_MAX_MESSAGE}
            </span>
            <button
              type="submit"
              className={styles.postBtn}
              disabled={submitting || handle.trim() === '' || message.trim() === ''}
            >
              {submitting ? 'POSTING...' : 'POST'}
            </button>
          </div>
        </div>
      </form>

      {/* Status messages */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => {
              setError(null);
              setLoading(true);
              listPosts()
                .then((result) => {
                  if (!mountedRef.current) return;
                  setPosts(result.posts);
                  setMode(result.mode);
                  setLoading(false);
                })
                .catch((err: unknown) => {
                  if (!mountedRef.current) return;
                  const msg =
                    err instanceof MemoireError
                      ? err.message
                      : 'Failed to load posts';
                  setError(msg);
                  setLoading(false);
                });
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successLine} aria-live="polite">
          ✓ pinned
        </div>
      )}

      {/* Post list */}
      {loading ? (
        <div className={styles.connecting}>CONNECTING...</div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          No notes yet - be the first to pin one.
        </div>
      ) : (
        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <span className={styles.postHandle}>{post.handle}</span>
                <time
                  className={styles.postTime}
                  dateTime={post.created_at}
                >
                  {formatTimestamp(post.created_at)}
                </time>
              </div>
              <p className={styles.postMessage}>{post.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
