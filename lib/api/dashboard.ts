import api from './axios';
import type { DashboardStats } from '@/types/dashboard';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/admin/dashboard');
  return data.data as DashboardStats;
}
