import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layouts/AuthLayout';
import { Input } from '../../components/forms/FormField';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { EMAIL_RULE } from '../../utils/constants';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.forgotTitle'));
  const [result, setResult] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      const res = await authService.forgotPassword(email);
      setResult(res);
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {result ? (
        <div className="card space-y-4 p-6 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-green-600" aria-hidden />
          <p className="text-sm text-slate-700 dark:text-slate-300">{result.message}</p>
          {result.data?.devResetUrl && (
            <div className="rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-semibold">{t('auth.devResetNotice')}</p>
              <a href={result.data.devResetUrl} className="mt-1 block break-all text-brand-700 underline dark:text-brand-300">
                {result.data.devResetUrl}
              </a>
            </div>
          )}
          <Link to="/login" className="btn btn-secondary w-full">
            {t('auth.backToLogin')}
          </Link>
        </div>
      ) : (
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
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? t('common.sending') : t('auth.sendResetLink')}
          </button>
          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
