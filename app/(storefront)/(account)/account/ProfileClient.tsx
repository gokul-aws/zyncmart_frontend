'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { updateProfile } from '@/lib/api/auth';
import { formatDate } from '@/lib/formatters';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Field from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfileClient() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  useEffect(() => {
    reset({ name: user?.name ?? '', phone: user?.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const updated = await updateProfile({ name: data.name, phone: data.phone || undefined });
      setAuth(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
      </div>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register('name')} type="text" autoComplete="name" />
          </Field>
          <Field label="Email" hint="Email can't be changed">
            <Input type="email" value={user.email} disabled readOnly />
          </Field>
          <Field label="Mobile number" error={errors.phone?.message} hint="10-digit Indian mobile number">
            <Input {...register('phone')} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" loading={loading} disabled={!isDirty}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
            <Link href="/account/change-password" className="text-sm font-semibold text-primary hover:underline">
              Change password
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
