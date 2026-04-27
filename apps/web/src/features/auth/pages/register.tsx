import { registerSchema, type RegisterInput } from '@hireboost/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatApiError } from '@/lib/api-client';
import { ROUTES } from '@/routes/paths';

import { googleOAuthStartUrl } from '../api/auth-api';
import { useRegisterMutation } from '../hooks/use-auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      const session = await registerMutation.mutateAsync(input);
      toast.success(`Welcome aboard, ${session.user.name.split(' ')[0]}!`);
      navigate(ROUTES.app.dashboard, { replace: true });
    } catch (err) {
      toast.error('Sign up failed', { description: formatApiError(err) });
    }
  });

  const handleGoogle = () => {
    window.location.href = googleOAuthStartUrl();
  };

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Free to start. No credit card. Tailor your first resume in minutes.
        </p>
      </div>

      <Button variant="outline" className="w-full" type="button" onClick={handleGoogle}>
        <GoogleIcon className="h-4 w-4" />
        <span>Continue with Google</span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">or with email</span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Jane Doe"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting || registerMutation.isPending}
        >
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link to="#" className="underline-offset-2 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="#" className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.auth.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FFC107"
        d="M21.35 11.1H12v3.85h5.34c-.5 2.5-2.6 3.85-5.34 3.85a6 6 0 0 1 0-12 5.5 5.5 0 0 1 3.85 1.5l2.65-2.65A9.4 9.4 0 0 0 12 2.6a9.4 9.4 0 1 0 9.35 8.5z"
      />
      <path
        fill="#FF3D00"
        d="m3.15 7.35 3.15 2.3A5.5 5.5 0 0 1 12 6.8a5.5 5.5 0 0 1 3.85 1.5l2.65-2.65A9.4 9.4 0 0 0 12 2.6a9.4 9.4 0 0 0-8.85 4.75z"
      />
      <path
        fill="#4CAF50"
        d="M12 21.4a9.4 9.4 0 0 0 6.3-2.4l-2.9-2.45a5.5 5.5 0 0 1-3.4 1.1c-2.7 0-4.85-1.35-5.34-3.85l-3.1 2.4A9.4 9.4 0 0 0 12 21.4z"
      />
      <path
        fill="#1976D2"
        d="M21.35 11.1H12v3.85h5.34a4.6 4.6 0 0 1-1.94 2.6l2.9 2.45c1.7-1.55 2.8-3.95 2.8-6.6 0-.65-.07-1.3-.2-1.9z"
      />
    </svg>
  );
}

export default RegisterPage;
