import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { tokenStore } from '../tokenStore';
import { t } from '../i18n/sk';

export function LoginPage() {
  const { login, resolveAuthWall } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const registered = Boolean((location.state as { registered?: boolean } | null)?.registered);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resolveAuthWall();
    if (tokenStore.hasSession()) {
      navigate(from.startsWith('/login') ? '/' : from, { replace: true });
    }
  }, [resolveAuthWall, navigate, from]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container auth-narrow">
      <div className="card auth-card">
        <h1>{t('login.title')}</h1>
        {registered ? <p className="status ok">{t('login.registeredOk')}</p> : null}
        <p className="muted">{t('login.subtitle')}</p>
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
              {loading ? t('login.loading') : t('login.submit')}
            </button>
          </div>
        </form>
        <p className="muted">
          {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
        </p>
      </div>
    </main>
  );
}
