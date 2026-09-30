import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { renderWithProviders } from './renderWithProviders';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import RoleRoute from '../routes/RoleRoute';
import api, { ApiRequestError } from '../services/api';

let meResponse;
beforeEach(() => {
  meResponse = () => Promise.reject(new ApiRequestError('Not authenticated', { status: 401 }));
  vi.spyOn(api, 'get').mockImplementation((url) => {
    if (url === '/auth/session') return meResponse();
    if (url === '/settings/public') return Promise.resolve({ data: { success: true, data: { allowSeekerRegistration: true, allowEmployerRegistration: true } } });
    return Promise.resolve({ data: { success: true, data: [] } });
  });
});

describe('LoginPage', () => {
  it('validates required fields before calling the API', async () => {
    const post = vi.spyOn(api, 'post');
    renderWithProviders(<LoginPage />, { route: '/login' });
    await userEvent.click(await screen.findByRole('button', { name: 'Log in' }));
    expect(await screen.findAllByText('This field is required')).toHaveLength(2);
    expect(post).not.toHaveBeenCalled();
  });

  it('shows the API error message for invalid credentials', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new ApiRequestError('Invalid email or password.', { status: 401 }));
    renderWithProviders(<LoginPage />, { route: '/login' });
    await userEvent.type(await screen.findByLabelText(/Email address/), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'Wrong!Pass1');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('logs in and redirects to the role dashboard', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: { success: true, data: { user: { _id: 'u1', name: 'Aline Uwase', role: 'job_seeker', email: 'a@example.com' } } },
    });
    renderWithProviders(<LoginPage />, {
      route: '/login',
      path: '/login',
      extraRoutes: <Route path="/seeker/dashboard" element={<p>Seeker dashboard</p>} />,
    });
    await userEvent.type(await screen.findByLabelText(/Email address/), 'a@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Seeker dashboard')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@example.com', password: 'Str0ng!Pass' });
  });
});

describe('RegisterPage', () => {
  it('enforces strong passwords, matching confirmation and terms', async () => {
    const post = vi.spyOn(api, 'post');
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await userEvent.type(await screen.findByLabelText(/^Full name/), 'Aline Uwase');
    await userEvent.type(screen.getByLabelText(/Email address/), 'aline@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'weakpass');
    await userEvent.type(screen.getByLabelText(/Confirm password/), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText(/Use at least 8 characters/)).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(screen.getByText('You must accept the terms to continue')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('asks employers for a company name, submits the employer role and sends them to login', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { success: true, data: { user: { _id: 'e1', name: 'Eric', role: 'employer', email: 'eric@example.com' } } },
    });
    renderWithProviders(<RegisterPage />, {
      route: '/register?role=employer',
      path: '/register',
      extraRoutes: <Route path="/login" element={<LoginPage />} />,
    });
    await userEvent.type(await screen.findByLabelText(/contact person/), 'Eric Mugisha');
    await userEvent.type(screen.getByLabelText(/Company or employer name/), 'Umurava Ltd');
    await userEvent.type(screen.getByLabelText(/Email address/), 'eric@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'Str0ng!Pass');
    await userEvent.type(screen.getByLabelText(/Confirm password/), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Your account is ready. Log in to access your dashboard.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/)).toHaveValue('eric@example.com');
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({ role: 'employer', companyName: 'Umurava Ltd', email: 'eric@example.com' })
    );
    expect(post.mock.calls[0][1]).not.toHaveProperty('confirmPassword');
  });
});

describe('RoleRoute', () => {
  it('redirects guests to login', async () => {
    renderWithProviders(<RoleRoute roles={['employer']} />, {
      route: '/employer/dashboard',
      path: '/employer/*',
      extraRoutes: <Route path="/login" element={<p>Login page</p>} />,
    });
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('sends users with the wrong role to their own dashboard', async () => {
    meResponse = () => Promise.resolve({ data: { success: true, data: { user: { _id: 'u1', name: 'A', role: 'job_seeker' } } } });
    renderWithProviders(<RoleRoute roles={['admin']} />, {
      route: '/admin/users',
      path: '/admin/*',
      extraRoutes: <Route path="/seeker/dashboard" element={<p>Seeker home</p>} />,
    });
    await waitFor(() => expect(screen.getByText('Seeker home')).toBeInTheDocument());
  });
});
