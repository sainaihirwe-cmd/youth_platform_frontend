import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Briefcase, FileText, Flag, Globe, GraduationCap, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/common/Avatar';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import JobCard from '../../components/jobs/JobCard';
import ReportModal from '../../components/jobs/ReportModal';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { openProtectedFile } from '../../services/api';
import { formatDate } from '../../utils/format';
import { locationLabel } from '../../utils/labels';

/** Public profile of an employer (company page) or a job seeker. */
export default function PublicProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const profile = useAsync(() => userService.getPublicProfile(id).then((r) => r.data), [id, user?._id]);
  const data = profile.data;
  const target = data?.user;
  const company = data?.employerProfile;
  useDocumentTitle(company?.companyName || target?.name);

  if (profile.loading && !data) {
    return (
      <div className="container-page max-w-4xl py-10">
        <CardSkeleton lines={5} />
      </div>
    );
  }
  if (profile.error) {
    return (
      <div className="container-page max-w-4xl py-16">
        {profile.error.status === 404 ? (
          <div className="card">
            <EmptyState icon={UserRound} title={t('publicProfile.notFound')} action={<Link to="/jobs" className="btn btn-primary btn-sm">{t('nav.findJobs')}</Link>} />
          </div>
        ) : (
          <ErrorMessage error={profile.error} onRetry={profile.reload} />
        )}
      </div>
    );
  }
  if (!target) return null;

  const isEmployer = target.role === 'employer';
  const canReport = user && user._id !== target._id && user.role !== 'admin';

  return (
    <div className="container-page max-w-5xl py-10">
      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-700" aria-hidden />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={isEmployer ? company?.companyLogo : target.profileImage}
                name={isEmployer ? company?.companyName : target.name}
                size="xl"
                square={isEmployer}
                className="ring-4 ring-white dark:ring-navy-900"
              />
              <div className="pb-1">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                  {isEmployer ? company?.companyName || target.name : target.name}
                  {isEmployer && company?.verificationStatus === 'verified' && <BadgeCheck className="h-5 w-5 text-brand-600" aria-label={t('jobs.verifiedEmployer')} />}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isEmployer ? company?.industry || t('roles.employer') : t('roles.job_seeker')} · {t('publicProfile.memberSince', { date: formatDate(target.createdAt, { month: 'long', year: 'numeric' }) })}
                </p>
              </div>
            </div>
            {canReport && (
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setReportOpen(true)}>
                <Flag className="h-4 w-4" /> {t('publicProfile.report')}
              </button>
            )}
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            {(company?.location || target.location) && (
              <li className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {locationLabel(t, company?.location || target.location)}
              </li>
            )}
            {isEmployer && company?.website && (
              <li className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <a href={company.website} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 hover:underline">
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </li>
            )}
            {user && isEmployer && company?.contactEmail && (
              <li className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> <a href={`mailto:${company.contactEmail}`} className="hover:underline">{company.contactEmail}</a>
              </li>
            )}
            {user && isEmployer && company?.phone && (
              <li className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {company.phone}
              </li>
            )}
            {!isEmployer && data.canViewPrivate && target.email && (
              <li className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> <a href={`mailto:${target.email}`} className="hover:underline">{target.email}</a>
              </li>
            )}
            {!isEmployer && data.canViewPrivate && target.phone && (
              <li className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {target.phone}
              </li>
            )}
          </ul>
        </div>
      </section>

      {isEmployer ? (
        <>
          {company?.description && (
            <section className="card mt-6 p-6 sm:p-8">
              <h2 className="text-lg font-semibold">{t('publicProfile.aboutCompany')}</h2>
              <p className="prose-job mt-3">{company.description}</p>
            </section>
          )}
          <section className="mt-8">
            <h2 className="text-xl font-bold">{t('publicProfile.openJobs', { count: data.jobs?.length || 0 })}</h2>
            {data.jobs?.length ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.jobs.map((j) => (
                  <JobCard key={j._id} job={{ ...j, employer: company }} />
                ))}
              </div>
            ) : (
              <div className="card mt-5">
                <EmptyState icon={Briefcase} title={t('publicProfile.noOpenJobs')} />
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem]">
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="text-lg font-semibold">{t('profile.summary')}</h2>
              <p className="prose-job mt-3">{target.professionalSummary || t('publicProfile.noSummary')}</p>
            </section>
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="h-5 w-5 text-brand-600" /> {t('profile.experience')}
              </h2>
              {target.experience?.length ? (
                <ul className="mt-4 space-y-4">
                  {target.experience.map((e) => (
                    <li key={e._id} className="border-l-2 border-brand-200 pl-4 dark:border-brand-800">
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{[e.company, e.location].filter(Boolean).join(' · ')}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(e.startDate, { month: 'short', year: 'numeric' })} – {e.current ? t('profile.present') : formatDate(e.endDate, { month: 'short', year: 'numeric' })}
                      </p>
                      {e.description && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{e.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{t('profile.noExperience')}</p>
              )}
            </section>
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="h-5 w-5 text-brand-600" /> {t('profile.education')}
              </h2>
              {target.education?.length ? (
                <ul className="mt-4 space-y-3">
                  {target.education.map((e) => (
                    <li key={e._id}>
                      <p className="font-semibold">{e.institution}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{[e.qualification, e.fieldOfStudy].filter(Boolean).join(', ')}</p>
                      {(e.startYear || e.endYear) && <p className="text-xs text-slate-500">{[e.startYear, e.endYear].filter(Boolean).join(' – ')}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{t('profile.noEducation')}</p>
              )}
            </section>
          </div>
          <aside className="space-y-6">
            <section className="card p-6">
              <h2 className="text-base font-semibold">{t('profile.skills')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {target.skills?.length ? target.skills.map((s) => <span key={s} className="chip">{s}</span>) : <p className="text-sm text-slate-500">{t('publicProfile.noSkills')}</p>}
              </div>
            </section>
            {data.canViewPrivate && target.resumeUrl && (
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => openProtectedFile(target.resumeUrl, target.resumeOriginalName).catch((e) => toast.error(e.message))}
              >
                <FileText className="h-4 w-4" /> {t('publicProfile.viewResume')}
              </button>
            )}
          </aside>
        </div>
      )}

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} userId={target._id} targetName={isEmployer ? company?.companyName : target.name} />
    </div>
  );
}
