import api from './axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Order, OrderStatus, PaymentStatus, OrderQuote } from '@/types/order';
import type { Address } from '@/types/user';

export async function fetchUserOrders(): Promise<Order[]> {
  const { data } = await api.get('/orders');
  return data.data as Order[];
}

export async function fetchOrderById(id: string): Promise<Order> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid order ID');
  }
  const { data } = await api.get(`/orders/${id}`);
  return data.data as Order;
}

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface UpdateAdminOrderStatusPayload {
  status?: OrderStatus;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    url?: string;
  };
  notes?: string;
  // No paymentStatus: payment state changes only through verified payments
  // and refunds; the server ignores any value sent.
}

export async function cancelOrder(id: string): Promise<Order> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid order ID');
  }
  const { data } = await api.patch(`/orders/${id}/cancel`);
  return data.data as Order;
}

export async function fetchAdminOrders(filters: AdminOrderFilters = {}): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<PaginatedResponse<Order>>('/admin/orders', {
    params: filters,
  });
  return data;
}

export async function fetchAdminOrderById(id: string): Promise<Order> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid order ID');
  }
  const { data } = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  return data.data as Order;
}

export async function updateAdminOrderStatus(
  id: string,
  payload: UpdateAdminOrderStatusPayload
): Promise<Order> {
  if (!id || id === 'undefined') {
    throw new Error('Invalid order ID');
  }
  const { data } = await api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, payload);
  return data.data as Order;
}

export async function cancelAdminOrder(id: string): Promise<Order> {
  return updateAdminOrderStatus(id, { status: 'cancelled' });
}

export async function addAddress(address: Omit<Address, '_id'>): Promise<Address[]> {
  const { data } = await api.post('/users/me/addresses', address);
  return data.data as Address[];
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address[]> {
  const { data } = await api.put(`/users/me/addresses/${id}`, address);
  return data.data as Address[];
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/users/me/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
  const { data } = await api.patch(`/users/me/addresses/${id}/default`);
  return data.data as Address[];
}

// The server builds the order from the user's cart and calculates every
// amount itself, so only the delivery address and payment method are sent.
export interface CreateOrderPayload {
  shippingAddress: Address;
  paymentMethod: 'razorpay' | 'cod';
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/orders', payload);
  return data.data as Order;
}

/** Authoritative checkout amounts for the current cart and delivery state. */
export async function fetchOrderQuote(destination: { state: string; pincode: string }): Promise<OrderQuote> {
  const { data } = await api.post('/orders/quote', { shippingAddress: destination });
  return data.data as OrderQuote;
}

/** `{ code, message }` from an API error response (backend sends `error` + optional `code`). */
export function getApiError(err: unknown, fallback: string): { code?: string; message: string } {
  const data = (err as { response?: { data?: { code?: string; error?: string; message?: string } } })?.response?.data;
  return { code: data?.code, message: data?.error || data?.message || fallback };
}

export async function fetchUserAddresses(): Promise<Address[]> {
  const { data } = await api.get('/users/me/addresses');
  return data.data as Address[];
}
