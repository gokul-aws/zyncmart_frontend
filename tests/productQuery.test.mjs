// GET /products must receive the backend's parameter names, otherwise
// sorting and the featured flag are silently ignored.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProductQuery } from '../lib/productQuery.ts';

test('sortBy is sent as `sort` and isFeatured as `featured`', () => {
  const q = buildProductQuery({ sortBy: 'price_asc', isFeatured: true });
  assert.equal(q.get('sort'), 'price_asc');
  assert.equal(q.get('featured'), 'true');
  assert.equal(q.has('sortBy'), false);
  assert.equal(q.has('isFeatured'), false);
});

test('other filters keep their names; arrays are comma-joined; empty values are skipped', () => {
  const q = buildProductQuery({ category: 'toys', minPrice: 100, maxPrice: 900, page: 2, limit: 12, tags: ['a', 'b'], search: 'ring', inStock: undefined });
  assert.deepEqual(Object.fromEntries(q), { category: 'toys', minPrice: '100', maxPrice: '900', page: '2', limit: '12', tags: 'a,b', search: 'ring' });
});
