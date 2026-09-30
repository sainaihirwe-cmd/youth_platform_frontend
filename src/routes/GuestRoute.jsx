import { useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Pages such as login/register redirect users who were already signed in when they arrived.
 * Users who sign in on the page itself are redirected by that page (to the page they wanted),
 * so this guard must not race it with its own redirect.
 */
export default function GuestRoute() {
  const { user, initializing, homePath } = useAuth();
  const signedInOnArrival = useRef(null);
  if (initializing) return <LoadingSpinner fullPage />;
  if (signedInOnArrival.current === null) signedInOnArrival.current = Boolean(user);
  if (user && signedInOnArrival.current) return <Navigate to={homePath} replace />;
  return <Outlet />;
}
