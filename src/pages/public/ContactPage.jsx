import { useForm } from 'react-hook-form';
import { CheckCircle2, Mail, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '../../components/forms/FormField';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { publicService } from '../../services/publicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RULE } from '../../utils/constants';
import { applyServerErrors } from '../../utils/formErrors';

export default function ContactPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('contact.title'));
  const { settings } = usePublicSettings();
  const { user } = useAuth();
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: user?.name || '', email: user?.email || '', subject: '', message: '' } });

  const onSubmit = async (values) => {
    try {
      const res = await publicService.contact(values);
      toast.success(res.message);
      setSent(true);
      reset({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  const info = [
    { icon: Mail, label: t('contact.email'), value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: Phone, label: t('contact.phone'), value: settings.contactPhone, href: `tel:${(settings.contactPhone || '').replace(/\s/g, '')}` },
    { icon: MapPin, label: t('contact.address'), value: settings.contactAddress },
    { icon: Clock, label: t('contact.hours'), value: t('contact.hoursValue') },
  ];
  // Keyless Google Maps embed; follows the address admins set in platform settings
  const mapQuery = encodeURIComponent(settings.contactAddress || 'Kigali, Rwanda');

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold">{t('contact.title')}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('contact.subtitle')}</p>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[20rem_1fr]">
        <ul className="space-y-4">
          {info.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="card flex items-start gap-4 p-5">
              <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                {href ? (
                  <a href={href} className="font-medium text-navy-900 hover:text-brand-700 dark:text-white">
                    {value}
                  </a>
                ) : (
                  <p className="font-medium text-navy-900 dark:text-white">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden />
              <h2 className="text-xl font-bold">{t('contact.sentTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('contact.sentText')}</p>
              <button type="button" onClick={() => setSent(false)} className="btn btn-secondary mt-2">
                {t('contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <h2 className="text-lg font-semibold">{t('contact.formTitle')}</h2>
              {errors.root && <ErrorMessage compact message={errors.root.message} />}
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t('contact.name')}
                  required
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name', { required: t('validation.required'), minLength: { value: 2, message: t('validation.minLength', { count: 2 }) } })}
                />
                <Input
                  label={t('contact.email')}
                  type="email"
                  required
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email', { required: t('validation.required'), pattern: { value: EMAIL_RULE, message: t('validation.email') } })}
                />
              </div>
              <Input
                label={t('contact.subject')}
                required
                maxLength={200}
                error={errors.subject?.message}
                {...register('subject', { required: t('validation.required'), minLength: { value: 3, message: t('validation.minLength', { count: 3 }) } })}
              />
              <Textarea
                label={t('contact.message')}
                required
                rows={6}
                maxLength={5000}
                error={errors.message?.message}
                {...register('message', { required: t('validation.required'), minLength: { value: 10, message: t('validation.minLength', { count: 10 }) } })}
              />
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? t('common.sending') : t('contact.send')}
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="card mt-8 overflow-hidden" aria-labelledby="contact-map-title">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden />
            <h2 id="contact-map-title" className="text-lg font-semibold">
              {t('contact.findUs')}
            </h2>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            {t('contact.openInMaps')} <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
        <iframe
          title={t('contact.mapTitle', { address: settings.contactAddress || 'Kigali, Rwanda' })}
          src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
          className="block h-80 w-full border-0 sm:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </div>
  );
}
