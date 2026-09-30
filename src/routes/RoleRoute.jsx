import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DASHBOARD_HOME } from '../utils/constants';

/**
 * Restricts nested routes to the given roles. Unauthenticated users go to the matching login page;
 * authenticated users with the wrong role are sent to their own dashboard.
 * (The API enforces the same rules - this only improves the user experience.)
 */
export default function RoleRoute({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <LoadingSpinner fullPage />;
  if (!user) {
    const loginPath = roles.includes('admin') && roles.length === 1 ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  if (!roles.includes(user.role)) return <Navigate to={DASHBOARD_HOME[user.role] || '/'} replace />;
  return <Outlet />;
}
