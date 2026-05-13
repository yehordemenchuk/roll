import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { tokenStore } from '../tokenStore';
import { t } from '../i18n/sk';

export function Layout() {
  const { email, username, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const authed = tokenStore.hasSession();
  const authFlowPath = pathname === '/login' || pathname === '/register';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <nav className="app-nav card">
        <div className="app-nav-start">
          <NavLink to="/" className="nav-brand" end>
            CubeRoll
          </NavLink>
          <div className="nav-links">
            {!authFlowPath ? (
              <NavLink to="/" end>
                {t('nav.home')}
              </NavLink>
            ) : null}
            {authed ? (
              <>
                <NavLink to="/game">{t('nav.game')}</NavLink>
                <NavLink to="/leaderboard">{t('nav.leaderboard')}</NavLink>
              </>
            ) : null}
            {!authed ? (
              <>
                <NavLink to="/login">{t('nav.signIn')}</NavLink>
                <NavLink to="/register">{t('nav.register')}</NavLink>
              </>
            ) : null}
          </div>
        </div>
        {authed ? (
          <div className="nav-user">
            <span className="nav-email" title={username ? `${username} · ${email ?? ''}` : (email ?? '')}>
              {username ?? email ?? ''}
            </span>
            <button type="button" className="btn-ghost" onClick={() => void handleLogout()}>
              {t('nav.signOut')}
            </button>
          </div>
        ) : null}
      </nav>
      <div className="page-outlet">
        <Outlet />
      </div>
    </div>
  );
}
