import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PasswordInput, { PasswordStrength } from '../forms/PasswordInput';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_RULE } from '../../utils/constants';
import { applyServerErrors } from '../../utils/formErrors';

/** Change password + delete account, shared by seeker and employer profile pages. */
export default function AccountSettings({ allowDelete = true }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { setUser, setEmployerProfile } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: np }) => {
    try {
      const res = await authService.changePassword({ currentPassword, newPassword: np });
      toast.success(res.message);
      reset();
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  const deleteAccount = async (password) => {
    await userService.deleteAccount(password);
    toast.success(t('account.deleted'));
    setUser(null);
    setEmployerProfile(null);
    window.location.assign('/');
  };

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <KeyRound className="h-4 w-4 text-brand-600" /> {t('account.changePassword')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
          {errors.root && <ErrorMessage compact message={errors.root.message} className="sm:col-span-2" />}
          <PasswordInput
            className="sm:col-span-2"
            label={t('account.currentPassword')}
            autoComplete="current-password"
            required
            error={errors.currentPassword?.message}
            {...register('currentPassword', { required: t('validation.required') })}
          />
          <div>
            <PasswordInput
              label={t('auth.newPassword')}
              autoComplete="new-password"
              required
              error={errors.newPassword?.message}
              {...register('newPassword', { required: t('validation.required'), pattern: { value: PASSWORD_RULE, message: t('validation.passwordStrength') } })}
            />
            <PasswordStrength value={newPassword} />
          </div>
          <PasswordInput
            label={t('auth.confirmPassword')}
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { validate: (v) => v === newPassword || t('validation.passwordMatch') })}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('account.updatePassword')}
            </button>
          </div>
        </form>
      </section>

      {allowDelete && (
        <section className="card border-red-200 p-5 sm:p-6 dark:border-red-900/50">
          <h2 className="flex items-center gap-2 text-base font-semibold text-red-700 dark:text-red-400">
            <Trash2 className="h-4 w-4" /> {t('account.deleteTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('account.deleteText')}</p>
          <button type="button" className="btn btn-danger-outline mt-4" onClick={() => setDeleteOpen(true)}>
            {t('account.deleteButton')}
          </button>
        </section>
      )}

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteAccount}
        title={t('account.deleteTitle')}
        message={t('account.deleteConfirm')}
        confirmLabel={t('account.deleteButton')}
        input={{ label: t('account.confirmWithPassword'), type: 'password', required: true, autoComplete: 'current-password' }}
      />
    </div>
  );
}
