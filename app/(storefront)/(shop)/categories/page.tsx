import type { Metadata } from 'next';
import { LayoutGrid } from 'lucide-react';
import { fetchCategories } from '@/lib/api/categories';
import CategoryTile from '@/components/category/CategoryTile';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import type { Category } from '@/types/category';

export const revalidate = 3600;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export const metadata: Metadata = {
  title: 'Shop by Category',
  description: `Browse all product categories at ${SITE_NAME}. Shop jewellery, toys, home accessories and more.`,
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: `Shop by Category | ${SITE_NAME}`,
    description: `Browse all product categories at ${SITE_NAME}. Shop jewellery, toys, home accessories and more.`,
    url: `${SITE_URL}/categories`,
  },
  robots: { index: true, follow: true },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const res = await fetchCategories();
    categories = res.data ?? [];
  } catch {
    // API unreachable — renders empty state
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Shop by category</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Explore our full range of product categories.</p>
      </header>

      {categories.length === 0 ? (
        <EmptyState icon={<LayoutGrid />} title="No categories yet" description="Please check back soon." action={{ label: 'View all products', href: '/products' }} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category, i) => (
            <CategoryTile
              key={category._id}
              category={category}
              showDescription
              priority={i < 4}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
