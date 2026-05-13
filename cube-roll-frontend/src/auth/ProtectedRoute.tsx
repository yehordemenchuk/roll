import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStore } from '../tokenStore';
import { useAuth } from './AuthContext';

/**
 * Ako tap-tile: pri authWall necháme Outlet (modal rieši App → SessionModal).
 */
export function ProtectedRoute() {
  const location = useLocation();
  const { authWall } = useAuth();

  if (authWall) {
    return <Outlet />;
  }

  if (!tokenStore.hasSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
