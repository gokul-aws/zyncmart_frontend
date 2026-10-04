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
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginClient() {
  const { signIn, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams?.get('redirect'), '/admin/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(
        { email: data.email, password: data.password },
        redirect,
        true
      );
    } catch (err) {
      console.error('Admin login failed:', err);
    }
  };

  return (
    <AuthCard
      title="Admin sign in"
      description="Sign in with an administrator account."
      footer={
        <Link href="/" className="font-semibold text-primary hover:underline">
          Back to the store
        </Link>
      }
    >
      {error && (
        <Alert variant="error" live className="mb-5 whitespace-pre-line">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register('email')} type="email" inputMode="email" autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput {...register('password')} autoComplete="current-password" />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
