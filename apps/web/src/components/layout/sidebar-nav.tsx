import {
  FileSearch,
  GitCompare,
  LayoutDashboard,
  PencilRuler,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
}

const workflowNav: NavItemDef[] = [
  { to: ROUTES.app.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.app.jobIntake, label: 'Job Description', icon: Sparkles },
  { to: ROUTES.app.resumeUpload, label: 'Upload Resume', icon: Upload },
  { to: ROUTES.app.atsReview, label: 'ATS Review', icon: FileSearch },
  { to: ROUTES.app.resumeDiff, label: 'Resume Diff', icon: GitCompare },
  { to: ROUTES.app.resumeEditor, label: 'Editor', icon: PencilRuler },
];

const accountNav: NavItemDef[] = [
  { to: ROUTES.app.profile, label: 'Profile', icon: UserRound },
  { to: ROUTES.app.settings, label: 'Settings', icon: Settings },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

function Item({ to, label, icon: Icon, onNavigate }: NavItemDef & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex h-full flex-col gap-6 px-3 py-4">
      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          Workflow
        </p>
        {workflowNav.map((item) => (
          <Item key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          Account
        </p>
        {accountNav.map((item) => (
          <Item key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-auto rounded-xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <p className="text-sm font-semibold">Pro tip</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Always start with a fresh job description. The AI tailors every section to it.
        </p>
      </div>
    </nav>
  );
}
