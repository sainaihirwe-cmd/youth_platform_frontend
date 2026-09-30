import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BadgeCheck, Clock, Eye, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import AccountSettings from '../../components/dashboard/AccountSettings';
import ImageUploader from '../../components/dashboard/ImageUploader';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import Tabs from '../../components/common/Tabs';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Input, LocationOptions, Select, Textarea } from '../../components/forms/FormField';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { employerService } from '../../services/employerService';
import { userService } from '../../services/userService';
import { EMAIL_RULE, PHONE_RULE } from '../../utils/constants';
import { employerProfileCompletion } from '../../utils/profileCompletion';
import { applyServerErrors } from '../../utils/formErrors';

const INDUSTRIES = ['technology', 'retail', 'hospitality', 'construction', 'education', 'agriculture', 'transport', 'health', 'finance', 'manufacturing', 'ngo', 'events', 'household', 'other'];

function VerificationBanner({ status, notes }) {
  const { t } = useTranslation();
  const map = {
    verified: { icon: BadgeCheck, cls: 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-200' },
    pending: { icon: Clock, cls: 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200' },
    rejected: { icon: XCircle, cls: 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200' },
  };
  const { icon: Icon, cls } = map[status] || map.pending;
  return (
    <div className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm ${cls}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{t(`employerProfile.verification.${status || 'pending'}`)}</p>
        <p className="opacity-90">{t(`employerProfile.verification.${status || 'pending'}Text`)}</p>
        {notes && status === 'rejected' && <p className="mt-1 italic">“{notes}”</p>}
      </div>
    </div>
  );
}

export default function EmployerProfile() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.companyProfile'));
  const { user, employerProfile, setEmployerProfile, setUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('company');
  const p = employerProfile || {};
  const values = {
    companyName: p.companyName || '',
    industry: p.industry || '',
    location: p.location || '',
    phone: p.phone || '',
    contactEmail: p.contactEmail || '',
    website: p.website || '',
    description: p.description || '',
  };
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: values, values });
  const completion = employerProfileCompletion(employerProfile, user);

  const onSubmit = async (v) => {
    try {
      const res = await employerService.updateProfile(v);
      setEmployerProfile(res.data.employerProfile);
      toast.success(res.message);
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  const uploadLogo = async (file) => {
    const res = await employerService.uploadLogo(file);
    setEmployerProfile(res.data.employerProfile);
  };
  const uploadPhoto = async (file) => {
    const res = await userService.uploadProfileImage(file);
    setUser(res.data.user);
  };

  return (
    <>
      <PageHeader
        title={t('employerProfile.title')}
        subtitle={t('employerProfile.subtitle')}
        actions={
          <Link to={`/profile/${user._id}`} className="btn btn-secondary">
            <Eye className="h-4 w-4" /> {t('profile.viewPublic')}
          </Link>
        }
      />
      <Tabs
        className="mb-6"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'company', label: t('employerProfile.tabCompany') },
          { id: 'account', label: t('profile.tabAccount') },
        ]}
      />
      {tab === 'company' ? (
        <>
          <VerificationBanner status={p.verificationStatus} notes={p.verificationNotes} />
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {errors.root && <ErrorMessage compact message={errors.root.message} />}
              <section className="card p-5 sm:p-6">
                <ImageUploader src={p.companyLogo} name={p.companyName || user.name} square upload={uploadLogo} label={t('employerProfile.changeLogo')} />
              </section>
              <section className="card space-y-5 p-5 sm:p-6">
                <h2 className="text-base font-semibold">{t('employerProfile.details')}</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={t('auth.companyName')}
                    required
                    error={errors.companyName?.message}
                    {...register('companyName', { required: t('validation.required'), minLength: { value: 2, message: t('validation.minLength', { count: 2 }) } })}
                  />
                  <Select label={t('employerProfile.industry')} {...register('industry')}>
                    <option value="">{t('employerProfile.chooseIndustry')}</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={t(`industries.${i}`, { lng: 'en' })}>
                        {t(`industries.${i}`)}
                      </option>
                    ))}
                  </Select>
                  <Select label={t('profile.location')} {...register('location')}>
                    <LocationOptions />
                  </Select>
                  <Input
                    label={t('profile.phone')}
                    type="tel"
                    placeholder="+250 7xx xxx xxx"
                    error={errors.phone?.message}
                    {...register('phone', { validate: (v) => !v || PHONE_RULE.test(v) || t('validation.phone') })}
                  />
                  <Input
                    label={t('employerProfile.contactEmail')}
                    type="email"
                    error={errors.contactEmail?.message}
                    {...register('contactEmail', { validate: (v) => !v || EMAIL_RULE.test(v) || t('validation.email') })}
                  />
                  <Input
                    label={t('employerProfile.website')}
                    type="url"
                    placeholder="https://"
                    error={errors.website?.message}
                    {...register('website', { validate: (v) => !v || /^https?:\/\/\S+\.\S+/.test(v) || t('validation.url') })}
                  />
                </div>
                <Textarea
                  label={t('employerProfile.description')}
                  rows={6}
                  maxLength={3000}
                  placeholder={t('employerProfile.descriptionPlaceholder')}
                  hint={t('apply.charCount', { count: (watch('description') || '').length })}
                  {...register('description')}
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? t('common.saving') : t('common.saveChanges')}
                  </button>
                </div>
              </section>
            </form>
            <div className="space-y-6">
              <ProfileCompletion percent={completion.percent} missing={completion.missing} keyPrefix="completion.employer" />
              <section className="card p-5">
                <h2 className="mb-4 text-base font-semibold">{t('employerProfile.contactPerson')}</h2>
                <ImageUploader src={user.profileImage} name={user.name} upload={uploadPhoto} />
                <p className="mt-4 text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </section>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-3xl">
          <AccountSettings />
        </div>
      )}
    </>
  );
}
