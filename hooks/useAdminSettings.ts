'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchAdminSettings, updateAdminSettings } from '@/lib/api/settings';
import type { AdminSettings, UpdateAdminSettingsPayload } from '@/types/settings';

export function useAdminSettings() {
  return useQuery<AdminSettings>({
    queryKey: ['admin', 'settings'],
    queryFn: fetchAdminSettings,
    staleTime: 60_000,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: UpdateAdminSettingsPayload) => updateAdminSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Settings saved successfully.');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save settings.');
    },
  });
}
