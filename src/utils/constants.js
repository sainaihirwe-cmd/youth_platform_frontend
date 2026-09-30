export const ROLES = { JOB_SEEKER: 'job_seeker', EMPLOYER: 'employer', ADMIN: 'admin' };

export const JOB_TYPES = ['full_time', 'part_time', 'temporary', 'freelance', 'internship', 'contract'];
export const PAYMENT_TYPES = ['hourly', 'daily', 'weekly', 'monthly', 'fixed', 'negotiable'];
export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'];
export const REPORT_STATUSES = ['pending', 'under_review', 'resolved', 'dismissed'];
export const REPORT_REASONS = ['scam', 'misleading', 'inappropriate', 'suspicious_account', 'spam', 'other'];
export const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'];

// Mirrors backend/config/constants.js
export const PROVINCES = {
  Kigali: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
};
export const REMOTE = 'Remote';

/** Grouped options for <select>: [{ label: province, options: [province, ...districts] }] */
export const LOCATION_GROUPS = [
  ...Object.entries(PROVINCES).map(([province, districts]) => ({
    label: province,
    options: [province, ...districts],
  })),
  { label: REMOTE, options: [REMOTE] },
];

export const POSTED_WITHIN = [1, 3, 7, 14, 30];

export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RULE = /^\+?[0-9\s-]{9,20}$/;

export const RESUME_ACCEPT = '.pdf,.doc,.docx';
export const RESUME_MAX_MB = 5;
export const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];
export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const IMAGE_MAX_MB = 2;
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export const DASHBOARD_HOME = {
  job_seeker: '/seeker/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin/dashboard',
};
