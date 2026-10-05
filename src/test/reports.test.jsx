import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { renderWithProviders } from './renderWithProviders';
import MyReportsPage from '../pages/shared/MyReportsPage';
import JobEditorPage from '../pages/employer/JobEditorPage';
import AdminReports from '../pages/admin/AdminReports';
import AdminReportsPrint from '../pages/admin/AdminReportsPrint';
import api, { ApiRequestError } from '../services/api';

const employer = { _id: 'e1', name: 'Eric Mugisha', role: 'employer', email: 'eric@example.com' };
let getRoutes;

beforeEach(() => {
  getRoutes = {};
  vi.spyOn(api, 'get').mockImplementation((url) => {
    if (url in getRoutes) return Promise.resolve({ data: { success: true, ...getRoutes[url] } });
    if (url === '/auth/session') return Promise.reject(new ApiRequestError('Not authenticated', { status: 401 }));
    return Promise.resolve({ data: { success: true, data: [] } });
  });
});

describe('MyReportsPage', () => {
  it('lists submitted reports with their moderation status', async () => {
    getRoutes['/reports/my-reports'] = {
      data: [
        { _id: 'r1', reportedJobId: { _id: 'j1', title: 'Cashier wanted' }, reason: 'scam', status: 'resolved', createdAt: '2026-10-01T10:00:00Z' },
        { _id: 'r2', reportedUserId: null, reason: 'suspicious_account', status: 'pending', createdAt: '2026-10-02T10:00:00Z' },
      ],
      pagination: { page: 1, pages: 1, total: 2 },
    };
    renderWithProviders(<MyReportsPage />);
    expect(await screen.findByRole('link', { name: 'Cashier wanted' })).toHaveAttribute('href', '/jobs/j1');
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Account no longer available')).toBeInTheDocument();
    expect(screen.getByText('Waiting for a moderator to review it.')).toBeInTheDocument();
  });

  it('explains how to report when there are no reports', async () => {
    getRoutes['/reports/my-reports'] = { data: [], pagination: { page: 1, pages: 0, total: 0 } };
    renderWithProviders(<MyReportsPage />);
    expect(await screen.findByText("You haven't reported anything")).toBeInTheDocument();
  });
});

describe('JobEditorPage delete', () => {
  it('lets the owner delete a job from the edit page', async () => {
    getRoutes['/auth/session'] = { data: { user: employer, employerProfile: { companyName: 'Umurava Ltd' } } };
    getRoutes['/jobs/j1'] = { data: { job: { _id: 'j1', title: 'Cashier wanted', status: 'published', category: { _id: 'c1' } }, isOwner: true, applicationCount: 2 } };
    getRoutes['/categories'] = { data: [{ _id: 'c1', name: 'Retail', slug: 'retail' }] };
    const del = vi.spyOn(api, 'delete').mockResolvedValue({ data: { success: true, message: 'Job deleted successfully' } });

    renderWithProviders(<JobEditorPage />, {
      route: '/employer/jobs/j1/edit',
      path: '/employer/jobs/:id/edit',
      extraRoutes: <Route path="/employer/jobs" element={<p>My jobs list</p>} />,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Delete job' }));
    expect(await screen.findByText(/Its 2 applications will also be deleted/)).toBeInTheDocument();
    const confirm = screen.getAllByRole('button', { name: 'Delete' }).at(-1);
    await userEvent.click(confirm);
    expect(await screen.findByText('My jobs list')).toBeInTheDocument();
    expect(del).toHaveBeenCalledWith('/jobs/j1');
  });
});

describe('Admin report export and print', () => {
  it('downloads the filtered reports as CSV', async () => {
    getRoutes['/admin/reports'] = { data: { reports: [], counts: { pending: 0, under_review: 0, resolved: 0, dismissed: 0 } }, pagination: { page: 1, pages: 1, total: 0 } };
    const get = api.get;
    URL.createObjectURL = vi.fn(() => 'blob:csv');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    get.mockImplementation((url, config) => {
      if (url === '/admin/reports/export') {
        return Promise.resolve({ data: new Blob(['a,b']), headers: { 'content-disposition': 'attachment; filename="jobconnect-reports-2026-10-05.csv"' }, config });
      }
      if (url in getRoutes) return Promise.resolve({ data: { success: true, ...getRoutes[url] } });
      return Promise.reject(new ApiRequestError('Not authenticated', { status: 401 }));
    });

    renderWithProviders(<AdminReports />, { route: '/admin/reports?status=pending&type=job' });
    await userEvent.click(await screen.findByRole('button', { name: /Export CSV/ }));
    await vi.waitFor(() => expect(click).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith('/admin/reports/export', { params: { status: 'pending', type: 'job', format: 'csv' }, responseType: 'blob' });
    expect(screen.getByRole('link', { name: /Print/ })).toHaveAttribute('href', '/admin/reports/print?status=pending&type=job');
  });

  it('renders a printable summary and opens the print dialog', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    getRoutes['/admin/reports/export'] = {
      data: {
        rows: [
          { id: 'r1', createdAt: '2026-10-01T10:00:00Z', status: 'resolved', reason: 'scam', type: 'job', reportedJob: 'Cashier wanted', reporter: 'Aline', reporterEmail: 'a@example.com', description: 'Asked for a fee', actionTaken: 'job_removed', adminNotes: 'Removed', reviewedBy: 'Admin', reviewedAt: '2026-10-02T10:00:00Z' },
          { id: 'r2', createdAt: '2026-10-03T10:00:00Z', status: 'pending', reason: 'spam', type: 'user', reportedUser: '', reporter: 'Eric', actionTaken: 'none' },
        ],
        total: 2,
        truncated: false,
        generatedAt: '2026-10-05T10:00:00Z',
      },
    };
    renderWithProviders(<AdminReportsPrint />, { route: '/admin/reports/print?reason=scam' });
    expect(await screen.findByRole('heading', { name: 'Moderation reports' })).toBeInTheDocument();
    expect(screen.getByText('Cashier wanted')).toBeInTheDocument();
    expect(screen.getByText('Job removed')).toBeInTheDocument();
    expect(screen.getByText(/Filters: Scam or fraud/)).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(400);
    expect(print).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
