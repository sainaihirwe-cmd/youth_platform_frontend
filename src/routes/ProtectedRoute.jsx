import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/** Requires an authenticated session; otherwise redirects to login and returns afterwards. */
export default function ProtectedRoute({ loginPath = '/login' }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={loginPath} replace state={{ from: location }} />;
  return <Outlet />;
}
