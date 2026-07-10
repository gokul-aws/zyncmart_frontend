import api from './axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Order, OrderStatus, PaymentStatus } from '@/types/order';
import type { Address } from '@/types/user';
import type { CartItem } from '@/types/cart';

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
  paymentStatus?: PaymentStatus;
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

export async function refundAdminOrder(id: string): Promise<Order> {
  return updateAdminOrderStatus(id, { paymentStatus: 'refunded' });
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

export interface CreateOrderPayload {
  items: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;
    variantId?: string;
  }[];
  shippingAddress: Address;
  paymentMethod: 'razorpay' | 'cod';
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/orders', payload);
  return data.data as Order;
}

export async function fetchUserAddresses(): Promise<Address[]> {
  const { data } = await api.get('/users/me/addresses');
  return data.data as Address[];
}

export function cartItemsToOrderItems(
  items: CartItem[]
): CreateOrderPayload['items'] {
  return items.map((i) => ({
    product: i.productId,
    name: i.name,
    image: i.image,
    price: i.price,
    quantity: i.quantity,
    variant: i.variant,
    variantId: i.variantId,
  }));
}
