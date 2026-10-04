'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.literal(true, { error: 'You must accept the terms' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function RegisterClient() {
  const { signUp, verifyOtp, resendOtp, loading, error } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  const onSubmit = async (data: FormData) => {
    const email = await signUp({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    if (email) setPendingEmail(email);
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    if (!pendingEmail) return;
    await verifyOtp(pendingEmail, data.otp);
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    setResendMessage(null);
    const ok = await resendOtp(pendingEmail);
    setResending(false);
    if (ok) setResendMessage('A new code has been sent to your email.');
  };

  if (pendingEmail) {
    return (
      <AuthCard
        title="Verify your email"
        description={
          <>
            We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>. Enter it below to finish creating your account.
          </>
        }
        footer={
          <button type="button" onClick={() => setPendingEmail(null)} className="font-semibold text-primary hover:underline">
            Use a different email
          </button>
        }
      >
        {error && (
          <Alert variant="error" live className="mb-5 whitespace-pre-line">
            {error}
          </Alert>
        )}
        {resendMessage && (
          <Alert variant="success" live className="mb-5">
            {resendMessage}
          </Alert>
        )}

        <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-5" noValidate>
          <Field label="Verification code" error={otpErrors.otp?.message}>
            <Input {...registerOtp('otp')} type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="text-center text-lg tracking-[0.4em]" />
          </Field>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {loading ? 'Verifying…' : 'Verify & create account'}
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
      title="Create your account"
      description="It only takes a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
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
        <Field label="Full name" required error={errors.name?.message}>
          <Input {...register('name')} autoComplete="name" />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input {...register('email')} type="email" inputMode="email" autoComplete="email" />
        </Field>
        <Field label="Mobile number" required error={errors.phone?.message} hint="10-digit Indian mobile number">
          <Input {...register('phone')} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" />
        </Field>
        <Field label="Password" required error={errors.password?.message} hint="At least 8 characters">
          <PasswordInput {...register('password')} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" required error={errors.confirmPassword?.message}>
          <PasswordInput {...register('confirmPassword')} autoComplete="new-password" />
        </Field>

        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-muted-foreground">
            <input
              {...register('terms')}
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 rounded accent-primary"
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
            />
            <span>
              I agree to the{' '}
              <Link href="/policies/terms" className="font-medium text-primary hover:underline">
                Terms &amp; conditions
              </Link>{' '}
              and{' '}
              <Link href="/policies/privacy" className="font-medium text-primary hover:underline">
                Privacy policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" className="text-sm font-medium text-error">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Sending code…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
}
