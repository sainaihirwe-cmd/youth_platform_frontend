import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/dashboard/PageHeader';
import ProfileForm from '../../components/forms/ProfileForm';
import AccountSettings from '../../components/dashboard/AccountSettings';
import ImageUploader from '../../components/dashboard/ImageUploader';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import Tabs from '../../components/common/Tabs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { userService } from '../../services/userService';
import { seekerProfileCompletion } from '../../utils/profileCompletion';

export default function SeekerProfile() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.profile'));
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const completion = seekerProfileCompletion(user);

  const save = async (payload) => {
    const res = await userService.updateProfile(payload);
    setUser(res.data.user);
    toast.success(res.message);
  };

  const uploadPhoto = async (file) => {
    const res = await userService.uploadProfileImage(file);
    setUser(res.data.user);
  };

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        actions={
          <Link to={`/profile/${user._id}`} className="btn btn-secondary">
            <Eye className="h-4 w-4" /> {t('profile.viewPublic')}
          </Link>
        }
      />
      <Tabs
        className="mb-6"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'profile', label: t('profile.tabProfile') },
          { id: 'account', label: t('profile.tabAccount') },
        ]}
      />
      {tab === 'profile' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <ImageUploader src={user.profileImage} name={user.name} upload={uploadPhoto} />
            </section>
            <ProfileForm user={user} onSubmit={save} />
          </div>
          <div className="space-y-6">
            <div className="lg:sticky lg:top-24">
              <ProfileCompletion percent={completion.percent} missing={completion.missing} />
              {!user.resumeUrl && (
                <div className="card mt-6 p-5 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">{t('profile.resumeReminder')}</p>
                  <Link to="/seeker/resume" className="btn btn-primary btn-sm mt-3 w-full">
                    {t('resume.upload')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <AccountSettings />
        </div>
      )}
    </>
  );
}
