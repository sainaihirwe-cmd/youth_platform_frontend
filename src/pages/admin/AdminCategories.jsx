import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import CategoryIcon, { CATEGORY_ICONS } from '../../components/common/CategoryIcon';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { Checkbox, Input, Textarea } from '../../components/forms/FormField';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import { applyServerErrors } from '../../utils/formErrors';
import { categoryLabel } from '../../utils/labels';

function CategoryForm({ category, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || 'Briefcase',
      isActive: category ? category.isActive : true,
    },
  });
  const icon = watch('icon');

  const onSubmit = async (v) => {
    try {
      const res = category ? await categoryService.update(category._id, v) : await categoryService.create(v);
      toast.success(res.message);
      onSaved();
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError)) setError('root', { message: err.message });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? t('adminCategories.edit') : t('adminCategories.add')}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && <ErrorMessage compact message={errors.root.message} />}
        <Input
          label={t('adminCategories.name')}
          required
          maxLength={80}
          error={errors.name?.message}
          {...register('name', { required: t('validation.required'), minLength: { value: 2, message: t('validation.minLength', { count: 2 }) } })}
        />
        <Textarea label={t('adminCategories.description')} rows={3} maxLength={500} {...register('description')} />
        <fieldset>
          <legend className="label">{t('adminCategories.icon')}</legend>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {Object.keys(CATEGORY_ICONS).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setValue('icon', name, { shouldDirty: true })}
                title={name}
                aria-label={name}
                aria-pressed={icon === name}
                className={`flex h-10 items-center justify-center rounded-lg border transition ${icon === name ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-navy-700 dark:hover:bg-navy-800'}`}
              >
                <CategoryIcon name={name} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </fieldset>
        <Checkbox label={t('adminCategories.active')} description={t('adminCategories.activeHint')} {...register('isActive')} />
      </form>
    </Modal>
  );
}

export default function AdminCategories() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.categories'));
  const toast = useToast();
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new
  const [deleting, setDeleting] = useState(null);
  const list = useAsync(() => categoryService.list(true).then((r) => r.data), []);

  const toggleActive = async (c) => {
    try {
      const res = await categoryService.update(c._id, { isActive: !c.isActive });
      toast.success(res.message);
      list.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    const res = await categoryService.remove(deleting._id);
    toast.success(res.message);
    list.reload();
  };

  return (
    <>
      <PageHeader
        title={t('adminCategories.title')}
        subtitle={t('adminCategories.subtitle')}
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> {t('adminCategories.add')}</button>}
      />
      {list.error ? (
        <ErrorMessage error={list.error} onRetry={list.reload} />
      ) : (
        <div className="card overflow-hidden">
          {list.loading && !list.data ? (
            <TableSkeleton />
          ) : !list.data?.length ? (
            <EmptyState icon={Tags} title={t('adminCategories.none')} />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-navy-800">
              {list.data.map((c) => (
                <li key={c._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <CategoryIcon name={c.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{categoryLabel(t, c)}</p>
                      <span className={`badge ${c.isActive ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300'}`}>
                        {c.isActive ? t('adminCategories.activeLabel') : t('adminCategories.inactiveLabel')}
                      </span>
                    </div>
                    {c.description && <p className="truncate text-sm text-slate-500">{c.description}</p>}
                    <p className="text-xs text-slate-500">{t('adminCategories.jobCounts', { open: c.jobCount, total: c.totalJobs ?? 0 })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleActive(c)}>
                      {c.isActive ? t('adminCategories.deactivate') : t('adminCategories.activate')}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(c)} aria-label={t('common.edit')}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleting(c)} aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {editing !== undefined && <CategoryForm category={editing} onClose={() => setEditing(undefined)} onSaved={list.reload} />}
      <ConfirmationDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={t('adminCategories.deleteTitle')}
        message={t('adminCategories.deleteConfirm', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />
    </>
  );
}
