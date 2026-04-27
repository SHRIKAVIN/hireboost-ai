import { Settings as SettingsIcon } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';

export function SettingsPage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Settings"
      title="Account & preferences"
      description="Theme, notifications, account, billing, and integrations all live here."
      phase="Phase 11"
      icon={SettingsIcon}
    />
  );
}

export default SettingsPage;
