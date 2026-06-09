'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api/products';

export function useProductSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const result = useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () => fetchProducts({ search: debouncedQuery, limit: 6 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    ...result,
    isReady: debouncedQuery.length >= 2,
    isPending: query.trim() !== debouncedQuery,
  };
}
