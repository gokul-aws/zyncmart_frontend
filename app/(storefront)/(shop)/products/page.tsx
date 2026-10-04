import type { Metadata } from 'next';
import { fetchCategories, fetchCategory } from '@/lib/api/categories';
import ProductListingLayout from '@/components/listing/ProductListingLayout';
import type { Category } from '@/types/category';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === 'string' ? params.category : undefined;

  let categoryName = 'All Products';
  if (categorySlug) {
    try {
      const res = await fetchCategory(categorySlug);
      if (res.data) categoryName = res.data.name;
    } catch {
      // use default
    }
  }

  const canonicalUrl = categorySlug
    ? `${SITE_URL}/products?category=${categorySlug}`
    : `${SITE_URL}/products`;
  const description = `Shop ${categoryName.toLowerCase()} at ${SITE_NAME}. Filter by price, brand, and more.`;
  const pageTitle = categorySlug ? `Buy ${categoryName} Online` : 'Shop Online';

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${pageTitle} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === 'string' ? params.category : undefined;

  let categories: Category[] = [];
  try {
    const res = await fetchCategories();
    categories = res.data ?? [];
  } catch {
    // sidebar renders without categories
  }

  const categoryName =
    categories.find((c) => c.slug === categorySlug)?.name ?? 'All Products';

  return (
    <ProductListingLayout
      title={categoryName}
      breadcrumbs={
        categorySlug
          ? [{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: categoryName }]
          : [{ label: 'Home', href: '/' }, { label: 'Products' }]
      }
      categories={categories}
    />
  );
}
