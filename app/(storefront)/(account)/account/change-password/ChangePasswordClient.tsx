'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { changePassword } from '@/lib/api/auth';
import { useApiValidation } from '@/hooks/useApiValidation';
import Card from '@/components/ui/Card';
import Field from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';

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

  const apiError = (field: keyof FormData) => apiErrors?.[field]?.join(' ');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Change password</h1>
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Field label="Current password" error={errors.currentPassword?.message ?? apiError('currentPassword')}>
            <PasswordInput {...register('currentPassword', { onChange: () => clearFieldError('currentPassword') })} autoComplete="current-password" />
          </Field>
          <Field label="New password" error={errors.newPassword?.message ?? apiError('newPassword')} hint="At least 8 characters">
            <PasswordInput {...register('newPassword', { onChange: () => clearFieldError('newPassword') })} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" error={errors.confirmPassword?.message ?? apiError('confirmPassword')}>
            <PasswordInput {...register('confirmPassword', { onChange: () => clearFieldError('confirmPassword') })} autoComplete="new-password" />
          </Field>
          <Button type="submit" loading={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
