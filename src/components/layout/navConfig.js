import {
  Bell,
  Bookmark,
  Briefcase,
  FileText,
  Flag,
  FolderKanban,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  Building2,
  UserRound,
  Users,
  Tags,
} from 'lucide-react';

export const NAV_BY_ROLE = {
  job_seeker: [
    { to: '/seeker/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/jobs', key: 'nav.findJobs', icon: Search },
    { to: '/seeker/applications', key: 'nav.myApplications', icon: FileText },
    { to: '/seeker/saved-jobs', key: 'nav.savedJobs', icon: Bookmark },
    { to: '/seeker/resume', key: 'nav.resume', icon: FolderKanban },
    { to: '/seeker/profile', key: 'nav.profile', icon: UserRound },
    { to: '/seeker/notifications', key: 'nav.notifications', icon: Bell, badge: 'notifications' },
  ],
  employer: [
    { to: '/employer/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/employer/jobs', key: 'nav.myJobs', icon: Briefcase, end: true },
    { to: '/employer/jobs/create', key: 'nav.postJob', icon: PlusCircle },
    { to: '/employer/profile', key: 'nav.companyProfile', icon: Building2 },
    { to: '/employer/notifications', key: 'nav.notifications', icon: Bell, badge: 'notifications' },
  ],
  admin: [
    { to: '/admin/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/admin/users', key: 'nav.users', icon: Users },
    { to: '/admin/jobs', key: 'nav.jobs', icon: Briefcase },
    { to: '/admin/reports', key: 'nav.reports', icon: Flag },
    { to: '/admin/categories', key: 'nav.categories', icon: Tags },
    { to: '/admin/settings', key: 'nav.settings', icon: Settings },
  ],
};
