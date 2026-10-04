'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/lib/api/auth';
import { useApiValidation } from '@/hooks/useApiValidation';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button, { buttonClasses } from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const schema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordClient() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlToken = searchParams?.get('token') ?? '';

  const { apiErrors, generalError, handleApiError, clearErrors, clearFieldError } = useApiValidation<FormData>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: urlToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    clearErrors();
    try {
      await resetPassword(data.token, data.password, data.confirmPassword);
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const apiError = (field: keyof FormData) => apiErrors?.[field]?.join(' ');

  if (success) {
    return (
      <AuthCard title="Password updated" description="Your password has been reset. You can now sign in with your new password.">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        </div>
        <Link href="/login" className={buttonClasses({ size: 'lg', fullWidth: true })}>
          Sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      description="Enter your new password below."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {generalError && (
        <Alert variant="error" live className="mb-5">
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Token field only when it isn't in the URL. */}
        {!urlToken ? (
          <Field label="Reset token" error={errors.token?.message ?? apiError('token')} hint="From your password reset email">
            <Input {...register('token', { onChange: () => clearFieldError('token') })} type="text" />
          </Field>
        ) : (
          <input type="hidden" {...register('token')} />
        )}

        <Field label="New password" error={errors.password?.message ?? apiError('password')} hint="At least 8 characters">
          <PasswordInput {...register('password', { onChange: () => clearFieldError('password') })} autoComplete="new-password" />
        </Field>

        <Field label="Confirm new password" error={errors.confirmPassword?.message ?? apiError('confirmPassword')}>
          <PasswordInput {...register('confirmPassword', { onChange: () => clearFieldError('confirmPassword') })} autoComplete="new-password" />
        </Field>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthCard>
  );
}
