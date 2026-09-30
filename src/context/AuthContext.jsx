import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import { DASHBOARD_HOME } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { t } = useTranslation();
  const locationRef = useRef(location);
  locationRef.current = location;
  const userRef = useRef(user);
  userRef.current = user;

  const applySession = useCallback((data) => {
    setUser(data?.user || null);
    setEmployerProfile(data?.employerProfile || null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await authService.session();
      applySession(res.data);
      return res.data;
    } catch (err) {
      applySession(null);
      if (err.status && err.status !== 401 && err.status !== 403) throw err;
      return null;
    }
  }, [applySession]);

  // Restore the session from the HTTP-only cookie on first load
  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, [refresh]);

  // Global handling of expired sessions and suspended accounts reported by the API layer
  useEffect(() => {
    const onExpired = () => {
      const current = userRef.current;
      setUser(null);
      setEmployerProfile(null);
      if (current) {
        toast.warning(t('auth.sessionExpired'));
        const loginPath = current.role === 'admin' ? '/admin/login' : '/login';
        navigate(loginPath, { replace: true, state: { from: locationRef.current } });
      }
    };
    const onSuspended = (e) => {
      setUser(null);
      setEmployerProfile(null);
      toast.error(e.detail?.message || t('auth.suspended'));
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:expired', onExpired);
    window.addEventListener('auth:suspended', onSuspended);
    return () => {
      window.removeEventListener('auth:expired', onExpired);
      window.removeEventListener('auth:suspended', onSuspended);
    };
  }, [navigate, toast, t]);

  const login = useCallback(
    async (credentials) => {
      const res = await authService.login(credentials);
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  const adminLogin = useCallback(
    async (credentials) => {
      const res = await authService.adminLogin(credentials);
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  // Registration does not start a session: the user logs in afterwards
  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* the cookie is cleared server-side; local state is cleared regardless */
    }
    applySession(null);
    navigate('/', { replace: true });
  }, [applySession, navigate]);

  const value = useMemo(
    () => ({
      user,
      employerProfile,
      initializing,
      isAuthenticated: Boolean(user),
      role: user?.role,
      homePath: user ? DASHBOARD_HOME[user.role] : '/',
      login,
      adminLogin,
      register,
      logout,
      refresh,
      setUser,
      setEmployerProfile,
    }),
    [user, employerProfile, initializing, login, adminLogin, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
