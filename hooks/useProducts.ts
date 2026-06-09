'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api/products';
import type { ProductFilters } from '@/types/product';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
