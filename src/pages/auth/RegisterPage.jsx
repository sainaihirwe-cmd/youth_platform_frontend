import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layouts/AuthLayout';
import { Input, LocationOptions, Select, Checkbox } from '../../components/forms/FormField';
import PasswordInput, { PasswordStrength } from '../../components/forms/PasswordInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { EMAIL_RULE, PASSWORD_RULE, PHONE_RULE } from '../../utils/constants';
import { applyServerErrors } from '../../utils/formErrors';

export default function RegisterPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.registerTitle'));
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const { settings } = usePublicSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'job_seeker';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { role: initialRole, name: '', companyName: '', email: '', phone: '', location: '', password: '', confirmPassword: '', terms: false },
  });
  const role = watch('role');
  const password = watch('password');
  const roleDisabled = role === 'employer' ? !settings.allowEmployerRegistration : !settings.allowSeekerRegistration;

  const onSubmit = async ({ confirmPassword, terms, ...values }) => {
    try {
      const payload = { ...values };
      if (payload.role !== 'employer') delete payload.companyName;
      if (!payload.phone) delete payload.phone;
      if (!payload.location) delete payload.location;
      const user = await registerUser(payload);
      toast.success(t('auth.registered'));
      // Keep `from` so the user still reaches the page they wanted after logging in
      navigate('/login', { replace: true, state: { from: location.state?.from, email: user.email, message: t('auth.registeredLogin') } });
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  const roles = [
    { value: 'job_seeker', icon: Briefcase, title: t('auth.roleSeeker'), text: t('auth.roleSeekerText') },
    { value: 'employer', icon: Building2, title: t('auth.roleEmployer'), text: t('auth.roleEmployerText') },
  ];

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <fieldset>
          <legend className="label">{t('auth.iAm')}</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ value, icon: Icon, title, text }) => {
              const selected = role === value;
              return (
                <label
                  key={value}
                  className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3.5 transition ${
                    selected ? 'border-brand-600 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 hover:border-slate-300 dark:border-navy-700'
                  }`}
                >
                  <input type="radio" value={value} className="sr-only" {...register('role')} onChange={() => setValue('role', value)} checked={selected} />
                  <Icon className={`h-5 w-5 ${selected ? 'text-brand-600' : 'text-slate-400'}`} aria-hidden />
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {roleDisabled && <ErrorMessage compact message={t('auth.registrationDisabled')} />}
        {errors.root && <ErrorMessage compact message={errors.root.message} />}

        <Input
          label={role === 'employer' ? t('auth.contactName') : t('auth.fullName')}
          autoComplete="name"
          required
          error={errors.name?.message}
          {...register('name', { required: t('validation.required'), minLength: { value: 2, message: t('validation.minLength', { count: 2 }) } })}
        />
        {role === 'employer' && (
          <Input
            label={t('auth.companyName')}
            autoComplete="organization"
            required
            hint={t('auth.companyNameHint')}
            error={errors.companyName?.message}
            {...register('companyName', {
              validate: (v) => role !== 'employer' || v.trim().length >= 2 || t('validation.required'),
            })}
          />
        )}
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email', { required: t('validation.required'), pattern: { value: EMAIL_RULE, message: t('validation.email') } })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('auth.phone')}
            type="tel"
            autoComplete="tel"
            placeholder="+250 7xx xxx xxx"
            error={errors.phone?.message}
            {...register('phone', { validate: (v) => !v || PHONE_RULE.test(v) || t('validation.phone') })}
          />
          <Select label={t('auth.location')} {...register('location')}>
            <LocationOptions />
          </Select>
        </div>
        <div>
          <PasswordInput
            label={t('auth.password')}
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
        <div>
          <Checkbox
            label={
              <>
                {t('auth.agreeTo')}{' '}
                <Link to="/terms" target="_blank" className="text-brand-600 hover:underline">
                  {t('footer.terms')}
                </Link>{' '}
                {t('auth.and')}{' '}
                <Link to="/privacy" target="_blank" className="text-brand-600 hover:underline">
                  {t('footer.privacy')}
                </Link>
              </>
            }
            {...register('terms', { validate: (v) => v || t('validation.acceptTerms') })}
          />
          {errors.terms && <p className="field-error">{errors.terms.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || roleDisabled}>
          {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
