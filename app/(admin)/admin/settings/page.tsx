'use client';

import { useMemo } from 'react';
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';
import AdminPageShell from '@/components/admin/AdminPageShell';
import EmptyState from '@/components/ui/EmptyState';

export default function AdminSettingsPage() {
  const settingsQuery = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();

  const settings = settingsQuery.data;
  const isLoading = settingsQuery.isLoading;
  const isError = settingsQuery.isError;

  const memoizedSettings = useMemo(() => settings, [settings]);

  if (isLoading) {
    return (
      <AdminPageShell title="Store settings" description="Manage store configuration, payments, shipping, taxes, notifications, and profile settings.">
        <div className="space-y-4">
          <div className="h-14 rounded-3xl bg-gray-100" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-72 rounded-3xl bg-gray-100" />
            <div className="h-72 rounded-3xl bg-gray-100" />
          </div>
          <div className="h-96 rounded-3xl bg-gray-100" />
        </div>
      </AdminPageShell>
    );
  }

  if (isError || !settings) {
    return (
      <AdminPageShell title="Store settings" description="Manage store configuration, payments, shipping, taxes, notifications, and profile settings.">
        <EmptyState
          title="Unable to load settings"
          description="There was a problem retrieving the current store configuration. Please refresh the page or try again later."
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Store settings" description="Manage store configuration, payments, shipping, taxes, notifications, and profile settings.">
      <div className="space-y-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Admin settings</h1>
          <p className="mt-2 text-sm text-gray-600">Update the global store configuration used for checkout, payment, shipping, taxes, notifications, and storefront profile pages.</p>
        </div>

        <AdminSettingsForm
          settings={memoizedSettings}
          saving={updateSettingsMutation.isLoading}
          onSubmit={(payload) => updateSettingsMutation.mutate(payload)}
        />
      </div>
    </AdminPageShell>
  );
}
