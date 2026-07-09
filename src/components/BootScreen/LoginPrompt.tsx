import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystem';
import styles from '../../styles/components/boot-screen.module.css';

export function LoginPrompt() {
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('root');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className={styles.container} onClick={() => formRef.current?.requestSubmit()}>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.content}>
        <div>NABIL SYSTEMS v2.4.7</div>
        <div>Copyright 1987-2026</div>
        <div>&nbsp;</div>
        {error && <div style={{ color: '#ff4444' }}>{error}</div>}
        <div>&nbsp;</div>
        <div>
          <span>LOGIN: </span>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            className={styles.loginInput}
            autoFocus
          />
        </div>
        <div>
          <span>PASSWORD: </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.loginInput}
          />
        </div>
      </form>
    </div>
  );
}
