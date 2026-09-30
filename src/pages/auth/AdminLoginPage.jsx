import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layouts/AuthLayout';
import { Input } from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { EMAIL_RULE } from '../../utils/constants';
import { redirectTarget } from './LoginPage';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.adminLoginTitle'));
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await adminLogin(values);
      navigate(redirectTarget(location.state?.from, user.role), { replace: true });
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  return (
    <AuthLayout variant="admin" title={t('auth.adminLoginTitle')} subtitle={t('auth.adminLoginSubtitle')}>
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-navy-800 dark:bg-navy-900 dark:text-slate-300">
        <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" /> {t('auth.adminNotice')}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && <ErrorMessage compact message={errors.root.message} />}
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="username"
          required
          error={errors.email?.message}
          {...register('email', { required: t('validation.required'), pattern: { value: EMAIL_RULE, message: t('validation.email') } })}
        />
        <PasswordInput
          label={t('auth.password')}
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password', { required: t('validation.required') })}
        />
        <button type="submit" className="btn btn-navy w-full" disabled={isSubmitting}>
          {isSubmitting ? t('auth.signingIn') : t('auth.adminLogin')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-slate-500 hover:underline">
          {t('auth.notAdmin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
