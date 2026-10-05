import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/adminService';
import { REPORT_STATUSES } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/format';

/**
 * Printer-friendly moderation report (/admin/reports/print?status=&type=&reason=).
 * Rendered outside the dashboard layout and always in light colours; opens the print dialog once loaded.
 */
export default function AdminReportsPrint() {
  const { t } = useTranslation();
  useDocumentTitle(t('reportsExport.printTitle'));
  const [params] = useSearchParams();
  const filters = { status: params.get('status') || '', type: params.get('type') || '', reason: params.get('reason') || '' };
  const data = useAsync(() => adminService.reportsForPrint(filters).then((r) => r.data), [filters.status, filters.type, filters.reason]);
  const rows = data.data?.rows || [];
  const printed = useRef(false);

  useEffect(() => {
    if (data.data && !printed.current && params.get('autoprint') !== '0') {
      printed.current = true;
      // Let the table paint before the dialog freezes the page
      setTimeout(() => window.print(), 300);
    }
  }, [data.data, params]);

  const counts = Object.fromEntries(REPORT_STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length]));
  const filterSummary = [
    filters.status && t(`status.report.${filters.status}`),
    filters.type && (filters.type === 'job' ? t('reports.jobReports') : t('reports.userReports')),
    filters.reason && t(`reportReasons.${filters.reason}`),
  ].filter(Boolean);

  const target = (r) =>
    r.type === 'job' ? r.reportedJob || t('reports.deletedTarget') : r.reportedUser || t('reports.deletedTarget');

  return (
    <div className="min-h-screen bg-white text-slate-900 print:min-h-0">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 print:max-w-none print:p-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to={`/admin/reports?${params.toString()}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> {t('reports.title')}
          </Link>
          <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!data.data}>
            <Printer className="h-4 w-4" /> {t('reportsExport.print')}
          </button>
        </div>

        {data.loading && !data.data ? (
          <LoadingSpinner />
        ) : data.error ? (
          <ErrorMessage error={data.error} onRetry={data.reload} />
        ) : (
          <>
            <header className="border-b-2 border-slate-900 pb-4">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700">JobConnect Rwanda</p>
              <h1 className="mt-1 text-2xl font-extrabold">{t('reportsExport.printTitle')}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {t('reportsExport.generatedAt', { date: formatDateTime(data.data.generatedAt) })} ·{' '}
                {t('reportsExport.filters')}: {filterSummary.length ? filterSummary.join(', ') : t('reportsExport.allReports')}
              </p>
            </header>

            <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 print:grid-cols-5" aria-label={t('reportsExport.summary')}>
              <div className="rounded-lg border border-slate-300 p-3">
                <p className="text-xs text-slate-500">{t('reportsExport.total')}</p>
                <p className="text-xl font-bold">{data.data.total}</p>
              </div>
              {REPORT_STATUSES.map((s) => (
                <div key={s} className="rounded-lg border border-slate-300 p-3">
                  <p className="text-xs text-slate-500">{t(`status.report.${s}`)}</p>
                  <p className="text-xl font-bold">{counts[s]}</p>
                </div>
              ))}
            </section>

            {data.data.truncated && (
              <p className="mt-3 text-sm text-amber-700">{t('reportsExport.truncated', { shown: rows.length, total: data.data.total })}</p>
            )}

            {rows.length === 0 ? (
              <p className="mt-8 text-center text-slate-500">{t('reports.none')}</p>
            ) : (
              <table className="mt-5 w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-400">
                    <th className="py-2 pr-2">{t('reportsExport.date')}</th>
                    <th className="py-2 pr-2">{t('reportsExport.reported')}</th>
                    <th className="py-2 pr-2">{t('reports.reason')}</th>
                    <th className="py-2 pr-2">{t('reportsExport.reporter')}</th>
                    <th className="py-2 pr-2">{t('reportsExport.statusCol')}</th>
                    <th className="py-2">{t('reportsExport.outcome')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="break-inside-avoid border-b border-slate-200 align-top">
                      <td className="whitespace-nowrap py-2 pr-2">{formatDate(r.createdAt)}</td>
                      <td className="py-2 pr-2">
                        <p className="font-semibold">{target(r)}</p>
                        <p className="text-slate-500">{r.type === 'job' ? t('reportsExport.typeJob') : t('reportsExport.typeUser')}</p>
                        {r.description && <p className="mt-1 whitespace-pre-line text-slate-700">{r.description}</p>}
                      </td>
                      <td className="py-2 pr-2">{t(`reportReasons.${r.reason}`)}</td>
                      <td className="py-2 pr-2">
                        {r.reporter || '—'}
                        {r.reporterEmail && <p className="text-slate-500">{r.reporterEmail}</p>}
                      </td>
                      <td className="whitespace-nowrap py-2 pr-2 font-medium">{t(`status.report.${r.status}`)}</td>
                      <td className="py-2">
                        {r.actionTaken !== 'none' && <p className="font-medium">{t(`reports.actions.${r.actionTaken}`)}</p>}
                        {r.adminNotes && <p className="whitespace-pre-line text-slate-700">{r.adminNotes}</p>}
                        {r.reviewedBy && (
                          <p className="text-slate-500">
                            {t('reports.reviewedBy', { name: r.reviewedBy })}
                            {r.reviewedAt && `, ${formatDate(r.reviewedAt)}`}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-6 text-[10px] text-slate-400">{t('reportsExport.confidential')}</p>
          </>
        )}
      </div>
    </div>
  );
}
