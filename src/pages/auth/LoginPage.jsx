import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layouts/AuthLayout';
import { Input } from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DASHBOARD_HOME, EMAIL_RULE } from '../../utils/constants';

/** Returns the page the user originally wanted, if their role may access it. */
export function redirectTarget(from, role) {
  const path = from?.pathname;
  if (!path || ['/login', '/register', '/admin/login'].includes(path)) return DASHBOARD_HOME[role];
  if (path.startsWith('/admin') && role !== 'admin') return DASHBOARD_HOME[role];
  if (path.startsWith('/seeker') && role !== 'job_seeker') return DASHBOARD_HOME[role];
  if (path.startsWith('/employer') && role !== 'employer') return DASHBOARD_HOME[role];
  return `${path}${from.search || ''}`;
}

export default function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.loginTitle'));
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: location.state?.email || '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(t('auth.welcomeBack', { name: user.name.split(' ')[0] }));
      navigate(redirectTarget(location.state?.from, user.role), { replace: true });
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      {location.state?.message && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> {location.state.message}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && <ErrorMessage compact message={errors.root.message} />}
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email', { required: t('validation.required'), pattern: { value: EMAIL_RULE, message: t('validation.email') } })}
        />
        <div>
          <PasswordInput
            label={t('auth.password')}
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register('password', { required: t('validation.required') })}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? t('auth.signingIn') : t('auth.login')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {t('auth.noAccount')}{' '}
        <Link to="/register" state={location.state} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {t('auth.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
