'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchAdminUsers,
  fetchAdminUserById,
  createAdminUser,
  updateAdminUser,
} from '@/lib/api/users';
import type { UserRole } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';
import type { User } from '@/types/user';

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => fetchAdminUserById(id),
    staleTime: 60_000,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createAdminUser>[0]) => createAdminUser(payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created successfully.');
      router.push(`/admin/customers/${user._id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to create user.');
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAdminUser>[1] }) =>
      updateAdminUser(id, payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', user._id] });
      toast.success('User updated successfully.');
      router.push(`/admin/customers/${user._id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update user.');
    },
  });
}
