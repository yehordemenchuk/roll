import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { t } from '../i18n/sk';

export function SessionModal() {
  const { authWall, login, resolveAuthWall } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authWall) {
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      resolveAuthWall();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
      <div className="card login-modal">
        <h2 id="session-modal-title">{t('session.title')}</h2>
        <p className="muted">{t('session.text')}</p>
        <form className="auth-form" onSubmit={(e) => void onSubmit(e)}>
          <label>
            {t('login.email')}
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            {t('login.password')}
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="status error">{error}</p> : null}
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? t('login.loading') : t('session.submit')}
            </button>
          </div>
        </form>
        <p className="muted small-gap">
          <Link
            to="/login"
            replace
            onClick={() => {
              resolveAuthWall();
            }}
          >
            {t('session.goLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
