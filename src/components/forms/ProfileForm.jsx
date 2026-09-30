import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input, LocationOptions, Select, Textarea, Checkbox } from './FormField';
import TagInput from './TagInput';
import ErrorMessage from '../common/ErrorMessage';
import { PHONE_RULE } from '../../utils/constants';
import { toDateInput } from '../../utils/format';
import { applyServerErrors } from '../../utils/formErrors';

function defaultsFrom(user) {
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    professionalSummary: user?.professionalSummary || '',
    skills: user?.skills || [],
    education: (user?.education || []).map((e) => ({
      institution: e.institution || '',
      qualification: e.qualification || '',
      fieldOfStudy: e.fieldOfStudy || '',
      startYear: e.startYear || '',
      endYear: e.endYear || '',
    })),
    experience: (user?.experience || []).map((e) => ({
      title: e.title || '',
      company: e.company || '',
      location: e.location || '',
      startDate: toDateInput(e.startDate),
      endDate: toDateInput(e.endDate),
      current: Boolean(e.current),
      description: e.description || '',
    })),
  };
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined));

/** Job seeker profile form: personal details, skills, education and experience. */
export default function ProfileForm({ user, onSubmit, showCareer = true }) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: defaultsFrom(user), values: defaultsFrom(user), resetOptions: { keepDirtyValues: true } });
  const education = useFieldArray({ control, name: 'education' });
  const experience = useFieldArray({ control, name: 'experience' });
  const year = new Date().getFullYear();

  const submit = handleSubmit(async (v) => {
    const payload = {
      name: v.name.trim(),
      phone: v.phone.trim(),
      location: v.location,
      professionalSummary: v.professionalSummary.trim(),
    };
    if (showCareer) {
      payload.skills = v.skills;
      payload.education = v.education.map((e) => clean({ ...e, startYear: e.startYear ? Number(e.startYear) : '', endYear: e.endYear ? Number(e.endYear) : '' }));
      payload.experience = v.experience.map((e) => clean({ ...e, endDate: e.current ? '' : e.endDate }));
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {errors.root && <ErrorMessage compact message={errors.root.message} />}

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t('profile.personal')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('profile.fullName')}
            required
            autoComplete="name"
            error={errors.name?.message}
            {...register('name', { required: t('validation.required'), minLength: { value: 2, message: t('validation.minLength', { count: 2 }) } })}
          />
          <Input label={t('profile.email')} value={user?.email || ''} disabled hint={t('profile.emailHint')} readOnly />
          <Input
            label={t('profile.phone')}
            type="tel"
            autoComplete="tel"
            placeholder="+250 7xx xxx xxx"
            error={errors.phone?.message}
            {...register('phone', { validate: (v) => !v || PHONE_RULE.test(v) || t('validation.phone') })}
          />
          <Select label={t('profile.location')} {...register('location')}>
            <LocationOptions />
          </Select>
        </div>
        <Textarea
          label={t('profile.summary')}
          rows={5}
          maxLength={2000}
          placeholder={t('profile.summaryPlaceholder')}
          hint={t('apply.charCount', { count: (watch('professionalSummary') || '').length })}
          error={errors.professionalSummary?.message}
          {...register('professionalSummary', { maxLength: { value: 2000, message: t('validation.maxLength', { count: 2000 }) } })}
        />
      </section>

      {showCareer && (
        <>
          <section className="card space-y-5 p-5 sm:p-6">
            <h2 className="text-base font-semibold">{t('profile.skills')}</h2>
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange} placeholder={t('profile.skillsPlaceholder')} max={50} maxLength={50} />
              )}
            />
          </section>

          <section className="card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('profile.education')}</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => education.append({ institution: '', qualification: '', fieldOfStudy: '', startYear: '', endYear: '' })}
                disabled={education.fields.length >= 20}
              >
                <Plus className="h-4 w-4" /> {t('common.add')}
              </button>
            </div>
            {education.fields.length === 0 && <p className="text-sm text-slate-500">{t('profile.noEducation')}</p>}
            {education.fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('profile.institution')}
                    required
                    error={errors.education?.[i]?.institution?.message}
                    {...register(`education.${i}.institution`, { required: t('validation.required') })}
                  />
                  <Input label={t('profile.qualification')} placeholder={t('profile.qualificationPlaceholder')} {...register(`education.${i}.qualification`)} />
                  <Input label={t('profile.fieldOfStudy')} {...register(`education.${i}.fieldOfStudy`)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t('profile.startYear')}
                      type="number"
                      min="1950"
                      max={year + 10}
                      error={errors.education?.[i]?.startYear?.message}
                      {...register(`education.${i}.startYear`, {
                        validate: (v) => !v || (v >= 1950 && v <= year + 10) || t('validation.year'),
                      })}
                    />
                    <Input
                      label={t('profile.endYear')}
                      type="number"
                      min="1950"
                      max={year + 10}
                      error={errors.education?.[i]?.endYear?.message}
                      {...register(`education.${i}.endYear`, {
                        validate: (v, all) => {
                          if (!v) return true;
                          if (v < 1950 || v > year + 10) return t('validation.year');
                          const start = all.education?.[i]?.startYear;
                          return !start || Number(v) >= Number(start) || t('validation.endBeforeStart');
                        },
                      })}
                    />
                  </div>
                </div>
                <button type="button" onClick={() => education.remove(i)} className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
                  <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                </button>
              </div>
            ))}
          </section>

          <section className="card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('profile.experience')}</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => experience.append({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })}
                disabled={experience.fields.length >= 30}
              >
                <Plus className="h-4 w-4" /> {t('common.add')}
              </button>
            </div>
            {experience.fields.length === 0 && <p className="text-sm text-slate-500">{t('profile.noExperience')}</p>}
            {experience.fields.map((f, i) => {
              const current = watch(`experience.${i}.current`);
              return (
                <div key={f.id} className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t('profile.jobTitle')}
                      required
                      error={errors.experience?.[i]?.title?.message}
                      {...register(`experience.${i}.title`, { required: t('validation.required') })}
                    />
                    <Input label={t('profile.company')} {...register(`experience.${i}.company`)} />
                    <Input label={t('profile.expLocation')} {...register(`experience.${i}.location`)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label={t('profile.startDate')} type="date" {...register(`experience.${i}.startDate`)} />
                      <Input
                        label={t('profile.endDate')}
                        type="date"
                        disabled={current}
                        error={errors.experience?.[i]?.endDate?.message}
                        {...register(`experience.${i}.endDate`, {
                          validate: (v, all) => {
                            const start = all.experience?.[i]?.startDate;
                            return !v || !start || all.experience?.[i]?.current || v >= start || t('validation.endBeforeStart');
                          },
                        })}
                      />
                    </div>
                  </div>
                  <Checkbox className="mt-3" label={t('profile.currentlyWorking')} {...register(`experience.${i}.current`)} />
                  <Textarea className="mt-3" label={t('profile.expDescription')} rows={3} maxLength={1500} {...register(`experience.${i}.description`)} />
                  <button type="button" onClick={() => experience.remove(i)} className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
                    <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                  </button>
                </div>
              );
            })}
          </section>
        </>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t('common.saving') : t('common.saveChanges')}
        </button>
      </div>
    </form>
  );
}
