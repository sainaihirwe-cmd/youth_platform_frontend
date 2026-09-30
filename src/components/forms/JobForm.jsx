import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input, LocationOptions, Select, Textarea } from './FormField';
import TagInput from './TagInput';
import ErrorMessage from '../common/ErrorMessage';
import { JOB_TYPES, PAYMENT_TYPES } from '../../utils/constants';
import { toDateInput } from '../../utils/format';
import { applyServerErrors } from '../../utils/formErrors';
import { categoryLabel } from '../../utils/labels';

function defaultsFrom(job) {
  return {
    title: job?.title || '',
    description: job?.description || '',
    category: job?.category?._id || job?.category || '',
    location: job?.location || '',
    address: job?.address || '',
    jobType: job?.jobType || '',
    paymentType: job?.paymentType || 'monthly',
    salaryMin: job?.salary?.min ?? '',
    salaryMax: job?.salary?.max ?? '',
    currency: job?.salary?.currency || 'RWF',
    paymentDetails: job?.paymentDetails || '',
    vacancies: job?.vacancies || 1,
    applicationDeadline: toDateInput(job?.applicationDeadline),
    requirements: job?.requirements || [],
    responsibilities: job?.responsibilities || [],
    skillsRequired: job?.skillsRequired || [],
  };
}

const SERVER_FIELD_MAP = { 'salary.min': 'salaryMin', 'salary.max': 'salaryMax', 'salary.currency': 'currency' };

/**
 * Create / edit form for job postings.
 * `onSubmit(payload, status)` receives the API payload and the requested status ('published' | 'draft' | undefined).
 */
export default function JobForm({ job, categories = [], onSubmit, submitLabel, allowDraft = false }) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultsFrom(job) });
  const salaryMin = watch('salaryMin');
  const paymentType = watch('paymentType');
  const today = new Date().toISOString().slice(0, 10);

  const submit = (status) =>
    handleSubmit(async (v) => {
      const payload = {
        title: v.title.trim(),
        description: v.description.trim(),
        category: v.category,
        location: v.location,
        address: v.address.trim(),
        jobType: v.jobType,
        paymentType: v.paymentType,
        salary: {
          min: v.salaryMin === '' ? '' : Number(v.salaryMin),
          max: v.salaryMax === '' ? '' : Number(v.salaryMax),
          currency: v.currency,
        },
        paymentDetails: v.paymentDetails.trim(),
        vacancies: Number(v.vacancies),
        applicationDeadline: v.applicationDeadline,
        requirements: v.requirements,
        responsibilities: v.responsibilities,
        skillsRequired: v.skillsRequired,
      };
      try {
        await onSubmit(payload, status);
      } catch (err) {
        if (!applyServerErrors(err, setError, SERVER_FIELD_MAP)) setError('root', { message: err.message });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

  const activeCategories = categories.filter((c) => c.isActive !== false || c._id === (job?.category?._id || job?.category));

  return (
    <form onSubmit={submit(allowDraft ? 'published' : undefined)} className="space-y-6" noValidate>
      {errors.root && <ErrorMessage compact message={errors.root.message} />}

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('jobForm.basics')}</h2>
        <Input
          label={t('jobForm.title')}
          required
          placeholder={t('jobForm.titlePlaceholder')}
          maxLength={150}
          error={errors.title?.message}
          {...register('title', {
            required: t('validation.required'),
            minLength: { value: 3, message: t('validation.minLength', { count: 3 }) },
          })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label={t('jobForm.category')} required error={errors.category?.message} {...register('category', { required: t('validation.required') })}>
            <option value="">{t('jobForm.chooseCategory')}</option>
            {activeCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {categoryLabel(t, c)}
              </option>
            ))}
          </Select>
          <Select label={t('jobForm.jobType')} required error={errors.jobType?.message} {...register('jobType', { required: t('validation.required') })}>
            <option value="">{t('jobForm.chooseJobType')}</option>
            {JOB_TYPES.map((jt) => (
              <option key={jt} value={jt}>
                {t(`jobTypes.${jt}`)}
              </option>
            ))}
          </Select>
          <Select label={t('jobForm.location')} required error={errors.location?.message} {...register('location', { required: t('validation.required') })}>
            <LocationOptions />
          </Select>
          <Input label={t('jobForm.address')} placeholder={t('jobForm.addressPlaceholder')} maxLength={200} {...register('address')} />
        </div>
        <Textarea
          label={t('jobForm.description')}
          required
          rows={8}
          maxLength={10000}
          placeholder={t('jobForm.descriptionPlaceholder')}
          error={errors.description?.message}
          {...register('description', {
            required: t('validation.required'),
            validate: (v) => v.trim().length >= 20 || t('validation.minLength', { count: 20 }),
          })}
        />
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('jobForm.payment')}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Select label={t('jobForm.paymentType')} {...register('paymentType')}>
            {PAYMENT_TYPES.map((p) => (
              <option key={p} value={p}>
                {t(`paymentTypes.${p}`)}
              </option>
            ))}
          </Select>
          <Input
            label={t('jobForm.salaryMin')}
            type="number"
            min="0"
            inputMode="numeric"
            error={errors.salaryMin?.message}
            {...register('salaryMin', {
              validate: (v) => v === '' || Number(v) >= 0 || t('validation.positive'),
            })}
          />
          <Input
            label={t('jobForm.salaryMax')}
            type="number"
            min="0"
            inputMode="numeric"
            error={errors.salaryMax?.message}
            {...register('salaryMax', {
              validate: (v) => {
                if (v === '') return true;
                if (Number(v) < 0) return t('validation.positive');
                if (salaryMin !== '' && Number(v) < Number(salaryMin)) return t('validation.maxBelowMin');
                return true;
              },
            })}
          />
          <Select label={t('jobForm.currency')} {...register('currency')}>
            <option value="RWF">RWF</option>
            <option value="USD">USD</option>
          </Select>
        </div>
        {paymentType === 'negotiable' && <p className="field-hint -mt-2">{t('jobForm.negotiableHint')}</p>}
        <Input label={t('jobForm.paymentDetails')} placeholder={t('jobForm.paymentDetailsPlaceholder')} maxLength={500} {...register('paymentDetails')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('jobForm.vacancies')}
            type="number"
            min="1"
            max="1000"
            required
            error={errors.vacancies?.message}
            {...register('vacancies', {
              required: t('validation.required'),
              min: { value: 1, message: t('validation.min', { count: 1 }) },
              max: { value: 1000, message: t('validation.max', { count: 1000 }) },
            })}
          />
          <Input
            label={t('jobForm.deadline')}
            type="date"
            min={today}
            required
            error={errors.applicationDeadline?.message}
            {...register('applicationDeadline', {
              required: t('validation.required'),
              validate: (v) => v >= today || t('validation.futureDate'),
            })}
          />
        </div>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('jobForm.details')}</h2>
        <Controller
          name="skillsRequired"
          control={control}
          render={({ field }) => (
            <TagInput label={t('jobForm.skills')} value={field.value} onChange={field.onChange} placeholder={t('jobForm.skillsPlaceholder')} max={30} maxLength={50} />
          )}
        />
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <TagInput
              multiline
              label={t('jobForm.requirements')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('jobForm.requirementsPlaceholder')}
              hint={t('jobForm.listHint')}
              max={30}
              maxLength={300}
            />
          )}
        />
        <Controller
          name="responsibilities"
          control={control}
          render={({ field }) => (
            <TagInput
              multiline
              label={t('jobForm.responsibilities')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('jobForm.responsibilitiesPlaceholder')}
              hint={t('jobForm.listHint')}
              max={30}
              maxLength={300}
            />
          )}
        />
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {allowDraft && (
          <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={submit('draft')}>
            {t('jobForm.saveDraft')}
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : submitLabel || t('jobForm.publish')}
        </button>
      </div>
    </form>
  );
}
