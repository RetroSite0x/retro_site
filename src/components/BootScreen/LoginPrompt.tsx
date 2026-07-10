import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystem';
import styles from '../../styles/components/boot-screen.module.css';

export function LoginPrompt() {
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('root');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { login } = useSystemStore();

  useEffect(() => {
    inputRef.current?.focus();
    // Auto-submit with default credentials after a brief moment
    const timer = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 400);
    return () => clearTimeout(timer);
  }, [login]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Login incorrect');
      return;
    }
    login(username.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && error) {
      setError('');
    }
  };

  return (
    <div
      className={styles.container}
      onClick={() => formRef.current?.requestSubmit()}
      role="dialog"
      aria-label="Login prompt"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.content}
        aria-label="System login form"
      >
        <div aria-hidden="true">+============================================+</div>
        <div aria-hidden="true">|              Ann Naser Nabil              |</div>
        <div aria-hidden="true">|          CRAY X-MP/48 -- NOS 2.0          |</div>
        <div aria-hidden="true">+============================================+</div>
        <div aria-hidden="true">&nbsp;</div>
        {error && (
          <div className={styles.loginError} role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        <div aria-hidden="true">&nbsp;</div>
        <div>
          <span className={styles.loginLabel} id="login-label">LOGIN: </span>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            className={styles.loginInput}
            aria-labelledby="login-label"
            aria-required="true"
            autoFocus
            autoComplete="username"
          />
        </div>
        <div>
          <span className={styles.loginLabel} id="password-label">PASSWORD: </span>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.loginInput}
            aria-labelledby="password-label"
            aria-required="true"
            autoComplete="current-password"
          />
        </div>
      </form>
    </div>
  );
}
