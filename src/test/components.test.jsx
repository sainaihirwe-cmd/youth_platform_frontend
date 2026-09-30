import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './renderWithProviders';
import JobCard from '../components/jobs/JobCard';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import FileDropzone from '../components/forms/FileDropzone';
import api from '../services/api';
import i18n from '../i18n';

// No backend in unit tests: the session check reports "not logged in"
beforeEach(() => {
  vi.spyOn(api, 'get').mockImplementation((url) => {
    if (url === '/auth/session') return Promise.reject(Object.assign(new Error('Not authenticated'), { status: 401 }));
    return Promise.resolve({ data: { success: true, data: {} } });
  });
});

const job = {
  _id: 'job1',
  title: 'Hotel Receptionist',
  jobType: 'full_time',
  location: 'Rubavu',
  salary: { min: 200000, max: 250000, currency: 'RWF' },
  paymentType: 'monthly',
  createdAt: new Date().toISOString(),
  applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
  category: { _id: 'c1', name: 'Hospitality and Tourism', slug: 'hospitality-and-tourism', icon: 'Hotel' },
  employer: { companyName: 'Lake Kivu Hotel', verificationStatus: 'verified' },
  isFeatured: true,
};

describe('JobCard', () => {
  it('shows the key job information and links to details', () => {
    renderWithProviders(<JobCard job={job} />);
    expect(screen.getByRole('link', { name: 'Hotel Receptionist' })).toHaveAttribute('href', '/jobs/job1');
    expect(screen.getByText('Lake Kivu Hotel')).toBeInTheDocument();
    expect(screen.getByLabelText('Verified employer')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('Hospitality and Tourism')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText(/200.000 - 250.000 RWF \/ month/)).toBeInTheDocument();
    expect(screen.getByText('10 days left')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apply Now' })).toBeInTheDocument();
  });

  it('translates labels into Kinyarwanda', async () => {
    await i18n.changeLanguage('rw');
    renderWithProviders(<JobCard job={job} />);
    expect(screen.getByText('Igihe cyose')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saba Akazi' })).toBeInTheDocument();
    await i18n.changeLanguage('en');
  });
});

describe('StatusBadge', () => {
  it('renders translated statuses', () => {
    renderWithProviders(
      <>
        <StatusBadge kind="application" status="accepted" />
        <StatusBadge kind="report" status="under_review" />
      </>
    );
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('calls onChange with the chosen page and disables prev on page 1', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Pagination pagination={{ page: 1, pages: 3, total: 30, limit: 10 }} onChange={onChange} />);
    expect(screen.getByText('Showing 1–10 of 30')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
  it('renders nothing for a single page', () => {
    const { container } = renderWithProviders(<Pagination pagination={{ page: 1, pages: 1, total: 3, limit: 10 }} onChange={() => {}} />);
    expect(container.querySelector('nav')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    renderWithProviders(<EmptyState title="Nothing here" description="Try again later" action={<button type="button">Go</button>} />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});

describe('FileDropzone', () => {
  it('rejects files with a disallowed extension', async () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <FileDropzone file={null} onChange={onChange} accept=".pdf" extensions={['pdf', 'doc', 'docx']} maxMb={5} />
    );
    const input = container.querySelector('input[type="file"]');
    await userEvent.upload(input, new File(['MZ'], 'virus.exe', { type: 'application/octet-stream' }), { applyAccept: false });
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid file type');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
