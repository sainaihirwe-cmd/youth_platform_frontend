import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Ban, Eye, RotateCcw, Search, Trash2, Users, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { TableSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { formatDate, formatDateTime } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

function UserDetails({ id, onClose }) {
  const { t } = useTranslation();
  const details = useAsync(() => adminService.user(id).then((r) => r.data), [id]);
  const d = details.data;
  return (
    <Modal open onClose={onClose} title={d?.user?.name || t('common.loading')} description={d?.user?.email} size="lg">
      {details.loading && !d && <CardSkeleton lines={4} />}
      {details.error && <ErrorMessage error={details.error} onRetry={details.reload} />}
      {d && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="role" status={d.user.role} />
            <StatusBadge kind="account" status={d.user.isSuspended ? 'suspended' : 'active'} />
            {d.employerProfile && <StatusBadge kind="verification" status={d.employerProfile.verificationStatus} />}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">{t('profile.phone')}</dt><dd>{d.user.phone || '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">{t('profile.location')}</dt><dd>{locationLabel(t, d.user.location) || '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">{t('adminUsers.joined')}</dt><dd>{formatDateTime(d.user.createdAt)}</dd></div>
            <div><dt className="text-xs text-slate-500">{t('adminUsers.lastLogin')}</dt><dd>{d.user.lastLoginAt ? formatDateTime(d.user.lastLoginAt) : '—'}</dd></div>
            {d.user.isSuspended && d.user.suspendedReason && (
              <div className="sm:col-span-2"><dt className="text-xs text-slate-500">{t('adminUsers.suspendedReason')}</dt><dd>{d.user.suspendedReason}</dd></div>
            )}
          </dl>
          {d.employerProfile && (
            <section>
              <h3 className="font-semibold">{d.employerProfile.companyName}</h3>
              <p className="text-slate-500">{[d.employerProfile.industry, locationLabel(t, d.employerProfile.location), d.employerProfile.website].filter(Boolean).join(' · ')}</p>
              {d.employerProfile.description && <p className="mt-2 whitespace-pre-line text-slate-700 dark:text-slate-300">{d.employerProfile.description}</p>}
            </section>
          )}
          {d.jobs.length > 0 && (
            <section>
              <h3 className="font-semibold">{t('adminUsers.jobsPosted', { count: d.jobs.length })}</h3>
              <ul className="mt-2 space-y-1.5">
                {d.jobs.map((j) => (
                  <li key={j._id} className="flex items-center justify-between gap-2">
                    <Link to={`/jobs/${j._id}`} className="truncate hover:underline">{j.title}</Link>
                    <StatusBadge kind="job" status={j.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {d.applications.length > 0 && (
            <section>
              <h3 className="font-semibold">{t('adminUsers.applicationsSent', { count: d.applications.length })}</h3>
              <ul className="mt-2 space-y-1.5">
                {d.applications.map((a) => (
                  <li key={a._id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{a.jobId?.title || t('applications.jobRemoved')}</span>
                    <StatusBadge kind="application" status={a.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h3 className="font-semibold">{t('adminUsers.reportsAgainst', { count: d.reportsAgainst.length })}</h3>
            {d.reportsAgainst.length ? (
              <ul className="mt-2 space-y-2">
                {d.reportsAgainst.map((r) => (
                  <li key={r._id} className="rounded-lg bg-slate-50 p-2.5 dark:bg-navy-950">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{t(`reportReasons.${r.reason}`)}</span>
                      <StatusBadge kind="report" status={r.status} />
                    </div>
                    {r.description && <p className="mt-1 text-slate-600 dark:text-slate-400">{r.description}</p>}
                    <p className="mt-1 text-xs text-slate-500">{r.reporterId?.name} · {formatDate(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">{t('adminUsers.noReports')}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">{t('adminUsers.reportsFiled', { count: d.reportsFiled })}</p>
          </section>
        </div>
      )}
    </Modal>
  );
}

export default function AdminUsers() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.users'));
  const toast = useToast();
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') || '';
  const status = params.get('status') || '';
  const verification = params.get('verification') || '';
  const page = Number(params.get('page')) || 1;
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 400);
  const [viewing, setViewing] = useState(null);
  const [action, setAction] = useState(null); // { type, user }

  const list = useAsync(() => adminService.users({ role, status, verification, page, q: debouncedQ, limit: 15 }), [role, status, verification, page, debouncedQ]);
  const users = list.data?.data || [];

  const setFilter = (key, value) => {
    const sp = new URLSearchParams(params);
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    setParams(sp);
  };

  const runAction = async (reason) => {
    const { type, user } = action;
    let res;
    if (type === 'suspend') res = await adminService.setUserStatus(user._id, true, reason);
    else if (type === 'reactivate') res = await adminService.setUserStatus(user._id, false);
    else if (type === 'verify') res = await adminService.setVerification(user._id, 'verified', reason);
    else if (type === 'rejectVerification') res = await adminService.setVerification(user._id, 'rejected', reason);
    else if (type === 'delete') res = await adminService.deleteUser(user._id);
    toast.success(res.message);
    list.reload();
  };

  const dialog = action && {
    suspend: { title: t('adminUsers.suspendTitle'), message: t('adminUsers.suspendConfirm', { name: action.user.name }), label: t('adminUsers.suspend'), tone: 'danger', input: { label: t('adminUsers.reason'), type: 'textarea', required: true } },
    reactivate: { title: t('adminUsers.reactivateTitle'), message: t('adminUsers.reactivateConfirm', { name: action.user.name }), label: t('adminUsers.reactivate'), tone: 'success' },
    verify: { title: t('adminUsers.verifyTitle'), message: t('adminUsers.verifyConfirm', { name: action.user.employerProfile?.companyName || action.user.name }), label: t('adminUsers.verify'), tone: 'success' },
    rejectVerification: { title: t('adminUsers.rejectVerificationTitle'), message: t('adminUsers.rejectVerificationConfirm'), label: t('adminUsers.rejectVerification'), tone: 'danger', input: { label: t('adminUsers.reasonForEmployer'), type: 'textarea', required: true } },
    delete: { title: t('adminUsers.deleteTitle'), message: t('adminUsers.deleteConfirm', { name: action.user.name }), label: t('common.delete'), tone: 'danger' },
  }[action.type];

  const Actions = ({ u }) => {
    if (u.role === 'admin') return <span className="text-xs text-slate-400">{u._id === me._id ? t('adminUsers.you') : '—'}</span>;
    return (
      <div className="flex flex-wrap justify-end gap-1">
        <button type="button" className="btn-ghost rounded-lg p-2" title={t('common.view')} aria-label={t('common.view')} onClick={() => setViewing(u._id)}>
          <Eye className="h-4 w-4" />
        </button>
        {u.role === 'employer' && u.employerProfile?.verificationStatus !== 'verified' && (
          <button type="button" className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10" title={t('adminUsers.verify')} aria-label={t('adminUsers.verify')} onClick={() => setAction({ type: 'verify', user: u })}>
            <BadgeCheck className="h-4 w-4" />
          </button>
        )}
        {u.role === 'employer' && u.employerProfile?.verificationStatus !== 'rejected' && (
          <button type="button" className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" title={t('adminUsers.rejectVerification')} aria-label={t('adminUsers.rejectVerification')} onClick={() => setAction({ type: 'rejectVerification', user: u })}>
            <XCircle className="h-4 w-4" />
          </button>
        )}
        {u.isSuspended ? (
          <button type="button" className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10" title={t('adminUsers.reactivate')} aria-label={t('adminUsers.reactivate')} onClick={() => setAction({ type: 'reactivate', user: u })}>
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title={t('adminUsers.suspend')} aria-label={t('adminUsers.suspend')} onClick={() => setAction({ type: 'suspend', user: u })}>
            <Ban className="h-4 w-4" />
          </button>
        )}
        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => setAction({ type: 'delete', user: u })}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <>
      <PageHeader title={t('adminUsers.title')} subtitle={t('adminUsers.subtitle')} />
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" className="input pl-9" placeholder={t('adminUsers.search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('adminUsers.search')} />
        </div>
        <select className="input" value={role} onChange={(e) => setFilter('role', e.target.value)} aria-label={t('adminUsers.role')}>
          <option value="">{t('adminUsers.allRoles')}</option>
          <option value="job_seeker">{t('roles.job_seeker')}</option>
          <option value="employer">{t('roles.employer')}</option>
          <option value="admin">{t('roles.admin')}</option>
        </select>
        <select className="input" value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label={t('adminUsers.accountStatus')}>
          <option value="">{t('adminUsers.allStatuses')}</option>
          <option value="active">{t('status.account.active')}</option>
          <option value="suspended">{t('status.account.suspended')}</option>
        </select>
        <select className="input" value={verification} onChange={(e) => setFilter('verification', e.target.value)} aria-label={t('adminUsers.verification')}>
          <option value="">{t('adminUsers.anyVerification')}</option>
          <option value="pending">{t('status.verification.pending')}</option>
          <option value="verified">{t('status.verification.verified')}</option>
          <option value="rejected">{t('status.verification.rejected')}</option>
        </select>
      </div>

      {list.error ? (
        <ErrorMessage error={list.error} onRetry={list.reload} />
      ) : (
        <div className="card overflow-hidden">
          {list.loading && !list.data ? (
            <TableSkeleton />
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title={t('adminUsers.none')} />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>{t('adminUsers.user')}</th>
                      <th>{t('adminUsers.role')}</th>
                      <th>{t('adminUsers.accountStatus')}</th>
                      <th>{t('adminUsers.activity')}</th>
                      <th>{t('adminUsers.joined')}</th>
                      <th className="text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar src={u.role === 'employer' ? u.employerProfile?.companyLogo || u.profileImage : u.profileImage} name={u.name} size="sm" square={u.role === 'employer'} />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{u.name}</p>
                              <p className="truncate text-xs text-slate-500">{u.email}</p>
                              {u.employerProfile && <p className="truncate text-xs text-slate-500">{u.employerProfile.companyName}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge kind="role" status={u.role} />
                            {u.employerProfile && <StatusBadge kind="verification" status={u.employerProfile.verificationStatus} />}
                          </div>
                        </td>
                        <td><StatusBadge kind="account" status={u.isSuspended ? 'suspended' : 'active'} /></td>
                        <td className="text-xs text-slate-600 dark:text-slate-400">
                          {u.role === 'employer' ? t('adminUsers.jobsCount', { count: u.jobCount }) : u.role === 'job_seeker' ? t('adminUsers.applicationsCount', { count: u.applicationCount }) : '—'}
                          {u.reportCount > 0 && <span className="ml-2 font-medium text-red-600">{t('adminUsers.reportsCount', { count: u.reportCount })}</span>}
                        </td>
                        <td className="text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                        <td><Actions u={u} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-slate-100 lg:hidden dark:divide-navy-800">
                {users.map((u) => (
                  <li key={u._id} className="space-y-2 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.profileImage} name={u.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge kind="role" status={u.role} />
                      <StatusBadge kind="account" status={u.isSuspended ? 'suspended' : 'active'} />
                      {u.employerProfile && <StatusBadge kind="verification" status={u.employerProfile.verificationStatus} />}
                    </div>
                    <Actions u={u} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <Pagination className="mt-6" pagination={list.data?.pagination} onChange={(p) => { const sp = new URLSearchParams(params); sp.set('page', String(p)); setParams(sp); }} />

      {viewing && <UserDetails id={viewing} onClose={() => setViewing(null)} />}
      <ConfirmationDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title={dialog?.title}
        message={dialog?.message}
        confirmLabel={dialog?.label}
        tone={dialog?.tone}
        input={dialog?.input}
      />
    </>
  );
}
