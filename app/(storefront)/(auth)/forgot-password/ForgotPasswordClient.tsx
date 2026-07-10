'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { forgotPassword, resetPassword } from '@/lib/api/auth';

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
    } catch (err: any) {
      setApiError(
        err?.response?.data?.error || 'Invalid or expired code. Please try again.'
      );
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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password reset</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been reset successfully. Please sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pendingEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter your code</h1>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="font-medium text-gray-700">{pendingEmail}</span>. Enter it below
              along with your new password.
            </p>

            {apiError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error whitespace-pre-line">
                {apiError}
              </div>
            )}
            {resendMessage && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                {resendMessage}
              </div>
            )}

            <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <input
                  {...registerReset('otp')}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {resetErrors.otp && <p className="mt-1 text-xs text-error">{resetErrors.otp.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  {...registerReset('password')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {resetErrors.password && (
                  <p className="mt-1 text-xs text-error">{resetErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  {...registerReset('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {resetErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-error">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Didn&apos;t get the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-medium text-primary hover:underline disabled:opacity-60"
              >
                {resending ? 'Resending…' : 'Resend code'}
              </button>
            </p>

            <p className="mt-2 text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setPendingEmail(null)}
                className="font-medium text-gray-600 hover:underline"
              >
                Use a different email
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email and we&apos;ll send you a verification code.
          </p>

          {apiError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error">
              {apiError}
            </div>
          )}

          <form onSubmit={handleEmailSubmit(onSendCode)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...registerEmail('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="you@example.com"
              />
              {emailErrors.email && <p className="mt-1 text-xs text-error">{emailErrors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send Code'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
