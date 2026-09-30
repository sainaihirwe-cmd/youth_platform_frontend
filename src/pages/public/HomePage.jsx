import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../components/jobs/SearchBar';
import JobCard from '../../components/jobs/JobCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import Skeleton from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import CategoryIcon from '../../components/common/CategoryIcon';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { jobService } from '../../services/jobService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../utils/format';
import { categoryLabel } from '../../utils/labels';

function Stat({ value, label, loading }) {
  return (
    <div className="text-center sm:text-left">
      {loading ? <Skeleton className="mx-auto h-8 w-16 bg-white/20 sm:mx-0" /> : <p className="text-3xl font-extrabold text-white">{formatNumber(value)}</p>}
      <p className="mt-1 text-sm text-slate-300">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('landing.metaTitle'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const featured = useAsync(() => jobService.featured(6).then((r) => r.data), []);
  const latest = useAsync(() => jobService.list({ sort: 'newest', limit: 6 }).then((r) => r.data), []);
  const categories = useAsync(() => categoryService.list().then((r) => r.data), []);
  const stats = useAsync(() => jobService.stats().then((r) => r.data), []);

  const onSearch = ({ q, location }) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  const featuredIds = new Set((featured.data || []).map((j) => j._id));
  const latestOnly = (latest.data || []).filter((j) => !featuredIds.has(j._id));

  const steps = [
    { icon: UserPlus, title: t('landing.step1Title'), text: t('landing.step1Text') },
    { icon: Search, title: t('landing.step2Title'), text: t('landing.step2Text') },
    { icon: FileCheck2, title: t('landing.step3Title'), text: t('landing.step3Text') },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 dark:bg-navy-950">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-green-500/15 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.05)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container-page relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 ring-1 ring-white/15">
              <MapPin className="h-3.5 w-3.5" /> {t('landing.badge')}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('landing.heroTitle1')} <span className="text-brand-400">{t('landing.heroTitle2')}</span> {t('landing.heroTitle3')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('landing.heroSubtitle')}</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar size="lg" onSearch={onSearch} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
              <span>{t('landing.popular')}</span>
              {(categories.data || []).slice(0, 4).map((c) => (
                <Link key={c._id} to={`/jobs?category=${c.slug}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/10 hover:bg-white/20">
                  {categoryLabel(t, c)}
                </Link>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            <Stat value={stats.data?.activeJobs} label={t('landing.statJobs')} loading={stats.loading} />
            <Stat value={stats.data?.employers} label={t('landing.statEmployers')} loading={stats.loading} />
            <Stat value={stats.data?.jobSeekers} label={t('landing.statSeekers')} loading={stats.loading} />
            <Stat value={stats.data?.applications} label={t('landing.statApplications')} loading={stats.loading} />
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container-page py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.featuredTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('landing.featuredSubtitle')}</p>
          </div>
          <Link to="/jobs" className="btn btn-secondary">
            {t('landing.viewAllJobs')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.loading && !featured.data && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          {featured.error && <ErrorMessage error={featured.error} onRetry={featured.reload} className="sm:col-span-2 lg:col-span-3" />}
          {featured.data?.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
        {featured.data && featured.data.length === 0 && (
          <div className="card mt-8">
            <EmptyState
              icon={Briefcase}
              title={t('landing.noJobsTitle')}
              description={t('landing.noJobsText')}
              action={
                <Link to={user?.role === 'employer' ? '/employer/jobs/create' : '/register?role=employer'} className="btn btn-primary btn-sm">
                  {t('nav.postJob')}
                </Link>
              }
            />
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-white py-16 dark:bg-navy-900/40">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.categoriesTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('landing.categoriesSubtitle')}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {categories.loading && !categories.data && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            {categories.error && <ErrorMessage error={categories.error} onRetry={categories.reload} className="col-span-full" />}
            {categories.data?.map((c) => (
              <Link
                key={c._id}
                to={`/jobs?category=${c.slug}`}
                className="card group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover dark:hover:border-brand-700"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
                  <CategoryIcon name={c.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy-900 dark:text-white">{categoryLabel(t, c)}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t('landing.openJobs', { count: c.jobCount || 0 })}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest jobs */}
      {latestOnly.length > 0 && (
        <section className="container-page py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.latestTitle')}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t('landing.latestSubtitle')}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestOnly.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className={`py-16 ${latestOnly.length ? 'bg-white dark:bg-navy-900/40' : ''}`}>
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.howTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('landing.howSubtitle')}</p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="card relative p-6">
                <span className="absolute right-5 top-5 text-5xl font-extrabold text-slate-100 dark:text-navy-800" aria-hidden>
                  {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                  <s.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTAs */}
      <section className="container-page grid gap-6 py-16 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-10 dark:ring-1 dark:ring-navy-800">
          <Building2 className="absolute -bottom-6 -right-6 h-40 w-40 text-white/5" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">{t('landing.employerEyebrow')}</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{t('landing.employerTitle')}</h2>
          <p className="mt-3 max-w-md text-slate-300">{t('landing.employerText')}</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-200">
            {['employerPoint1', 'employerPoint2', 'employerPoint3'].map((k) => (
              <li key={k} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden /> {t(`landing.${k}`)}
              </li>
            ))}
          </ul>
          <Link to={user?.role === 'employer' ? '/employer/jobs/create' : '/register?role=employer'} className="btn btn-primary mt-7">
            {t('landing.employerCta')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-10">
          <Users className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">{t('landing.seekerEyebrow')}</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{t('landing.seekerTitle')}</h2>
          <p className="mt-3 max-w-md text-brand-50">{t('landing.seekerText')}</p>
          <ul className="mt-5 space-y-2 text-sm text-white">
            {[
              [ShieldCheck, 'seekerPoint1'],
              [BellRing, 'seekerPoint2'],
              [Briefcase, 'seekerPoint3'],
            ].map(([Icon, k]) => (
              <li key={k} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-green-300" aria-hidden /> {t(`landing.${k}`)}
              </li>
            ))}
          </ul>
          <Link to={user ? '/jobs' : '/register?role=job_seeker'} className="btn mt-7 bg-white text-brand-700 hover:bg-brand-50">
            {user ? t('landing.browseJobs') : t('landing.seekerCta')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
