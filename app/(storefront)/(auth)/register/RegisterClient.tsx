'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="font-medium text-gray-700">{pendingEmail}</span>. Enter it below to
              finish creating your account.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error whitespace-pre-line">
                {error}
              </div>
            )}
            {resendMessage && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                {resendMessage}
              </div>
            )}

            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <input
                  {...registerOtp('otp')}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-xs text-error">{otpErrors.otp.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Verify & Create Account'}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-6">Start shopping in seconds</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-error whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Priya Sharma', autocomplete: 'name' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
              { name: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '9876543210', autocomplete: 'tel' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
              { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  {...register(field.name as keyof FormData)}
                  type={field.type}
                  autoComplete={field.autocomplete}
                  placeholder={field.placeholder}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors[field.name as keyof FormData] && (
                  <p className="mt-1 text-xs text-error">
                    {errors[field.name as keyof FormData]?.message as string}
                  </p>
                )}
              </div>
            ))}

            <div className="flex items-start gap-2">
              <input
                {...register('terms')}
                type="checkbox"
                id="terms"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/policies/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/policies/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-error">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending code…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
