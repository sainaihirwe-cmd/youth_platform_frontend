import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, FileText, PlusCircle, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import { useChartTheme } from '../../components/dashboard/chartTheme';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import { StatSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { employerProfileCompletion } from '../../utils/profileCompletion';
import { formatDate, timeAgo } from '../../utils/format';

export default function EmployerDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.dashboard'));
  const { user, employerProfile } = useAuth();
  const chart = useChartTheme();
  const dash = useAsync(() => employerService.dashboard().then((r) => r.data), []);
  const d = dash.data;
  const s = d?.stats;
  const completion = employerProfileCompletion(employerProfile, user);

  const trend = (d?.applicationsTrend || []).map((p) => ({ ...p, label: formatDate(p.date, { day: 'numeric', month: 'short' }) }));
  const trendTotal = trend.reduce((a, b) => a + b.count, 0);
  const byStatus = (d?.applicationsByStatus || []).map((x) => ({ ...x, label: t(`status.application.${x.status}`) }));

  return (
    <>
      <PageHeader
        title={t('employerDash.greeting', { name: employerProfile?.companyName || user?.name })}
        subtitle={t('employerDash.subtitle')}
        actions={
          <Link to="/employer/jobs/create" className="btn btn-primary">
            <PlusCircle className="h-4 w-4" /> {t('nav.postJob')}
          </Link>
        }
      />

      {dash.error ? (
        <ErrorMessage error={dash.error} onRetry={dash.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {!s ? (
            Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard label={t('employerDash.activeJobs')} value={s.activeJobs} icon={Briefcase} tone="blue" to="/employer/jobs?status=active" />
              <StatCard label={t('employerDash.closedJobs')} value={s.closedJobs + s.expiredJobs} icon={Archive} tone="navy" to="/employer/jobs?status=closed" />
              <StatCard label={t('employerDash.totalApplications')} value={s.totalApplications} icon={FileText} tone="violet" />
              <StatCard label={t('employerDash.pending')} value={s.pendingApplications} icon={Clock} tone="amber" />
              <StatCard label={t('employerDash.accepted')} value={s.acceptedApplicants} icon={CheckCircle2} tone="green" />
            </>
          )}
        </div>
      )}

      {d && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title={t('employerDash.trendTitle')} subtitle={t('employerDash.trendSubtitle')} empty={trendTotal === 0} emptyText={t('employerDash.noApplicationsYet')}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="label" tick={chart.tick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                <Tooltip {...chart.tooltip} cursor={{ stroke: chart.axis, strokeDasharray: '3 3' }} />
                <Line type="monotone" dataKey="count" name={t('employerDash.applications')} stroke={chart.series[0]} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: chart.surface }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('employerDash.statusTitle')} subtitle={t('employerDash.statusSubtitle')} empty={s.totalApplications === 0} emptyText={t('employerDash.noApplicationsYet')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 16, right: 12, left: -16, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="label" tick={chart.tick} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                <Tooltip {...chart.tooltip} />
                <Bar dataKey="count" name={t('employerDash.applications')} radius={[4, 4, 0, 0]} label={{ position: 'top', fill: chart.axis, fontSize: 11 }}>
                  {byStatus.map((x) => (
                    <Cell key={x.status} fill={chart.status[x.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {d.applicationsPerJob.length > 0 && (
            <ChartCard className="lg:col-span-2" title={t('employerDash.perJobTitle')} subtitle={t('employerDash.perJobSubtitle')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.applicationsPerJob} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid stroke={chart.grid} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={chart.tick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="title" width={150} tick={chart.tick} tickLine={false} axisLine={false} tickFormatter={(v) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)} />
                  <Tooltip {...chart.tooltip} />
                  <Bar dataKey="total" name={t('employerDash.applications')} fill={chart.series[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">{t('employerDash.recentApplications')}</h2>
          {dash.loading && !d ? (
            <CardSkeleton lines={2} />
          ) : d?.recentApplications?.length ? (
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-navy-800">
              {d.recentApplications.map((a) => (
                <li key={a._id} className="flex items-center gap-3 py-3">
                  <Avatar src={a.applicantId?.profileImage} name={a.applicantId?.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.applicantId?.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {a.jobId?.title} · {timeAgo(a.appliedAt)}
                    </p>
                  </div>
                  <StatusBadge kind="application" status={a.status} />
                  {a.jobId && (
                    <Link to={`/employer/jobs/${a.jobId._id}/applications`} className="btn btn-secondary btn-sm">
                      {t('common.review')}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} title={t('employerDash.noApplicationsYet')} description={t('employerDash.noApplicationsHint')} />
          )}
        </section>
        <div className="space-y-6">
          <ProfileCompletion percent={completion.percent} missing={completion.missing} to="/employer/profile" keyPrefix="completion.employer" />
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t('employerDash.recentJobs')}</h2>
              <Link to="/employer/jobs" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t('common.viewAll')}
              </Link>
            </div>
            {d?.recentJobs?.length ? (
              <ul className="mt-3 space-y-3">
                {d.recentJobs.map((j) => (
                  <li key={j._id} className="flex items-center justify-between gap-2">
                    <Link to={`/employer/jobs/${j._id}/applications`} className="min-w-0 truncate text-sm font-medium hover:text-brand-700 dark:hover:text-brand-300">
                      {j.title}
                    </Link>
                    <StatusBadge kind="job" status={j.status === 'published' && new Date(j.applicationDeadline) < new Date() ? 'expired' : j.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t('employerDash.noJobs')}</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
