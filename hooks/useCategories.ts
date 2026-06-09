'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data ?? [],
  });
}
