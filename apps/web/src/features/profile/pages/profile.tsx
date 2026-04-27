import { UserRound } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';

export function ProfilePage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Profile"
      title="Your profile"
      description="Skills, experience, preferred roles, and locations. Used as defaults when generating tailored resumes."
      phase="Phase 11"
      icon={UserRound}
    />
  );
}

export default ProfilePage;
