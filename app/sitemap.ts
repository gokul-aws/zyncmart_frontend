import type { MetadataRoute } from 'next';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

async function fetchAllProductSlugs(): Promise<string[]> {
  const API = process.env.NEXT_PUBLIC_API_URL;
  if (!API) return [];
  try {
    let page = 1;
    const slugs: string[] = [];
    while (true) {
      const res = await fetch(`${API}/products?limit=100&page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const products: { slug: string }[] = json.data ?? [];
      slugs.push(...products.map((p) => p.slug));
      if (products.length < 100) break;
      page++;
    }
    return slugs;
  } catch {
    return [];
  }
}

async function fetchAllCategorySlugs(): Promise<string[]> {
  const API = process.env.NEXT_PUBLIC_API_URL;
  if (!API) return [];
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((c: { slug: string }) => c.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categorySlugs] = await Promise.all([
    fetchAllProductSlugs(),
    fetchAllCategorySlugs(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
