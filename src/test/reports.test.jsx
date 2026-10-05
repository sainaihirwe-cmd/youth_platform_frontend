import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { renderWithProviders } from './renderWithProviders';
import MyReportsPage from '../pages/shared/MyReportsPage';
import JobEditorPage from '../pages/employer/JobEditorPage';
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
