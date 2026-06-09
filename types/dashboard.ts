import type { OrderStatus } from './order';

export interface DashboardRevenue {
  today: number;
  todayOrders: number;
  monthly: number;
  monthlyOrders: number;
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
    total: number;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueAnalytics: DashboardRevenuePoint[];
  topSellingProducts: TopSellingProduct[];
  recentOrders: RecentOrder[];
  orderStatusCounts: Record<OrderStatus, number>;
}
