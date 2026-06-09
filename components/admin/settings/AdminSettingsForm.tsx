'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AdminSettings } from '@/types/settings';

const adminSettingsSchema = z.object({
  store: z.object({
    storeName: z.string().min(2, 'Store name is required'),
    storeDescription: z.string().max(280).optional(),
    storeEmail: z.string().email('Enter a valid email'),
    storePhone: z.string().min(6, 'Enter a valid phone number'),
    storeAddressLine1: z.string().min(2, 'Address line 1 is required'),
    storeAddressLine2: z.string().optional(),
    storeCity: z.string().min(2, 'City is required'),
    storeState: z.string().min(2, 'State is required'),
    storePincode: z.string().min(2, 'Pincode is required'),
    storeCountry: z.string().min(2, 'Country is required'),
    currency: z.string().min(1, 'Currency is required'),
  }),
  payment: z.object({
    defaultPaymentMethod: z.enum(['razorpay', 'cod']),
    razorpayKeyId: z.string().min(5, 'Razorpay Key ID is required'),
    razorpayKeySecret: z.string().min(5, 'Razorpay Key Secret is required'),
    codEnabled: z.boolean(),
    codLimit: z.number().min(0, 'COD order limit must be zero or more'),
  }),
  shipping: z.object({
    shippingRate: z.number().min(0, 'Shipping rate must be zero or more'),
    freeShippingThreshold: z.number().min(0, 'Free shipping threshold must be zero or more'),
    defaultShippingRegion: z.string().min(2, 'Shipping region is required'),
  }),
  tax: z.object({
    taxRate: z.number().min(0, 'Tax rate must be zero or more'),
    taxId: z.string().min(2, 'Tax ID is required'),
    taxInclusive: z.boolean(),
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    orderConfirmationEmail: z.boolean(),
    shippingUpdateEmail: z.boolean(),
    promotionalEmails: z.boolean(),
  }),
  profile: z.object({
    supportEmail: z.string().email('Support email is required'),
    supportPhone: z.string().min(6, 'Support phone is required'),
    returnPolicyUrl: z.string().url('Enter a valid URL'),
    privacyPolicyUrl: z.string().url('Enter a valid URL'),
    termsUrl: z.string().url('Enter a valid URL'),
  }),
});

type SettingsFormValues = z.infer<typeof adminSettingsSchema>;

interface AdminSettingsFormProps {
  settings: AdminSettings;
  saving: boolean;
  onSubmit: (payload: SettingsFormValues) => void;
}

export default function AdminSettingsForm({ settings, saving, onSubmit }: AdminSettingsFormProps) {
  const defaultValues = useMemo(
    () => ({
      store: settings.store,
      payment: settings.payment,
      shipping: settings.shipping,
      tax: settings.tax,
      notifications: settings.notifications,
      profile: settings.profile,
    }),
    [settings]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Store configuration</h2>
            <p className="text-sm text-gray-500">Update the storefront branding, contact details, and currency settings.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Store name</span>
            <input
              {...register('store.storeName')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeName && <p className="text-sm text-red-600">{errors.store.storeName.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Currency</span>
            <input
              {...register('store.currency')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.currency && <p className="text-sm text-red-600">{errors.store.currency.message}</p>}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-gray-900">Store description</span>
            <textarea
              {...register('store.storeDescription')}
              rows={3}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeDescription && (
              <p className="text-sm text-red-600">{errors.store.storeDescription.message}</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Store email</span>
            <input
              type="email"
              {...register('store.storeEmail')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeEmail && <p className="text-sm text-red-600">{errors.store.storeEmail.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Store phone</span>
            <input
              {...register('store.storePhone')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storePhone && <p className="text-sm text-red-600">{errors.store.storePhone.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Address line 1</span>
            <input
              {...register('store.storeAddressLine1')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeAddressLine1 && (
              <p className="text-sm text-red-600">{errors.store.storeAddressLine1.message}</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Address line 2</span>
            <input
              {...register('store.storeAddressLine2')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">City</span>
            <input
              {...register('store.storeCity')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeCity && <p className="text-sm text-red-600">{errors.store.storeCity.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">State</span>
            <input
              {...register('store.storeState')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeState && <p className="text-sm text-red-600">{errors.store.storeState.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Pincode</span>
            <input
              {...register('store.storePincode')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storePincode && <p className="text-sm text-red-600">{errors.store.storePincode.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Country</span>
            <input
              {...register('store.storeCountry')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.store?.storeCountry && <p className="text-sm text-red-600">{errors.store.storeCountry.message}</p>}
          </label>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Payment settings</h2>
          <p className="mt-2 text-sm text-gray-500">Configure payment gateway and COD behavior for the store.</p>

          <div className="mt-6 space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Default payment method</span>
              <select
                {...register('payment.defaultPaymentMethod')}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="razorpay">Razorpay</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Razorpay Key ID</span>
              <input
                {...register('payment.razorpayKeyId')}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.payment?.razorpayKeyId && (
                <p className="text-sm text-red-600">{errors.payment.razorpayKeyId.message}</p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Razorpay Key Secret</span>
              <input
                {...register('payment.razorpayKeySecret')}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.payment?.razorpayKeySecret && (
                <p className="text-sm text-red-600">{errors.payment.razorpayKeySecret.message}</p>
              )}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm">
                <input type="checkbox" {...register('payment.codEnabled')} className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
                Enable COD
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-900">COD order limit</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...register('payment.codLimit', { valueAsNumber: true })}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.payment?.codLimit && <p className="text-sm text-red-600">{errors.payment.codLimit.message}</p>}
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Shipping & tax</h2>
          <p className="mt-2 text-sm text-gray-500">Set default shipping pricing, free shipping threshold, and tax collection rules.</p>

          <div className="mt-6 space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Shipping rate</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('shipping.shippingRate', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.shipping?.shippingRate && (
                <p className="text-sm text-red-600">{errors.shipping.shippingRate.message}</p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Free shipping threshold</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('shipping.freeShippingThreshold', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.shipping?.freeShippingThreshold && (
                <p className="text-sm text-red-600">{errors.shipping.freeShippingThreshold.message}</p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Default shipping region</span>
              <input
                {...register('shipping.defaultShippingRegion')}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.shipping?.defaultShippingRegion && (
                <p className="text-sm text-red-600">{errors.shipping.defaultShippingRegion.message}</p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Tax rate (%)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('tax.taxRate', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.tax?.taxRate && <p className="text-sm text-red-600">{errors.tax.taxRate.message}</p>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-900">Tax ID</span>
              <input
                {...register('tax.taxId')}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.tax?.taxId && <p className="text-sm text-red-600">{errors.tax.taxId.message}</p>}
            </label>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm">
              <input type="checkbox" {...register('tax.taxInclusive')} className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
              Prices include tax
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Choose how the store sends updates and marketing messages.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Email notifications', field: 'notifications.emailNotifications' },
            { label: 'SMS notifications', field: 'notifications.smsNotifications' },
            { label: 'Order confirmation email', field: 'notifications.orderConfirmationEmail' },
            { label: 'Shipping update email', field: 'notifications.shippingUpdateEmail' },
            { label: 'Promotional emails', field: 'notifications.promotionalEmails' },
          ].map((item) => (
            <label key={item.field} className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm">
              <input type="checkbox" {...register(item.field as any)} className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Profile settings</h2>
        <p className="mt-2 text-sm text-gray-500">Support contact details and external policy URLs used for customer-facing pages.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Support email</span>
            <input
              type="email"
              {...register('profile.supportEmail')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.profile?.supportEmail && <p className="text-sm text-red-600">{errors.profile.supportEmail.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-900">Support phone</span>
            <input
              {...register('profile.supportPhone')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.profile?.supportPhone && <p className="text-sm text-red-600">{errors.profile.supportPhone.message}</p>}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-gray-900">Return policy URL</span>
            <input
              {...register('profile.returnPolicyUrl')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.profile?.returnPolicyUrl && <p className="text-sm text-red-600">{errors.profile.returnPolicyUrl.message}</p>}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-gray-900">Privacy policy URL</span>
            <input
              {...register('profile.privacyPolicyUrl')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.profile?.privacyPolicyUrl && <p className="text-sm text-red-600">{errors.profile.privacyPolicyUrl.message}</p>}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-gray-900">Terms of service URL</span>
            <input
              {...register('profile.termsUrl')}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.profile?.termsUrl && <p className="text-sm text-red-600">{errors.profile.termsUrl.message}</p>}
          </label>
        </div>
      </section>

      {settings.audit && settings.audit.length > 0 ? (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Audit log</h2>
              <p className="text-sm text-gray-500">Recent configuration changes and audit entries generated by the system.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
            <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 sm:px-6">Most recent changes</div>
            <div className="divide-y divide-gray-200">
              {settings.audit.map((entry) => (
                <div key={entry._id} className="px-4 py-4 sm:px-6">
                  <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                  <p className="mt-1 text-sm text-gray-600">{entry.details || 'No additional details provided.'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>{entry.actor}</span>
                    <span>•</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving settings...' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
