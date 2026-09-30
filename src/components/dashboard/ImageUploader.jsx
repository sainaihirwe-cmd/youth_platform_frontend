import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import { useToast } from '../../context/ToastContext';
import { IMAGE_ACCEPT, IMAGE_EXTENSIONS, IMAGE_MAX_MB } from '../../utils/constants';
import { validateFile } from '../../utils/format';

/** Avatar/logo with an upload button. `upload(file)` must return a promise. */
export default function ImageUploader({ src, name, square = false, upload, label }) {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = validateFile(file, { extensions: IMAGE_EXTENSIONS, maxMb: IMAGE_MAX_MB });
    if (problem) {
      toast.error(t(problem.key, problem.params));
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    try {
      await upload(file);
      toast.success(t('profile.photoUpdated'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setPreview(null);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={preview || src} name={name} size="xl" square={square} className={busy ? 'opacity-60' : ''} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-2 text-white shadow-lg ring-4 ring-white hover:bg-brand-700 dark:ring-navy-900"
          aria-label={label || t('profile.changePhoto')}
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="text-sm">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {busy ? t('common.uploading') : label || t('profile.changePhoto')}
        </button>
        <p className="text-xs text-slate-500">{t('forms.imageHint', { size: IMAGE_MAX_MB })}</p>
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onPick} />
    </div>
  );
}
