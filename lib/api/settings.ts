import api from './axios';
import type { ApiResponse } from '@/types/api';
import type { AdminSettings, UpdateAdminSettingsPayload } from '@/types/settings';

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const { data } = await api.get<ApiResponse<AdminSettings>>('/admin/settings');
  return data.data;
}

export async function updateAdminSettings(
  payload: UpdateAdminSettingsPayload
): Promise<AdminSettings> {
  const { data } = await api.put<ApiResponse<AdminSettings>>('/admin/settings', payload);
  return data.data;
}
