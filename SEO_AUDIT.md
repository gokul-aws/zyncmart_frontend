# SEO Audit — Zyncmart Ecommerce Platform

**Audited:** 2026-06-08  
**Auditor:** Senior Next.js SEO Architect  
**Framework:** Next.js 16.2.7 — App Router  
**Scope:** Full codebase audit (metadata, structured data, sitemap, robots, CWV, images, internal linking)

---

## Executive Summary

Zyncmart has a solid SEO foundation — App Router, ISR, dynamic metadata on product pages, and a working sitemap/robots setup. However, there are **3 blocking issues** (broken footer links, missing OG image file, incomplete sitemap), **4 high-priority gaps** (relative canonical on product pages, missing Twitter cards, missing OG images on collection pages, no Organization/BreadcrumbList schemas), and a cluster of medium-priority improvements. The product detail page is the strongest SEO page in the codebase; the categories and CMS pages are the weakest.

---

## 1. Routing & Framework

| Property | Value |
|---|---|
| Router | **App Router** |
| Next.js Version | 16.2.7 |
| React Version | 19.2.4 |
| ISR Strategy | `export const revalidate = 3600` (per page) |
| Font Loading | `next/font/google` with `display: 'swap'` |
| Image Provider | Cloudinary CDN (`res.cloudinary.com`) |

**Assessment:** App Router is correctly used throughout. ISR is configured on content pages. No Pages Router leakage detected.

---

## 2. Root Layout Metadata

**File:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Premium jewellery, toys and home accessories for Indian families.',
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  openGraph: { siteName: SITE_NAME, type: 'website' },
  robots: { index: true, follow: true },
};
```

| Check | Status | Note |
|---|---|---|
| Title template | ✅ | `%s \| Zyncmart` pattern |
| Default description | ✅ | Set at root |
| metadataBase | ⚠️ | Conditional on `NEXT_PUBLIC_SITE_URL` — undefined in local/preview deploys breaks relative canonicals |
| Default OG siteName | ✅ | Set |
| Default robots | ✅ | index + follow |
| Favicon | ⚠️ | `favicon.png` exists in `/public` but not declared in metadata |

---

## 3. Page-by-Page Metadata Audit

### 3.1 Public / Indexable Pages

| Page | Route | Title | Description | Canonical | OG Tags | OG Image | Twitter Card | JSON-LD | revalidate |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | ✅ | ✅ | ✅ | ✅ | ❌ (file missing) | ✅ | ❌ | 3600 |
| All Products | `/products` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | dynamic |
| Categories | `/categories` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 3600 |
| Category Detail | `/categories/[slug]` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | dynamic |
| Product Detail | `/products/[slug]` | ✅ | ✅ | ⚠️ relative | ✅ | ✅ | ✅ | ✅ | dynamic |
| About | `/about` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| Contact | `/contact` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| Privacy Policy | `/policies/privacy` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| Terms | `/policies/terms` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| Returns | `/policies/returns` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| Shipping | `/policies/shipping` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | — |

### 3.2 Non-Indexable Pages (correctly noindex'd)

| Page | Route | noindex | Note |
|---|---|---|---|
| Search | `/search` | ✅ | Query param pages should not be indexed |
| Cart | `/cart` | ✅ | Correct |
| Checkout | `/checkout` | ✅ | Correct |
| Order Success | `/checkout/success` | ✅ | Correct |
| Login | `/login` | ✅ | Correct |
| Register | `/register` | ✅ | Correct |
| Forgot Password | `/forgot-password` | ✅ | Correct |
| Account (all) | `/account/*` | ✅ | Correct via layout |
| 404 | — | ✅ | Correct |

---

## 4. Structured Data / JSON-LD

### 4.1 What Exists

**Product Detail Page** — `app/(storefront)/(shop)/products/[slug]/page.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "image": ["url1", "url2"],
  "description": "...",
  "sku": "...",
  "brand": { "@type": "Brand", "name": "..." },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": 999,
    "availability": "https://schema.org/InStock",
    "url": "https://zyncmart.com/products/slug"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 10
  }
}
```

✅ Product schema is well-formed.  
✅ Includes brand, offer, aggregateRating (conditional).  
✅ Availability correctly maps stock to schema.org values.

### 4.2 What Is Missing

| Schema Type | Where Needed | Why It Matters |
|---|---|---|
| `Organization` | Home page (`/`) | Enables Google Knowledge Panel, sitelinks |
| `WebSite` with `SearchAction` | Home page (`/`) | Enables Google Sitelinks Search Box |
| `BreadcrumbList` | Products, Category, Product Detail | Rich breadcrumb results in SERP |
| `LocalBusiness` | Contact page | Rich results for store address/phone |
| `ItemList` | `/products`, `/categories` | Collection page rich results |
| `FAQPage` | — | If FAQ section added later |
| `Review` (individual) | Product detail | Individual review snippets |

Breadcrumb HTML exists on product and category pages but is **not accompanied by `BreadcrumbList` JSON-LD**, meaning Google cannot reliably parse it as structured breadcrumbs.

---

## 5. Sitemap

**File:** `app/sitemap.ts`

### 5.1 What Is Included

| Route | Included | Priority | Change Freq |
|---|---|---|---|
| `/` (home) | ✅ | 1.0 | daily |
| `/products` | ✅ | 0.9 | daily |
| `/products/[slug]` (all) | ✅ | 0.8 | weekly |
| `/products?category=[slug]` | ✅ | 0.7 | weekly |

### 5.2 What Is Missing

| Route | Missing | Impact |
|---|---|---|
| `/categories` | ❌ | Categories listing not discoverable via sitemap |
| `/categories/[slug]` (all) | ❌ | **High impact** — canonical category URLs not in sitemap |
| `/about` | ❌ | Brand page not discoverable |
| `/contact` | ❌ | Contact page not discoverable |
| `/policies/privacy` | ❌ | Policy pages not discoverable |
| `/policies/terms` | ❌ | Policy pages not discoverable |
| `/policies/returns` | ❌ | Policy pages not discoverable |
| `/policies/shipping` | ❌ | Policy pages not discoverable |

### 5.3 Canonical Mismatch in Sitemap

The sitemap includes category pages as `/products?category=${slug}` (query string URL). The actual canonical category pages are `/categories/${slug}`. This creates a **crawl budget conflict** — Google sees two URLs for the same content concept and neither is authoritative in the sitemap.

---

## 6. Robots.txt

**File:** `app/robots.ts`

```typescript
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/account/', '/checkout/', '/api/'],
  },
],
sitemap: `${BASE_URL}/sitemap.xml`,
```

| Check | Status | Note |
|---|---|---|
| Disallows `/account/` | ✅ | Correct |
| Disallows `/checkout/` | ✅ | Correct |
| Disallows `/api/` | ✅ | Correct |
| Sitemap URL present | ✅ | Correct |
| Missing: `/admin/` | ⚠️ | Admin routes not explicitly blocked (relies on auth middleware) |
| Missing: `/cart` | ⚠️ | Not disallowed in robots.txt (has noindex, but robots.txt block is belt-and-suspenders) |

**Assessment:** Acceptable. Adding `/admin/` and `/cart` to disallow is a minor improvement.

---

## 7. Open Graph & Twitter Cards

### 7.1 OG Image Status

| Page | og:image | Dimensions | Source |
|---|---|---|---|
| Home | ❌ **FILE MISSING** | 1200×630 specified | References `/og-image.jpg` — not in `/public` |
| Products | ❌ | — | Not set |
| Categories | ❌ | — | Not set |
| Category Detail | ❌ | — | Not set |
| Product Detail | ✅ | 800×1000 | Cloudinary product image |
| About | ❌ | — | Not set |
| Contact | ❌ | — | Not set |
| Policy Pages | ❌ | — | Not set |

**Recommended:** Implement Next.js `opengraph-image.tsx` at `app/opengraph-image.tsx` for a dynamic default fallback, and at `app/(storefront)/(shop)/categories/[slug]/opengraph-image.tsx` for category-level OG images.

### 7.2 Twitter Card Coverage

Twitter card (`twitter: { card: 'summary_large_image', ... }`) is only present on:
- ✅ Home page
- ✅ Product detail page

Missing on: Products listing, Categories, Category Detail, About, Contact, Policy pages.

---

## 8. Canonical URL Audit

| Page | Canonical Value | Type | Issue |
|---|---|---|---|
| Home | `${SITE_URL}` or `'/'` | Absolute (conditional) | Falls back to `'/'` if env not set |
| Products | `${SITE_URL}/products` | Absolute | ✅ |
| Categories | `${SITE_URL}/categories` | Absolute | ✅ |
| Category Detail | `${SITE_URL}/categories/${slug}` | Absolute | ✅ |
| Product Detail | `/products/${slug}` | **Relative** | ❌ Should be absolute |
| About | `${SITE_URL}/about` | Absolute | ✅ |
| Contact | `${SITE_URL}/contact` | Absolute | ✅ |
| Policies | `${SITE_URL}/policies/${slug}` | Absolute | ✅ |

**Critical:** Product detail canonical is relative (`/products/${slug}`). While `metadataBase` in `app/layout.tsx` resolves this at build time, it's fragile — if `NEXT_PUBLIC_SITE_URL` is not set, `metadataBase` is `undefined` and Next.js cannot construct the absolute URL. Fix by making the canonical explicit: `` `${SITE_URL}/products/${slug}` ``.

---

## 9. Image Optimization

### 9.1 Next.js Image Component Usage

| Component | Uses next/image | `priority` Prop | `sizes` Prop | Issue |
|---|---|---|---|---|
| ProductCard | ✅ | Via prop | ✅ | ✅ Good |
| ProductGrid (first 4) | ✅ | `i < 4` ✅ | ✅ | ✅ Good |
| ProductImageGallery | ✅ | ✅ on main | ✅ | ✅ Good |
| CategoryCarousel | ✅ | ❌ | ✅ | ⚠️ LCP if above fold |
| ProductCarousel | ✅ | `i < 4` ✅ | ✅ | ✅ Good |
| HeroBanner | Gradient only | N/A | N/A | ✅ Fast render |

No raw `<img>` tags found in components — all image rendering goes through `next/image`. ✅

### 9.2 Remote Patterns

```typescript
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
}
```

✅ Correctly scoped to Cloudinary only. No wildcard domains.

### 9.3 Issues

- **CategoryCarousel** above the fold on home page does not set `priority` on the first visible category images. On category-heavy pages this could delay LCP.
- **Product images** use `fill` with `aspect-square` or `aspect-[4/5]` wrappers — correct approach for unknown image dimensions from CMS.
- No WebP/AVIF format override in `next.config.ts` — Next.js auto-serves modern formats, so this is fine by default.

---

## 10. Core Web Vitals Assessment

### 10.1 LCP (Largest Contentful Paint)

| Risk Factor | Status | Detail |
|---|---|---|
| Hero banner | ✅ Low risk | CSS gradient, no image fetch required |
| Font loading | ✅ Low risk | `display: 'swap'` prevents invisible text |
| Above-fold product images | ✅ | `priority={i < 4}` preloads first 4 |
| CategoryCarousel | ⚠️ | No `priority` on first 2 images — potential LCP delay |
| Framer Motion on Hero | ⚠️ | Animation entry delays may affect LCP paint timing |

### 10.2 CLS (Cumulative Layout Shift)

| Risk Factor | Status | Detail |
|---|---|---|
| Font swap | ✅ Low risk | `display: 'swap'` causes brief FOUT, not layout shift |
| Images without dimensions | ✅ | All images use `fill` inside sized containers |
| Hero height | ✅ | Fixed `h-[480px]` / `md:h-[640px]` prevents shift |
| Dynamic content loading | ⚠️ | Product grid renders via client fetch — grid skeleton helps but check for jump |

### 10.3 INP (Interaction to Next Paint)

| Risk Factor | Status | Detail |
|---|---|---|
| `'use client'` overuse | ⚠️ | 57 client components — many are appropriately interactive, but some wrappers may be unnecessarily client-side |
| React Query hydration | ✅ | TanStack Query with server-prefetch pattern avoids client waterfall |
| Framer Motion bundle | ⚠️ | `framer-motion@12` is a large dependency (~50kb gzipped) — verify it's only loaded when needed |

---

## 11. Internal Linking

### 11.1 Navigation Links

**Header:**
- Home `/`, All Products `/products`, About `/about`, Contact `/contact` ✅

**Mobile Bottom Nav:**
- Home, Categories → `/products`, Search, Cart, Account ✅  
- Note: "Categories" in mobile nav points to `/products`, not `/categories`. This is a UX inconsistency (minor SEO impact).

**Footer — Category Links:**
- `/categories/jewellery` ✅
- `/categories/toys` ✅
- `/categories/home-accessories` ✅

### 11.2 Broken Footer Links (Critical)

| Footer Label | Footer `href` | Actual Route | Status |
|---|---|---|---|
| Privacy Policy | `/policies/privacy-policy` | `/policies/privacy` | ❌ 404 |
| Terms of Service | `/policies/terms-of-service` | `/policies/terms` | ❌ 404 |
| Shipping Policy | `/policies/shipping-policy` | `/policies/shipping` | ❌ 404 |

These broken links are crawled by search engines on every page (footer is sitewide). Each one returns a 404, which signals poor site health.

### 11.3 Breadcrumbs

Breadcrumb HTML navigation (`<nav aria-label="Breadcrumb">`) is correctly implemented on:
- ✅ `/products` — Home > Products
- ✅ `/categories/[slug]` — Home > Products > Category Name
- ✅ `/products/[slug]` — Home > Products > Product Name
- ❌ `/categories` — No breadcrumb
- ❌ `/about`, `/contact`, `/policies/*` — No breadcrumbs

Breadcrumbs exist in HTML but **no `BreadcrumbList` JSON-LD** is emitted. Google may parse the HTML breadcrumbs, but JSON-LD is the authoritative signal for rich breadcrumb results in SERPs.

---

## 12. Next.js Configuration

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

| Config | Present | Recommendation |
|---|---|---|
| `compress: true` | ❌ | Add — enables gzip/brotli |
| `poweredByHeader: false` | ❌ | Add — removes `X-Powered-By: Next.js` header |
| Security headers | ✅ | Present |
| Image remotePatterns | ✅ | Correct |
| `generateEtags` | Not set | Default is true ✅ |

---

## 13. Blocked Issues — Priority Matrix

### 🔴 P0 — Blocking (Fix Before Indexing)

| # | Issue | File | Impact |
|---|---|---|---|
| 1 | **Footer policy links return 404** | `components/layout/Footer.tsx` | Sitewide broken links, crawl errors |
| 2 | **`/public/og-image.jpg` does not exist** | `app/(storefront)/page.tsx` | Home page social share broken — no preview image |
| 3 | **Sitemap missing `/categories/[slug]` URLs** | `app/sitemap.ts` | Canonical category pages not submitted to Google |

### 🟠 P1 — High Priority

| # | Issue | File | Impact |
|---|---|---|---|
| 4 | **Product detail canonical is relative** | `app/(storefront)/(shop)/products/[slug]/page.tsx` | Fragile — breaks if `metadataBase` unset |
| 5 | **No `Organization` + `WebSite` JSON-LD on home page** | `app/(storefront)/page.tsx` | Missing Knowledge Panel, Sitelinks Search Box signal |
| 6 | **No `BreadcrumbList` JSON-LD on any page** | Product, Category, Product Detail pages | No rich breadcrumbs in SERP |
| 7 | **Missing Twitter cards on collection pages** | Products, Categories, Category Detail, About, Contact | Degraded social share on X/Twitter |
| 8 | **Missing `og:image` on collection pages** | Products, Categories, About, Contact | No preview thumbnail on social shares |
| 9 | **`/categories` not in sitemap** | `app/sitemap.ts` | Listing page excluded from sitemap |

### 🟡 P2 — Medium Priority

| # | Issue | File | Impact |
|---|---|---|---|
| 10 | **Policy pages missing meta descriptions** | `app/(storefront)/(cms)/policies/[slug]/page.tsx` | Missing SERP snippet description |
| 11 | **About & Contact missing OG tags** | `app/(storefront)/(cms)/about/page.tsx`, `contact/page.tsx` | Poor social sharing |
| 12 | **`/about` and `/contact` not in sitemap** | `app/sitemap.ts` | Brand pages excluded from sitemap |
| 13 | **Policy pages not in sitemap** | `app/sitemap.ts` | Policy pages excluded |
| 14 | **`compress: true` missing from next.config** | `next.config.ts` | No server-level compression |
| 15 | **`poweredByHeader: false` missing** | `next.config.ts` | Leaks framework info |
| 16 | **`/admin/` not in robots.txt disallow** | `app/robots.ts` | Admin routes not blocked at crawler level |
| 17 | **CategoryCarousel missing `priority` on first images** | `components/home/CategoryCarousel.tsx` | Potential LCP regression |
| 18 | **Favicon not declared in root metadata** | `app/layout.tsx` | Browser/Google may not pick up favicon |
| 19 | **Mobile nav "Categories" links to `/products`** | `components/layout/MobileNav.tsx` | UX inconsistency, missed internal link to `/categories` |
| 20 | **`LocalBusiness` schema missing on contact page** | `app/(storefront)/(cms)/contact/page.tsx` | No rich result for store address/phone |
| 21 | **Sitemap category URLs are `/products?category=slug`** | `app/sitemap.ts` | Mismatch with canonical category URL structure |

### 🟢 P3 — Low Priority / Nice to Have

| # | Issue | Impact |
|---|---|---|
| 22 | Dynamic OG image generation via `opengraph-image.tsx` | Richer social previews without static files |
| 23 | `ItemList` schema on `/products` and `/categories` | Rich collection results |
| 24 | `hreflang` tags if multilingual support is planned | i18n SEO readiness |
| 25 | `metadataBase` hardened — always resolve to absolute URL | Belt-and-suspenders for canonical robustness |

---

## 14. What Is Working Well

| ✅ Strength | Detail |
|---|---|
| App Router correctly configured | No Pages Router leakage |
| Product detail page is SEO-complete | Title, description, canonical, OG, Twitter, JSON-LD Product schema all present |
| Dynamic metadata on all content pages | `generateMetadata` used on product, category, search, policy pages |
| Correct noindex on non-content pages | Cart, checkout, search, auth, account all correctly excluded |
| ISR configured | `revalidate = 3600` on all content-heavy pages |
| Font loading optimized | `next/font/google` with `display: 'swap'` — no FOIT/CLS from fonts |
| All images via `next/image` | No raw `<img>` tags — WebP/AVIF served automatically |
| Priority images on carousels | First 3-4 product images preloaded — good LCP hygiene |
| Cloudinary CDN | Images served from globally distributed CDN |
| robots.txt correct | Auth, account, checkout, API correctly blocked |
| sitemap.xml present | Products and static routes submitted |
| Security headers set | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| metadataBase set | Resolves relative URLs in metadata |
| Product JSON-LD complete | Brand, aggregateRating, InStock/OutOfStock, price in INR |

---

## 15. Implementation Roadmap

### Phase 2 — Fix P0 Issues
1. Fix footer policy link slugs (`privacy-policy` → `privacy`, etc.)
2. Create `/public/og-image.jpg` (1200×630px)
3. Add `/categories/[slug]` URLs to sitemap

### Phase 3 — Fix P1 Issues
4. Make product detail canonical absolute
5. Add `Organization` + `WebSite` JSON-LD to home page
6. Add `BreadcrumbList` JSON-LD to product, category, and product detail pages
7. Add Twitter cards to all public indexable pages
8. Add `og:image` to collection pages (static or dynamic)
9. Add `/categories` to sitemap

### Phase 4 — Fix P2 Issues
10. Add meta descriptions to policy pages
11. Add OG tags to About and Contact pages
12. Add `/about`, `/contact`, `/policies/*` to sitemap
13. Add `compress: true`, `poweredByHeader: false` to `next.config.ts`
14. Add `/admin/` to robots.txt disallow
15. Add `priority` to first 2 CategoryCarousel images
16. Declare favicon in root metadata
17. Point mobile nav "Categories" to `/categories`
18. Add `LocalBusiness` JSON-LD to contact page

---

## Appendix A — File Reference Map

| File | SEO Role |
|---|---|
| `app/layout.tsx` | Root metadata, fonts, analytics |
| `app/robots.ts` | Crawler directives |
| `app/sitemap.ts` | XML sitemap generation |
| `app/(storefront)/page.tsx` | Home metadata |
| `app/(storefront)/(shop)/products/page.tsx` | Products listing metadata |
| `app/(storefront)/(shop)/products/[slug]/page.tsx` | Product detail metadata + JSON-LD |
| `app/(storefront)/(shop)/categories/page.tsx` | Categories listing metadata |
| `app/(storefront)/(shop)/categories/[slug]/page.tsx` | Category detail metadata |
| `app/(storefront)/(shop)/search/page.tsx` | Search (noindex) |
| `app/(storefront)/(cms)/about/page.tsx` | About page metadata |
| `app/(storefront)/(cms)/contact/page.tsx` | Contact page metadata |
| `app/(storefront)/(cms)/policies/[slug]/page.tsx` | Policy page metadata |
| `components/layout/Footer.tsx` | Internal links (broken policy hrefs) |
| `components/layout/MobileNav.tsx` | Mobile navigation links |
| `components/home/CategoryCarousel.tsx` | LCP-relevant images (missing priority) |
| `next.config.ts` | Image domains, compression, headers |
| `lib/api/categories.ts` | Category data fetching |
| `lib/api/products.ts` | Product data fetching |
| `lib/seo.ts` | SEO helper utilities |
