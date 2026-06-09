import type { Metadata } from 'next';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zyncmart';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Page metadata builders
// ---------------------------------------------------------------------------

export function buildProductMetadata(product: Product): Metadata {
  const pageTitle = product.metaTitle
    ? product.metaTitle
    : `${product.name} | Buy Online at ${SITE_NAME}`;
  const description = product.metaDescription ?? product.shortDescription;
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: primaryImage ? [{ url: primaryImage.url, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
    robots: { index: true, follow: true },
  };
}

export function buildCategoryMetadata(category: Category): Metadata {
  const pageTitle = `Buy ${category.name} Online | ${SITE_NAME}`;
  const description =
    category.description ??
    `Shop ${category.name} products at ${SITE_NAME}. Best prices, fast delivery across India.`;
  const url = `${SITE_URL}/categories/${category.slug}`;
  const image = category.image?.url;

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: image ? [{ url: image, alt: category.name }] : [],
    },
    twitter: { card: 'summary_large_image', title: pageTitle, description },
    robots: { index: true, follow: true },
  };
}

/** For brand pages when a /brands/[slug] route is added. */
export function buildBrandMetadata(brandName: string, slug: string): Metadata {
  const pageTitle = `${brandName} Products Online | ${SITE_NAME}`;
  const description = `Explore all ${brandName} products at ${SITE_NAME}. Genuine products with best prices and fast delivery.`;
  const url = `${SITE_URL}/brands/${slug}`;

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: url },
    openGraph: { title: pageTitle, description, url, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title: pageTitle, description },
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD schema builders
// ---------------------------------------------------------------------------

export function buildOrganizationJsonLd() {
  const socialProfiles = [
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  ].filter((url): url is string => Boolean(url));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
    ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildProductJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.ratings.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratings.average,
            reviewCount: product.ratings.count,
          },
        }
      : {}),
  };
}

type BreadcrumbItem = { name: string; url: string };
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
