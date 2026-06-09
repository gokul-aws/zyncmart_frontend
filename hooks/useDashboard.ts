'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/dashboard';
import type { DashboardStats } from '@/types/dashboard';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes stale time for dashboard stats
  });
}
