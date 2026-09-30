import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordInput, { PasswordStrength } from '../../components/forms/PasswordInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PASSWORD_RULE } from '../../utils/constants';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.resetTitle'));
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const toast = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });
  const password = watch('password');

  const onSubmit = async ({ password: pw }) => {
    try {
      const res = await authService.resetPassword({ token, password: pw });
      toast.success(res.message);
      navigate('/login', { replace: true });
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      {!token ? (
        <div className="space-y-4">
          <ErrorMessage compact message={t('auth.invalidResetLink')} />
          <Link to="/forgot-password" className="btn btn-primary w-full">
            {t('auth.requestNewLink')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {errors.root && <ErrorMessage compact message={errors.root.message} />}
          <div>
            <PasswordInput
              label={t('auth.newPassword')}
              autoComplete="new-password"
              required
              error={errors.password?.message}
              {...register('password', { required: t('validation.required'), pattern: { value: PASSWORD_RULE, message: t('validation.passwordStrength') } })}
            />
            <PasswordStrength value={password} />
          </div>
          <PasswordInput
            label={t('auth.confirmPassword')}
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { validate: (v) => v === password || t('validation.passwordMatch') })}
          />
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('auth.resetPassword')}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
