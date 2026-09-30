import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, FileText, Flag, UserX, Users, UserRound, BadgeCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { useChartTheme } from '../../components/dashboard/chartTheme';
import StatusBadge from '../../components/common/StatusBadge';
import { StatSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/adminService';
import { timeAgo } from '../../utils/format';

export default function AdminDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(t('adminDash.title'));
  const chart = useChartTheme();
  const [months, setMonths] = useState(6);
  const dash = useAsync(() => adminService.dashboard().then((r) => r.data), []);
  const analytics = useAsync(() => adminService.analytics(months).then((r) => r.data), [months]);
  const s = dash.data?.stats;
  const a = analytics.data;

  const sum = (arr, keys) => (arr || []).reduce((acc, row) => acc + keys.reduce((k, key) => k + (row[key] || 0), 0), 0);
  const categories = (a?.jobsByCategory || []).map((c) => ({ ...c, name: t(`categoryNamesByName.${c.name}`, { defaultValue: c.name }) }));
  const jobTypes = (a?.jobsByType || []).map((x) => ({ ...x, label: t(`jobTypes.${x.jobType}`) }));

  const rangeSelect = (
    <select className="input w-auto py-1.5 text-xs" value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label={t('adminDash.range')}>
      {[3, 6, 12].map((m) => (
        <option key={m} value={m}>
          {t('adminDash.lastMonths', { count: m })}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <PageHeader title={t('adminDash.title')} subtitle={t('adminDash.subtitle')} actions={rangeSelect} />

      {dash.error ? (
        <ErrorMessage error={dash.error} onRetry={dash.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {!s ? (
            Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard label={t('adminDash.totalUsers')} value={s.totalUsers} icon={Users} tone="blue" to="/admin/users" />
              <StatCard label={t('adminDash.jobSeekers')} value={s.jobSeekers} icon={UserRound} tone="violet" to="/admin/users?role=job_seeker" />
              <StatCard label={t('adminDash.employers')} value={s.employers} icon={Building2} tone="navy" to="/admin/users?role=employer" />
              <StatCard label={t('adminDash.suspended')} value={s.suspendedAccounts} icon={UserX} tone="red" to="/admin/users?status=suspended" />
              <StatCard label={t('adminDash.totalJobs')} value={s.totalJobs} icon={Briefcase} tone="navy" to="/admin/jobs" hint={t('adminDash.activeHint', { count: s.activeJobs })} />
              <StatCard label={t('adminDash.activeJobs')} value={s.activeJobs} icon={Briefcase} tone="green" to="/admin/jobs?status=published" />
              <StatCard label={t('adminDash.applications')} value={s.totalApplications} icon={FileText} tone="blue" />
              <StatCard label={t('adminDash.pendingReports')} value={s.pendingReports} icon={Flag} tone="amber" to="/admin/reports?status=pending" hint={t('adminDash.underReviewHint', { count: s.underReviewReports })} />
            </>
          )}
        </div>
      )}

      {s && (s.pendingEmployerVerifications > 0 || s.newMessages > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {s.pendingEmployerVerifications > 0 && (
            <Link to="/admin/users?verification=pending" className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-200">
              <BadgeCheck className="h-4 w-4" /> {t('adminDash.pendingVerifications', { count: s.pendingEmployerVerifications })}
            </Link>
          )}
          {s.newMessages > 0 && (
            <Link to="/admin/settings?tab=messages" className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200">
              <Mail className="h-4 w-4" /> {t('adminDash.newMessages', { count: s.newMessages })}
            </Link>
          )}
        </div>
      )}

      {analytics.error ? (
        <ErrorMessage className="mt-6" error={analytics.error} onRetry={analytics.reload} />
      ) : (
        a && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title={t('adminDash.registrations')} subtitle={t('adminDash.registrationsSubtitle')} empty={sum(a.userRegistrations, ['jobSeekers', 'employers']) === 0} emptyText={t('adminDash.noData')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.userRegistrations} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="month" tick={chart.tick} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                  <Tooltip {...chart.tooltip} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="jobSeekers" name={t('adminDash.jobSeekers')} fill={chart.series[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="employers" name={t('adminDash.employers')} fill={chart.series[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('adminDash.postingTrends')} subtitle={t('adminDash.postingTrendsSubtitle')} empty={sum(a.jobPostings, ['jobs', 'applications']) === 0} emptyText={t('adminDash.noData')}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={a.jobPostings} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="month" tick={chart.tick} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                  <Tooltip {...chart.tooltip} cursor={{ stroke: chart.axis, strokeDasharray: '3 3' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="jobs" name={t('adminDash.jobsPosted')} stroke={chart.series[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: chart.surface, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="applications" name={t('adminDash.applications')} stroke={chart.series[2]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: chart.surface, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('adminDash.byCategory')} subtitle={t('adminDash.byCategorySubtitle')} empty={!categories.length} emptyText={t('adminDash.noData')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid stroke={chart.grid} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={170} tick={chart.tick} tickLine={false} axisLine={false} interval={0} tickFormatter={(v) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)} />
                  <Tooltip {...chart.tooltip} />
                  <Bar dataKey="count" name={t('adminDash.jobs')} fill={chart.series[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('adminDash.byType')} subtitle={t('adminDash.byTypeSubtitle')} empty={!jobTypes.length} emptyText={t('adminDash.noData')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobTypes} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={chart.tick} tickLine={false} axisLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                  <Tooltip {...chart.tooltip} />
                  <Bar dataKey="count" name={t('adminDash.jobs')} fill={chart.series[0]} radius={[4, 4, 0, 0]} label={{ position: 'top', fill: chart.axis, fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )
      )}

      {dash.data && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('adminDash.recentUsers')}</h2>
              <Link to="/admin/users" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{t('common.viewAll')}</Link>
            </div>
            <ul className="mt-3 space-y-3">
              {dash.data.recentUsers.map((u) => (
                <li key={u._id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{timeAgo(u.createdAt)}</p>
                  </div>
                  <StatusBadge kind="role" status={u.role} />
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('adminDash.recentJobs')}</h2>
              <Link to="/admin/jobs" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{t('common.viewAll')}</Link>
            </div>
            <ul className="mt-3 space-y-3">
              {dash.data.recentJobs.map((j) => (
                <li key={j._id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <Link to={`/jobs/${j._id}`} className="block truncate font-medium hover:underline">{j.title}</Link>
                    <p className="truncate text-xs text-slate-500">{j.employerId?.name} · {timeAgo(j.createdAt)}</p>
                  </div>
                  <StatusBadge kind="job" status={j.status} />
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('adminDash.openReports')}</h2>
              <Link to="/admin/reports" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{t('common.viewAll')}</Link>
            </div>
            {dash.data.recentReports.length ? (
              <ul className="mt-3 space-y-3">
                {dash.data.recentReports.map((r) => (
                  <li key={r._id} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{r.reportedJobId?.title || r.reportedUserId?.name || t('reports.deletedTarget')}</p>
                      <StatusBadge kind="report" status={r.status} />
                    </div>
                    <p className="text-xs text-slate-500">{t(`reportReasons.${r.reason}`)} · {timeAgo(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t('adminDash.noOpenReports')}</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
