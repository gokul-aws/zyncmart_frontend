import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingBag,
  Users,
  MessageSquare,
  Tag,
  Settings,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_MENU_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: ListTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
];

export const ADMIN_ACTION_ITEMS: AdminNavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const ADMIN_BREADCRUMB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  customers: 'Customers',
  reviews: 'Reviews',
  coupons: 'Coupons',
  settings: 'Settings',
};
