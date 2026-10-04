import type { ProductFilters } from '@/types/product';

export const PRICE_MIN = 0;
export const PRICE_MAX = 50000;
export const PRICE_STEP = 500;

/** URL search params → API filters (shared by the grid, filter drawer and chips). */
export function parseProductFilters(params: URLSearchParams, defaults: { category?: string; search?: string } = {}): ProductFilters {
  const f: ProductFilters = { limit: 12 };

  const category = params.get('category') || defaults.category;
  if (category) f.category = category;

  const minPrice = params.get('minPrice');
  if (minPrice) f.minPrice = Number(minPrice);

  const maxPrice = params.get('maxPrice');
  if (maxPrice) f.maxPrice = Number(maxPrice);

  if (params.get('inStock') === 'true') f.inStock = true;

  const tags = params.get('tags');
  if (tags) f.tags = tags.split(',');

  const sortBy = params.get('sortBy') as ProductFilters['sortBy'];
  if (sortBy) f.sortBy = sortBy;

  const search = params.get('q') || defaults.search;
  if (search) f.search = search;

  f.page = Number(params.get('page') ?? 1);
  return f;
}

/** Number of user-applied filters (category from the route doesn't count). */
export function activeFilterCount(params: URLSearchParams): number {
  return ['category', 'minPrice', 'maxPrice', 'inStock'].filter((k) => params.get(k)).length;
}
