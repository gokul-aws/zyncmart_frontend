import api from './axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { User, UserRole } from '@/types/user';

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  password?: string;
}

export async function fetchAdminUsers(
  filters: AdminUserFilters = {}
): Promise<PaginatedResponse<User>> {
  const { data } = await api.get<PaginatedResponse<User>>('/admin/users', {
    params: filters,
  });
  return data;
}

export async function fetchAdminUserById(id: string): Promise<User> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid user ID');
  }
  const { data } = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
  return data.data;
}

export async function createAdminUser(
  payload: CreateUserPayload
): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/admin/users', payload);
  return data.data;
}

export async function updateAdminUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid user ID');
  }
  const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}`, payload);
  return data.data;
}
