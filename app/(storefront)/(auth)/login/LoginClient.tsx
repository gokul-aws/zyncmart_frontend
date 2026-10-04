'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { safeRedirect } from '@/lib/safeRedirect';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/ui/Field';
import { Input, Checkbox } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginClient() {
  const { signIn, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const searchParams = useSearchParams();
  // This page now handles both customer and admin sign-in (see AGENTS/task
  // notes on the unified login flow). With no explicit `redirect` query param,
  // land on Home; useAuth.signIn() overrides this to the admin dashboard when
  // the authenticated user's role is 'admin'. The parameter is attacker-
  // controllable, so only same-origin paths survive (see lib/safeRedirect).
  const redirect = safeRedirect(searchParams?.get('redirect'), '/');

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(
        { email: data.email, password: data.password },
        redirect,
        data.rememberMe ?? false
      );
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account"
      footer={
        <>
          New to Zyncmart?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <Alert variant="error" live className="mb-5 whitespace-pre-line">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register('email')} type="email" autoComplete="email" inputMode="email" />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          labelAside={
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput {...register('password')} autoComplete="current-password" />
        </Field>

        <Checkbox {...register('rememberMe')} label="Keep me signed in" />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
