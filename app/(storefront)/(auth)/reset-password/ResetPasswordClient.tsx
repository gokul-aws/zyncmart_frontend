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
import { passwordSchema } from '@/lib/validation';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

// The backend's reset-password flow is OTP-based (a 6-digit code emailed by
// POST /auth/forgot-password), not a token link, so this page collects the
// same email + otp + password used by /auth/reset-password. It isn't linked
// to from the app (the /forgot-password page handles the flow end-to-end
// inline) but is kept working for direct navigation.
const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    password: passwordSchema,
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
  const guard = useSubmitGuard();
  const searchParams = useSearchParams();
  const urlEmail = searchParams?.get('email') ?? '';
  const urlOtp = searchParams?.get('otp') ?? '';

  const { apiErrors, generalError, handleApiError, clearErrors, clearFieldError } = useApiValidation<FormData>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: urlEmail,
      otp: urlOtp,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: FormData) => guard(async () => {
    setLoading(true);
    clearErrors();
    try {
      await resetPassword(data.email, data.otp, data.password);
      setSuccess(true);
    } catch (err) {
      // Invalid/expired codes come back as a generic 400 from the backend
      // (it never reveals whether the email or the code was the problem).
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 bg-primary text-white font-semibold rounded-xl text-center hover:bg-primary-dark transition-colors text-sm"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
              <p className="text-sm text-gray-500 mb-6">
                Enter the 6-digit code we emailed you along with your new password.
              </p>

              {generalError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="rp-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    {...register('email', { onChange: () => clearFieldError('email') })}
                    id="rp-email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
                  {!errors.email && apiErrors?.email?.map((msg, i) => (
                    <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                  ))}
                </div>

                <div>
                  <label htmlFor="rp-otp" className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                  <input
                    {...register('otp', { onChange: () => clearFieldError('otp') })}
                    id="rp-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {errors.otp && <p className="mt-1 text-xs text-error">{errors.otp.message}</p>}
                  {!errors.otp && apiErrors?.otp?.map((msg, i) => (
                    <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                  ))}
                </div>

                <div>
                  <label htmlFor="rp-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    {...register('password', { onChange: () => clearFieldError('password') })}
                    id="rp-password"
                    type="password"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="••••••••"
                  />
                  {errors.password ? (
                    <p className="mt-1 text-xs text-error">{errors.password.message}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">
                      At least 8 characters, with uppercase, lowercase, a number, and a special character.
                    </p>
                  )}
                  {!errors.password && apiErrors?.password?.map((msg, i) => (
                    <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                  ))}
                </div>

                <div>
                  <label htmlFor="rp-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    {...register('confirmPassword', { onChange: () => clearFieldError('confirmPassword') })}
                    id="rp-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
                  )}
                  {!errors.confirmPassword && apiErrors?.confirmPassword?.map((msg, i) => (
                    <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                  Request a new code
                </Link>
                <span className="mx-2">·</span>
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
