'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchAdminOrders,
  fetchAdminOrderById,
  updateAdminOrderStatus,
} from '@/lib/api/orders';
import type { Order, OrderStatus, PaymentStatus } from '@/types/order';
import type { PaginatedResponse } from '@/types/api';

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => fetchAdminOrders(filters),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => fetchAdminOrderById(id),
    staleTime: 60_000,
  });
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status?: OrderStatus; tracking?: { carrier: string; trackingNumber: string; url: string }; paymentStatus?: PaymentStatus } }) =>
      updateAdminOrderStatus(id, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', order._id] });
      toast.success('Order updated successfully.');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update order.');
    },
  });
}
