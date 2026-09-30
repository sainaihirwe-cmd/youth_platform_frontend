import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import ErrorMessage from '../common/ErrorMessage';
import { Select, Textarea } from '../forms/FormField';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { REPORT_REASONS } from '../../utils/constants';
import { applyServerErrors } from '../../utils/formErrors';

/** Report a job (`jobId`) or an account (`userId`). */
export default function ReportModal({ open, onClose, jobId, userId, targetName }) {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { reason: '', description: '' } });

  useEffect(() => {
    if (open) reset({ reason: jobId ? '' : 'suspicious_account', description: '' });
  }, [open, reset, jobId]);

  const onSubmit = async (values) => {
    try {
      const res = await reportService.create({
        ...(jobId ? { reportedJobId: jobId } : { reportedUserId: userId }),
        reason: values.reason,
        description: values.description,
      });
      toast.success(res.message || t('report.submitted'));
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={jobId ? t('report.titleJob') : t('report.titleUser')}
      description={targetName}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </button>
          <button type="submit" form="report-form" className="btn btn-danger" disabled={isSubmitting}>
            {isSubmitting ? t('common.submitting') : t('report.submit')}
          </button>
        </>
      }
    >
      <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('report.intro')}</p>
        {errors.root && <ErrorMessage compact message={errors.root.message} />}
        <Select label={t('report.reason')} required error={errors.reason?.message} {...register('reason', { required: t('validation.chooseReason') })}>
          <option value="">{t('report.chooseReason')}</option>
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>
              {t(`reportReasons.${r}`)}
            </option>
          ))}
        </Select>
        <Textarea
          label={t('report.details')}
          rows={4}
          placeholder={t('report.detailsPlaceholder')}
          error={errors.description?.message}
          maxLength={2000}
          {...register('description', { maxLength: { value: 2000, message: t('validation.maxLength', { count: 2000 }) } })}
        />
      </form>
    </Modal>
  );
}
