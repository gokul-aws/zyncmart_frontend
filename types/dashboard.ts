import type { OrderStatus } from './order';

export interface DashboardRevenue {
  today: number;
  todayOrders: number;
  monthly: number;
  monthlyOrders: number;
  last7Days: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface DashboardRevenuePoint {
  label: string;
  value: number;
}

export interface TopSellingProduct {
  _id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant: string;
    _id: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    _id: string;
  };
  payment: {
    method: string;
    status: string;
    razorpayOrderId?: string;
    paidAt?: string;
    razorpayPaymentId?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DashboardStats {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
  };
  revenue: DashboardRevenue;
  orderStatusCounts: Record<string, number>;
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrder[];
}
