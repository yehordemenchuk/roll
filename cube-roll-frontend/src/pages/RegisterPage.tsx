import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../auth/authApi';
import { tokenStore } from '../tokenStore';
import { t } from '../i18n/sk';

export function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenStore.hasSession()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (password.length < 4) {
      setError(t('register.passwordShort'));
      return;
    }
    setLoading(true);
    try {
      await registerRequest({
        username: username.trim(),
        email: email.trim(),
        plainPassword: password,
        userRole: 'ROLE_USER',
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container auth-narrow">
      <div className="card auth-card">
        <h1>{t('register.title')}</h1>
        <form className="auth-form" onSubmit={(e) => void onSubmit(e)}>
          <label>
            {t('register.username')}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={2}
            />
          </label>
          <label>
            {t('register.email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            {t('register.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            {t('register.passwordAgain')}
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error ? <p className="status error">{error}</p> : null}
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? t('register.loading') : t('register.submit')}
            </button>
          </div>
        </form>
        <p className="muted">
          {t('register.hasAccount')} <Link to="/login">{t('register.signInLink')}</Link>
        </p>
      </div>
    </main>
  );
}
