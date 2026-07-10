'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { changePassword } from '@/lib/api/auth';
import { useApiValidation } from '@/hooks/useApiValidation';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordClient() {
  const [loading, setLoading] = useState(false);
  const { apiErrors, handleApiError, clearErrors, clearFieldError } = useApiValidation<FormData>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    clearErrors();
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
        <p className="text-sm text-gray-500">Update your account security settings</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              {...register('currentPassword', { onChange: () => clearFieldError('currentPassword') })}
              type="password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-error">{errors.currentPassword.message}</p>
            )}
            {!errors.currentPassword && apiErrors?.currentPassword?.map((msg, i) => (
              <p key={i} className="mt-1 text-xs text-error">{msg}</p>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              {...register('newPassword', { onChange: () => clearFieldError('newPassword') })}
              type="password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-error">{errors.newPassword.message}</p>
            )}
            {!errors.newPassword && apiErrors?.newPassword?.map((msg, i) => (
              <p key={i} className="mt-1 text-xs text-error">{msg}</p>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              {...register('confirmPassword', { onChange: () => clearFieldError('confirmPassword') })}
              type="password"
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
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
