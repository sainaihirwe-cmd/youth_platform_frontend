import { Megaphone } from 'lucide-react';
import { usePublicSettings } from '../../hooks/usePublicSettings';

/** Shows the platform-wide announcement configured by administrators in Settings. */
export default function MaintenanceBanner() {
  const { settings } = usePublicSettings();
  if (!settings?.maintenanceMessage) return null;
  return (
    <div className="bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
      <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-sm font-medium">
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden /> {settings.maintenanceMessage}
      </p>
    </div>
  );
}
