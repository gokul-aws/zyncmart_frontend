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
      await resetPassword(data.token, data.password);
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

              {generalError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Token Field (Only shown if token is not in URL, otherwise hidden input) */}
                {!urlToken ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                    <input
                      {...register('token', { onChange: () => clearFieldError('token') })}
                      type="text"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter the reset token from your email"
                    />
                    {errors.token && <p className="mt-1 text-xs text-error">{errors.token.message}</p>}
                    {!errors.token && apiErrors?.token?.map((msg, i) => (
                      <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                    ))}
                  </div>
                ) : (
                  <input type="hidden" {...register('token')} />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    {...register('password', { onChange: () => clearFieldError('password') })}
                    type="password"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
                  {!errors.password && apiErrors?.password?.map((msg, i) => (
                    <p key={i} className="mt-1 text-xs text-error">{msg}</p>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    {...register('confirmPassword', { onChange: () => clearFieldError('confirmPassword') })}
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
