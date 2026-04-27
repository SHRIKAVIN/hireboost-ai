import { LogOut, Settings, UserCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  const display = user
    ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl }
    : { name: 'Guest', email: 'guest@hireboost.ai', avatarUrl: undefined };

  const onLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate(ROUTES.auth.login, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="h-7 w-7">
            {display.avatarUrl && <AvatarImage src={display.avatarUrl} alt={display.name} />}
            <AvatarFallback>{initialsFromName(display.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">{display.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case">
          <span className="text-sm font-medium text-foreground">{display.name}</span>
          <span className="truncate text-xs text-muted-foreground">{display.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.app.profile}>
            <UserCircle2 />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ROUTES.app.settings}>
            <Settings />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
