import { useState } from 'react';
import { CheckCircle2, Eye, FileText, Lightbulb, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import FileDropzone from '../../components/forms/FileDropzone';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { userService } from '../../services/userService';
import { openProtectedFile } from '../../services/api';
import { RESUME_ACCEPT, RESUME_EXTENSIONS, RESUME_MAX_MB } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

export default function ResumePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.resume'));
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [opening, setOpening] = useState(false);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await userService.uploadResume(file, (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100)));
      setUser(res.data.user);
      setFile(null);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const remove = async () => {
    const res = await userService.deleteResume();
    setUser(res.data.user);
    toast.success(res.message);
  };

  const view = async () => {
    setOpening(true);
    try {
      await openProtectedFile(user.resumeUrl, user.resumeOriginalName);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOpening(false);
    }
  };

  return (
    <>
      <PageHeader title={t('resume.title')} subtitle={t('resume.subtitle')} />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">{t('resume.current')}</h2>
            {user.resumeUrl ? (
              <div className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-navy-700">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                  <FileText className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{user.resumeOriginalName || t('resume.yourResume')}</p>
                  {user.resumeUploadedAt && <p className="text-xs text-slate-500">{t('resume.uploadedOn', { date: formatDateTime(user.resumeUploadedAt) })}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={view} disabled={opening}>
                    <Eye className="h-4 w-4" /> {opening ? t('common.loading') : t('common.view')}
                  </button>
                  <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4" /> {t('common.delete')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t('resume.none')}</p>
            )}
          </section>

          <section className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-base font-semibold">{user.resumeUrl ? t('resume.replace') : t('resume.upload')}</h2>
            <FileDropzone file={file} onChange={setFile} accept={RESUME_ACCEPT} extensions={RESUME_EXTENSIONS} maxMb={RESUME_MAX_MB} disabled={uploading} />
            {uploading && progress > 0 && (
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <button type="button" className="btn btn-primary" onClick={upload} disabled={!file || uploading}>
              <Upload className="h-4 w-4" /> {uploading ? t('common.uploading') : t('resume.uploadButton')}
            </button>
          </section>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" /> {t('resume.tipsTitle')}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {['tip1', 'tip2', 'tip3', 'tip4'].map((k) => (
              <li key={k} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden /> {t(`resume.${k}`)}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title={t('resume.deleteTitle')}
        message={t('resume.deleteConfirm')}
        confirmLabel={t('common.delete')}
      />
    </>
  );
}
