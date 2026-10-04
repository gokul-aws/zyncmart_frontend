'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { forgotPassword, resetPassword } from '@/lib/api/auth';
import { getApiError } from '@/lib/api/orders';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
type EmailFormData = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const onSendCode = async (data: EmailFormData) => {
    setLoading(true);
    setApiError(null);
    try {
      await forgotPassword(data.email);
      setPendingEmail(data.email);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: ResetFormData) => {
    if (!pendingEmail) return;
    setLoading(true);
    setApiError(null);
    try {
      await resetPassword(pendingEmail, data.otp, data.password);
      setDone(true);
    } catch (err) {
      setApiError(getApiError(err, 'Invalid or expired code. Please try again.').message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    setResendMessage(null);
    try {
      await forgotPassword(pendingEmail);
      setResendMessage('A new code has been sent to your email.');
    } catch {
      setApiError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Password updated" description="Your password has been reset. You can now sign in with your new password.">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        </div>
        <Button size="lg" fullWidth onClick={() => router.push('/login')}>
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  if (pendingEmail) {
    return (
      <AuthCard
        title="Enter your code"
        description={
          <>
            If an account exists for <span className="font-medium text-foreground">{pendingEmail}</span>, we&apos;ve sent a 6-digit code to it. Enter it with your new password.
          </>
        }
        footer={
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        {apiError && (
          <Alert variant="error" live className="mb-5">
            {apiError}
          </Alert>
        )}
        {resendMessage && (
          <Alert variant="success" live className="mb-5">
            {resendMessage}
          </Alert>
        )}

        <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-5" noValidate>
          <Field label="Verification code" error={resetErrors.otp?.message}>
            <Input {...registerReset('otp')} type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="text-center text-lg tracking-[0.4em]" />
          </Field>
          <Field label="New password" error={resetErrors.password?.message} hint="At least 8 characters">
            <PasswordInput {...registerReset('password')} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" error={resetErrors.confirmPassword?.message}>
            <PasswordInput {...registerReset('confirmPassword')} autoComplete="new-password" />
          </Field>
          <Button type="submit" size="lg" fullWidth loading={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Didn&apos;t get the code?{' '}
          <button type="button" onClick={handleResend} disabled={resending} className="font-semibold text-primary hover:underline disabled:opacity-60">
            {resending ? 'Resending…' : 'Resend code'}
          </button>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your account email and we'll send you a 6-digit code to reset it."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {apiError && (
        <Alert variant="error" live className="mb-5">
          {apiError}
        </Alert>
      )}
      <form onSubmit={handleEmailSubmit(onSendCode)} className="space-y-5" noValidate>
        <Field label="Email" error={emailErrors.email?.message}>
          <Input {...registerEmail('email')} type="email" inputMode="email" autoComplete="email" />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Sending code…' : 'Send code'}
        </Button>
      </form>
    </AuthCard>
  );
}
