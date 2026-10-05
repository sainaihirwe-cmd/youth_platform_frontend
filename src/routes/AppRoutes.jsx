import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HomePage from '../pages/public/HomePage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Route-level code splitting keeps the initial bundle small on mobile networks
const JobsPage = lazy(() => import('../pages/public/JobsPage'));
const JobDetailsPage = lazy(() => import('../pages/public/JobDetailsPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const LegalPage = lazy(() => import('../pages/public/LegalPage'));
const PublicProfilePage = lazy(() => import('../pages/public/PublicProfilePage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

const SeekerDashboard = lazy(() => import('../pages/seeker/SeekerDashboard'));
const SeekerProfile = lazy(() => import('../pages/seeker/SeekerProfile'));
const SeekerApplications = lazy(() => import('../pages/seeker/SeekerApplications'));
const SavedJobsPage = lazy(() => import('../pages/seeker/SavedJobsPage'));
const ResumePage = lazy(() => import('../pages/seeker/ResumePage'));
const NotificationsPage = lazy(() => import('../pages/shared/NotificationsPage'));
const MyReportsPage = lazy(() => import('../pages/shared/MyReportsPage'));

const EmployerDashboard = lazy(() => import('../pages/employer/EmployerDashboard'));
const EmployerProfile = lazy(() => import('../pages/employer/EmployerProfile'));
const EmployerJobs = lazy(() => import('../pages/employer/EmployerJobs'));
const JobEditorPage = lazy(() => import('../pages/employer/JobEditorPage'));
const JobApplicationsPage = lazy(() => import('../pages/employer/JobApplicationsPage'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminJobs = lazy(() => import('../pages/admin/AdminJobs'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<LegalPage doc="privacy" />} />
          <Route path="terms" element={<LegalPage doc="terms" />} />
          <Route path="profile/:id" element={<PublicProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="seeker" element={<RoleRoute roles={['job_seeker']} />}>
              <Route path="dashboard" element={<SeekerDashboard />} />
              <Route path="profile" element={<SeekerProfile />} />
              <Route path="applications" element={<SeekerApplications />} />
              <Route path="saved-jobs" element={<SavedJobsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="reports" element={<MyReportsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="employer" element={<RoleRoute roles={['employer']} />}>
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="profile" element={<EmployerProfile />} />
              <Route path="jobs" element={<EmployerJobs />} />
              <Route path="jobs/create" element={<JobEditorPage />} />
              <Route path="jobs/:id/edit" element={<JobEditorPage />} />
              <Route path="jobs/:id/applications" element={<JobApplicationsPage />} />
              <Route path="reports" element={<MyReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="admin" element={<RoleRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
