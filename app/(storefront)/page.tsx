import type { Metadata } from 'next';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import NewArrivals from '@/components/home/NewArrivals';
import BestSellers from '@/components/home/BestSellers';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import OfferBanner from '@/components/home/OfferBanner';
import Testimonials from '@/components/home/Testimonials';
import { fetchCategories } from '@/lib/api/categories';
import { fetchProducts, fetchNewArrivals, fetchBestSellers } from '@/lib/api/products';
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
  let featuredProducts: Product[] = [];
  let newArrivals: Product[] = [];
  let bestSellers: Product[] = [];

  // Fetch data in parallel but handle errors individually
  const [categoriesRes, featuredRes, newArrivalsRes, bestSellersRes] = await Promise.allSettled([
    fetchCategories(),
    fetchProducts({ isFeatured: true, limit: 10 }),
    fetchNewArrivals(),
    fetchBestSellers(),
  ]);

  if (categoriesRes.status === 'fulfilled') {
    categories = categoriesRes.value.data ?? [];
  } else {
    console.error('Failed to fetch categories:', categoriesRes.reason);
  }

  if (featuredRes.status === 'fulfilled') {
    featuredProducts = featuredRes.value.data ?? [];
  } else {
    console.error('Failed to fetch featured products:', featuredRes.reason);
  }

  if (newArrivalsRes.status === 'fulfilled') {
    newArrivals = newArrivalsRes.value.data ?? [];
  } else {
    console.error('Failed to fetch new arrivals:', newArrivalsRes.reason);
  }

  if (bestSellersRes.status === 'fulfilled') {
    bestSellers = bestSellersRes.value.data ?? [];
  } else {
    console.error('Failed to fetch best sellers:', bestSellersRes.reason);
  }

  return (
    <div>
      {/* 1. Hero banner */}
      <HeroBanner />

      {/* 2. Category carousel */}
      {categories.length > 0 && <FeaturedCategories categories={categories} />}

      {/* 3. New Arrivals */}
      {newArrivals.length > 0 && <NewArrivals products={newArrivals} />}

      {/* 4. Promotional strip */}
      <OfferBanner />

      {/* 5. Best Sellers */}
      {bestSellers.length > 0 && <BestSellers products={bestSellers} />}

      {/* 6. Featured products (2-row horizontal scroll) */}
      {/* <FeaturedProducts products={featuredProducts} /> */}

      {/* 7. Social proof */}
      <Testimonials />
    </div>
  );
}
