// Builds the query string for GET /products. Pure (type-only imports) so
// `node --test` can exercise it.
import type { ProductFilters } from '@/types/product';

// The backend's names for these filters (zyncmart_backend productController
// listProducts reads `sort` and `featured`). Sending the frontend names meant
// sorting and the featured flag were silently ignored.
const QUERY_NAME: Partial<Record<keyof ProductFilters, string>> = {
  sortBy: 'sort',
  isFeatured: 'featured',
};

export function buildProductQuery(filters: ProductFilters = {}): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(filters) as (keyof ProductFilters)[]).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null) {
      params.set(QUERY_NAME[key] ?? key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });
  return params;
}
