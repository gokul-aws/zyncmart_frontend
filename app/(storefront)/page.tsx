import type { Metadata } from 'next';
import HeroBanner from '@/components/home/HeroBanner';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductCarousel from '@/components/home/ProductCarousel';
import { fetchCategories } from '@/lib/api/categories';
import { fetchNewArrivals, fetchBestSellers } from '@/lib/api/products';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

// ISR: revalidate every hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const DESCRIPTION =
  'Shop premium jewellery, toys and home accessories. Free shipping on orders above ₹999.';

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | Online Shopping` },
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL || '/' },
  openGraph: {
    title: `${SITE_NAME} | Online Shopping`,
    description: DESCRIPTION,
    url: SITE_URL,
    type: 'website',
    images: SITE_URL ? [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }] : [],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Online Shopping`,
    description: DESCRIPTION,
    images: SITE_URL ? [`${SITE_URL}/og-image.jpg`] : [],
  },
};

export default async function HomePage() {
  let categories: Category[] = [];
  let newArrivals: Product[] = [];
  let topRated: Product[] = [];

  try {
    const [categoriesRes, newArrivalsRes, topRatedRes] = await Promise.all([
      fetchCategories(),
      fetchNewArrivals(),
      // Sorted by rating (not sales), so it is labelled "Top rated".
      fetchBestSellers(),
    ]);
    categories = categoriesRes.data ?? [];
    newArrivals = newArrivalsRes.data ?? [];
    topRated = topRatedRes.data ?? [];
  } catch {
    // API unreachable during build — sections render empty until revalidation
  }

  return (
    <>
      <HeroBanner categories={categories} />
      <TrustStrip />
      <FeaturedCategories categories={categories} />
      <ProductCarousel title="New arrivals" products={newArrivals} viewAllHref="/products?sortBy=newest" tinted />
      <ProductCarousel title="Top rated" products={topRated} viewAllHref="/products?sortBy=rating" />
    </>
  );
}
