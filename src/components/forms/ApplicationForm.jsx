import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Textarea } from './FormField';
import FileDropzone from './FileDropzone';
import ErrorMessage from '../common/ErrorMessage';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { RESUME_ACCEPT, RESUME_EXTENSIONS, RESUME_MAX_MB } from '../../utils/constants';
import { validateFile } from '../../utils/format';
import { applyServerErrors } from '../../utils/formErrors';

/** Cover letter + optional resume. Calls onSuccess(application) after a successful submission. */
export default function ApplicationForm({ job, onSuccess, onCancel, formId = 'application-form', onSubmittingChange }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(Boolean(user?.resumeUrl));
  const [progress, setProgress] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { coverLetter: '' } });
  const coverLetter = watch('coverLetter') || '';

  const onSubmit = async ({ coverLetter: letter }) => {
    const problem = validateFile(file, { extensions: RESUME_EXTENSIONS, maxMb: RESUME_MAX_MB });
    if (problem) {
      setError('root', { message: t(problem.key, problem.params) });
      return;
    }
    onSubmittingChange?.(true);
    try {
      const res = await applicationService.apply(
        { jobId: job._id, coverLetter: letter, resume: file || undefined, useProfileResume: !file && useProfileResume },
        (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100))
      );
      onSuccess?.(res.data.application, res.message);
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    } finally {
      setProgress(0);
      onSubmittingChange?.(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {errors.root && <ErrorMessage compact message={errors.root.message} />}
      <Textarea
        label={t('apply.coverLetter')}
        required
        rows={8}
        maxLength={5000}
        placeholder={t('apply.coverLetterPlaceholder')}
        error={errors.coverLetter?.message}
        hint={t('apply.charCount', { count: coverLetter.length })}
        {...register('coverLetter', {
          required: t('validation.coverLetterRequired'),
          validate: (v) => v.trim().length >= 30 || t('validation.minLength', { count: 30 }),
          maxLength: { value: 5000, message: t('validation.maxLength', { count: 5000 }) },
        })}
      />

      <div className="space-y-3">
        <p className="label mb-0">{t('apply.resume')}</p>
        {user?.resumeUrl && !file && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={useProfileResume} onChange={(e) => setUseProfileResume(e.target.checked)} />
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <FileText className="h-4 w-4 text-brand-600" /> {t('apply.useProfileResume')}
              </span>
              <span className="block text-slate-500 dark:text-slate-400">{user.resumeOriginalName || t('apply.profileResume')}</span>
            </span>
          </label>
        )}
        <FileDropzone
          file={file}
          onChange={setFile}
          accept={RESUME_ACCEPT}
          extensions={RESUME_EXTENSIONS}
          maxMb={RESUME_MAX_MB}
          hint={user?.resumeUrl ? t('apply.uploadDifferent', { size: RESUME_MAX_MB }) : undefined}
          disabled={isSubmitting}
        />
        {!user?.resumeUrl && (
          <p className="field-hint">
            {t('apply.noProfileResume')}{' '}
            <Link to="/seeker/resume" className="font-medium text-brand-600 hover:underline">
              {t('apply.manageResume')}
            </Link>
          </p>
        )}
      </div>

      {isSubmitting && progress > 0 && progress < 100 && (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {onCancel && (
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('common.submitting') : t('apply.submit')}
          </button>
        </div>
      )}
    </form>
  );
}
