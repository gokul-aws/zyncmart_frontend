# E-Commerce Frontend — Production-Ready Spec
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/UI · Zustand · React Query · Cloudinary · Razorpay

---

## Project Overview

Build a fully responsive, SEO-optimised e-commerce storefront for a multi-category store selling **jewellery, toys, and home accessories** targeting Indian customers. The frontend consumes the REST API defined in `ecommerce-backend-spec.md`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + CSS variables |
| Component lib | Shadcn/UI |
| State (global) | Zustand |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Images | next/image + Cloudinary |
| Payments | Razorpay JS SDK |
| Icons | Lucide React |
| Animations | Framer Motion |
| SEO | Next.js Metadata API + JSON-LD |
| HTTP client | Axios (with interceptors) |
| Notifications | Sonner (toasts) |
| Analytics | Google Analytics 4 (via gtag) |
| Hosting | Vercel |

---

## Folder Structure

```
ecommerce-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (header, footer, providers)
│   ├── page.tsx                  # Homepage
│   ├── (shop)/
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Product detail page
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Category listing page
│   │   └── search/
│   │       └── page.tsx          # Search results
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (account)/
│   │   ├── layout.tsx            # Account sidebar layout
│   │   ├── account/page.tsx      # Profile overview
│   │   ├── account/orders/page.tsx
│   │   ├── account/orders/[id]/page.tsx
│   │   ├── account/addresses/page.tsx
│   │   └── account/wishlist/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── checkout/success/page.tsx
│   └── (cms)/
│       ├── about/page.tsx
│       ├── contact/page.tsx
│       └── policies/[slug]/page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   ├── CategoryBar.tsx       # Horizontal scrollable category strip
│   │   └── SearchBar.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── FeaturedCategories.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── OfferBanner.tsx
│   │   └── Testimonials.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── ProductVariants.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── RelatedProducts.tsx
│   │   └── ProductSkeleton.tsx
│   ├── filters/
│   │   ├── FilterSidebar.tsx
│   │   ├── FilterDrawer.tsx      # Mobile filter drawer
│   │   ├── PriceRangeSlider.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── SortDropdown.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx        # Slide-in cart panel
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── AddressStep.tsx
│   │   ├── PaymentStep.tsx
│   │   ├── OrderSummary.tsx
│   │   └── RazorpayButton.tsx
│   ├── account/
│   │   ├── AccountSidebar.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── AddressCard.tsx
│   └── ui/                       # Shadcn/UI + custom primitives
│       ├── Badge.tsx
│       ├── StarRating.tsx
│       ├── PriceDisplay.tsx
│       ├── QuantitySelector.tsx
│       ├── WishlistButton.tsx
│       └── EmptyState.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useProducts.ts
│   ├── useCategories.ts
│   └── useRazorpay.ts
├── lib/
│   ├── api/
│   │   ├── axios.ts              # Axios instance with interceptors
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── payments.ts
│   ├── store/
│   │   ├── authStore.ts          # Zustand: user + tokens
│   │   ├── cartStore.ts          # Zustand: cart state
│   │   └── wishlistStore.ts      # Zustand: wishlist (localStorage)
│   ├── utils.ts
│   ├── formatters.ts             # price, date, order status formatters
│   └── seo.ts                    # metadata + JSON-LD generators
├── types/
│   ├── product.ts
│   ├── category.ts
│   ├── order.ts
│   ├── user.ts
│   └── api.ts                    # API response types
├── public/
│   ├── og-image.jpg
│   └── icons/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

---

## Environment Variables (.env.local.example)

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/production
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=YourStoreName
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

---

## TypeScript Types

### Product
```ts
// types/product.ts
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: { _id: string; name: string; slug: string };
  brand?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; publicId: string; isPrimary: boolean }[];
  variants: { name: string; options: string[] }[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ratings: { average: number; count: number };
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}
```

### Order
```ts
// types/order.ts
export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod';

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  pricing: { subtotal: number; discount: number; shipping: number; tax: number; total: number };
  payment: { method: PaymentMethod; status: PaymentStatus; razorpayOrderId?: string; paidAt?: string };
  status: OrderStatus;
  tracking?: { carrier: string; trackingNumber: string; url: string };
  createdAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}
```

### Cart
```ts
// types/cart.ts — mirrors Zustand store shape
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  stock: number;
  quantity: number;
  variant?: string;
  slug: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}
```

---

## Pages & Components

---

### 1. Root Layout (`app/layout.tsx`)

- Import `Providers` wrapper (QueryClientProvider, AuthProvider, Toaster)
- Header with: logo, CategoryBar, SearchBar, cart icon (item count badge), user menu
- Mobile bottom navigation bar (Home, Categories, Search, Cart, Account)
- Footer: links, social icons, WhatsApp button (fixed bottom-right on mobile)
- Google Analytics script via `next/script`
- Global font: use `next/font/google`

---

### 2. Homepage (`app/page.tsx`)

**Sections in order:**
1. `HeroBanner` — full-width image slider (3 slides) with CTA buttons. Use `framer-motion` for slide transitions.
2. `FeaturedCategories` — horizontal scroll grid of category cards (image + name). Jewellery / Toys / Home Accessories + subcategories.
3. `OfferBanner` — full-width promotional strip ("Free shipping above ₹999")
4. `FeaturedProducts` — 2-row horizontal scroll of `ProductCard` components filtered by `isFeatured: true`
5. `Testimonials` — 3 customer review cards

**Data fetching:** Use `fetch` with `{ next: { revalidate: 3600 } }` for SSG/ISR.

```ts
// app/page.tsx
export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    fetchCategories(),
    fetchProducts({ isFeatured: true, limit: 10 }),
  ]);
  return ( /* render sections */ );
}
```

---

### 3. Product Listing (`app/(shop)/products/page.tsx`)

**URL:** `/products?category=jewellery&minPrice=100&maxPrice=5000&sortBy=newest&page=1`

**Layout:**
- Desktop: 2-column layout — `FilterSidebar` (left, sticky) + `ProductGrid` (right)
- Mobile: `FilterDrawer` triggered by floating "Filter" button + full-width grid

**FilterSidebar contains:**
- Category tree (checkbox list, expandable)
- Price range slider (min/max, ₹ display)
- In-stock toggle
- Tags/brand checkboxes
- "Clear all filters" button

**ProductGrid:**
- Responsive: 2 cols mobile → 3 cols tablet → 4 cols desktop
- Skeleton loading cards (same dimensions as ProductCard)
- Empty state with illustration when no products
- Pagination (numbered) or infinite scroll

**SEO:** Dynamic `generateMetadata` based on category/filters.

---

### 4. Product Detail (`app/(shop)/products/[slug]/page.tsx`)

**Sections:**
1. Breadcrumb: Home → Category → Product Name
2. `ProductImageGallery` — main image + thumbnail strip. Tap to zoom on mobile.
3. `ProductInfo`:
   - Product name (H1)
   - `StarRating` + review count (links to reviews section)
   - Price display: current price + strikethrough comparePrice + discount % badge
   - Stock badge: "In Stock" / "Only 3 left" / "Out of Stock"
   - Short description
   - `ProductVariants` — colour/size selectors (button group)
   - `QuantitySelector` — +/- with max = stock
   - "Add to Cart" button + `WishlistButton`
   - "Buy Now" button (add to cart + redirect to checkout)
   - Delivery info strip (free shipping threshold, estimated delivery)
   - Share buttons (WhatsApp, copy link)
4. Tabs: Description | Specifications | Reviews
5. `RelatedProducts` — same category, horizontal scroll

**SEO:**
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  return {
    title: product.metaTitle || `${product.name} | ${SITE_NAME}`,
    description: product.metaDescription || product.shortDescription,
    openGraph: {
      images: [product.images.find(i => i.isPrimary)?.url],
    },
  };
}
```

**JSON-LD schema:**
```ts
// Add Product schema for Google rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images.map(i => i.url),
  description: product.description,
  sku: product.sku,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'INR',
    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
  aggregateRating: product.ratings.count > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: product.ratings.average,
    reviewCount: product.ratings.count,
  } : undefined,
};
```

---

### 5. Cart (`app/cart/page.tsx` + `CartDrawer.tsx`)

Two entry points:
- **CartDrawer**: slides in from right when user adds item or clicks cart icon. Shows items, subtotal, "View Cart" + "Checkout" buttons.
- **Cart page** (`/cart`): Full page with editable quantities, remove buttons, order summary, coupon field (UI only for now), proceed to checkout.

**Cart state in Zustand (`lib/store/cartStore.ts`):**
```ts
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  getSummary: () => CartSummary;
}
// Persist cart to localStorage with zustand/middleware persist
```

**Cart sync:** On login, call `POST /cart/merge` to merge localStorage cart with server cart.

---

### 6. Checkout (`app/checkout/page.tsx`)

**Steps (single page, step indicator at top):**

**Step 1 — Delivery Address:**
- List saved addresses (radio select)
- "Add new address" form inline (React Hook Form + Zod)
- Fields: Name, Phone, Line 1, Line 2, City, State, Pincode
- "Continue to Payment" button

**Step 2 — Payment:**
- Order summary (readonly): items, pricing breakdown
- Payment options:
  - **Pay Online** (Razorpay) — cards, UPI, netbanking, wallets, EMI
  - **Cash on Delivery** — available for orders under ₹10,000
- "Place Order" button

**Razorpay integration flow:**
```ts
// hooks/useRazorpay.ts
export function useRazorpay() {
  const initiatePayment = async (orderId: string) => {
    // 1. Call POST /payments/create-order → get razorpayOrderId
    const { razorpayOrderId, amount, currency } = await createPaymentOrder(orderId);

    // 2. Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency,
      order_id: razorpayOrderId,
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      description: `Order #${orderNumber}`,
      image: '/logo.png',
      handler: async (response) => {
        // 3. Verify payment
        await verifyPayment({
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        router.push('/checkout/success?orderId=' + orderId);
      },
      prefill: { name: user.name, email: user.email, contact: user.phone },
      theme: { color: '#your-brand-color' },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };
  return { initiatePayment };
}
```

Load Razorpay script in `app/layout.tsx`:
```tsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
```

**Step 3 — Success (`/checkout/success`):**
- Animated checkmark
- Order number + summary
- "Track Order" and "Continue Shopping" buttons
- Trigger GA4 `purchase` event

---

### 7. Auth Pages

**Login (`/login`):**
- Email + password form (React Hook Form + Zod)
- "Remember me" checkbox
- Forgot password link
- Google OAuth button (UI placeholder)
- Redirect to `/account` on success or back to previous page

**Register (`/register`):**
- Name, email, phone, password, confirm password
- Terms checkbox
- Redirect to `/account` on success

**Auth state (Zustand + localStorage):**
```ts
// lib/store/authStore.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}
```

**Axios interceptor for token refresh:**
```ts
// lib/api/axios.ts
axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshAccessToken(); // calls POST /auth/refresh
      authStore.getState().setAuth(authStore.getState().user!, newToken);
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

### 8. Account Pages

**Layout (`app/(account)/layout.tsx`):**
- Desktop: `AccountSidebar` (left) + content (right)
- Mobile: tab bar at top

**AccountSidebar links:** My Orders · Addresses · Wishlist · Profile · Logout

**My Orders (`/account/orders`):**
- Paginated list of `OrderCard` components
- Each shows: order number, date, total, status badge (colour-coded), item thumbnails
- Filters: All / Active / Delivered / Cancelled

**Order Detail (`/account/orders/[id]`):**
- `OrderTimeline` component — vertical step indicator showing order progress
- Items list with images
- Pricing breakdown
- Shipping address
- Payment info
- Cancel button (visible if status = placed/confirmed)
- Track shipment link (if tracking available)

**Addresses (`/account/addresses`):**
- Grid of `AddressCard` components
- Add / Edit / Delete / Set as default actions

---

### 9. ProductCard Component

```tsx
// components/product/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

// Must include:
// - next/image with proper sizes and priority for above-fold
// - Discount badge (if comparePrice > price)
// - "Only N left" badge (if stock <= lowStockThreshold)
// - Quick-add to cart on hover (desktop)
// - WishlistButton (heart icon, top-right)
// - StarRating (compact)
// - Price display in ₹ with formatted Indian numbering
// - Link wraps entire card (next/link)
// - Framer Motion: subtle scale on hover
```

---

### 10. SEO Requirements

**Every page must have:**
- Unique `<title>` and `<meta name="description">`
- Open Graph tags (og:title, og:description, og:image, og:url)
- Canonical URL
- robots meta (index, follow or noindex where appropriate)

**Product listing pages:** Use `generateMetadata` with category name.

**Sitemap:** Create `app/sitemap.ts`:
```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllProductSlugs();
  const categories = await fetchAllCategorySlugs();
  return [
    { url: BASE_URL, lastModified: new Date() },
    ...products.map(slug => ({ url: `${BASE_URL}/products/${slug}`, lastModified: new Date() })),
    ...categories.map(slug => ({ url: `${BASE_URL}/categories/${slug}`, lastModified: new Date() })),
  ];
}
```

**Robots:** Create `app/robots.ts`:
```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account/', '/checkout/', '/admin/'] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

---

### 11. Performance Requirements

- All product images via `next/image` with `sizes` prop set correctly
- Above-fold images use `priority` prop
- Cloudinary URL transformation: append `?w=800&q=auto&f=auto` for product listings
- `loading="lazy"` for below-fold images
- Route-based code splitting (automatic with App Router)
- React Query cache: `staleTime: 5 * 60 * 1000` for product/category data
- Skeleton loaders for all async content (never show empty flash)
- `<Suspense>` boundaries around all async server components

---

### 12. Indian Market Specific Requirements

**Currency formatting:**
```ts
// lib/formatters.ts
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
// Output: ₹1,29,999
```

**WhatsApp support button:** Fixed bottom-right on all pages (mobile + desktop):
```tsx
<a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with my order`}
   target="_blank" rel="noopener noreferrer"
   className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg">
  <WhatsappIcon />
</a>
```

**Delivery estimate:** Show "Delivery by [date]" on product pages (+3–7 days from today).

**Pincode check:** Input on product page to check delivery availability (UI + mock logic).

**COD badge:** Show "Cash on Delivery Available" on product cards and detail pages.

---

## Tailwind Config

```ts
// tailwind.config.ts
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#your-brand', foreground: '#ffffff' },
        secondary: { DEFAULT: '#your-secondary', foreground: '#000000' },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/line-clamp')],
};
```

---

## API Integration Layer

```ts
// lib/api/products.ts
import api from './axios';
import { Product, ProductFilters } from '@/types/product';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export const fetchProducts = async (filters: ProductFilters): Promise<PaginatedResponse<Product>> => {
  const { data } = await api.get('/products', { params: filters });
  return data;
};

export const fetchProduct = async (slug: string): Promise<Product> => {
  const { data } = await api.get(`/products/${slug}`);
  return data.data;
};

export const fetchFeaturedProducts = () => fetchProducts({ isFeatured: true, limit: 10 });
```

---

## Google Analytics 4 Events

Track these events throughout the app:

```ts
// lib/analytics.ts
declare const gtag: Function;

export const GA = {
  viewItem: (product: Product) =>
    gtag('event', 'view_item', { currency: 'INR', value: product.price, items: [{ item_id: product._id, item_name: product.name, price: product.price }] }),

  addToCart: (product: Product, quantity: number) =>
    gtag('event', 'add_to_cart', { currency: 'INR', value: product.price * quantity, items: [{ item_id: product._id, item_name: product.name, quantity, price: product.price }] }),

  beginCheckout: (cart: CartItem[]) =>
    gtag('event', 'begin_checkout', { currency: 'INR', value: cart.reduce((s, i) => s + i.price * i.quantity, 0) }),

  purchase: (order: Order) =>
    gtag('event', 'purchase', { transaction_id: order.orderNumber, value: order.pricing.total, currency: 'INR', shipping: order.pricing.shipping, items: order.items.map(i => ({ item_id: i.product, item_name: i.name, price: i.price, quantity: i.quantity })) }),
};
```

---

## next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
};
module.exports = nextConfig;
```

---

## Checklist — Production Ready

### Performance
- [ ] All images use `next/image` with correct `sizes`
- [ ] `priority` set on hero and above-fold product images
- [ ] Cloudinary auto format + quality transforms applied
- [ ] React Query `staleTime` set for all fetches
- [ ] Skeleton loaders on all async content

### SEO
- [ ] `generateMetadata` on every page
- [ ] JSON-LD on product detail pages
- [ ] `sitemap.ts` and `robots.ts` created
- [ ] Canonical URLs on all pages
- [ ] Alt text on all product images

### UX
- [ ] Mobile bottom nav bar
- [ ] WhatsApp float button
- [ ] Cart persists on page refresh (localStorage)
- [ ] Wishlist persists on page refresh
- [ ] Toast notifications on add to cart / errors
- [ ] Loading states on all buttons (prevent double submit)
- [ ] 404 and error pages (`not-found.tsx`, `error.tsx`)
- [ ] Indian currency format (₹ with comma separation)

### Auth
- [ ] Protected routes redirect to `/login`
- [ ] Access token refreshed silently via interceptor
- [ ] User stays logged in on page refresh (persisted store)

### Payments
- [ ] Razorpay script loaded lazily
- [ ] Payment failure handled gracefully (toast + retry option)
- [ ] COD available for orders under ₹10,000
- [ ] Success page fires GA4 `purchase` event

---

## AI Tool Usage Instructions

When using this spec with **Claude Code**, **Cursor**, or **GitHub Copilot**:

1. Create a Next.js 14 project:
   ```bash
   npx create-next-app@latest ecommerce-frontend --typescript --tailwind --app --src-dir=false
   ```
2. Install dependencies:
   ```bash
   npx shadcn-ui@latest init
   npm install axios @tanstack/react-query zustand react-hook-form zod framer-motion sonner lucide-react
   ```
3. Paste this file as `SPEC.md` in the repo root.
4. Use this prompt to start:
   > "Using SPEC.md, set up the project: create all TypeScript types in `types/`, create the Zustand stores in `lib/store/`, create the Axios instance with interceptors in `lib/api/axios.ts`, and set up the root `app/layout.tsx` with Header, Footer, Providers, and WhatsApp button."
5. Then build page by page:
   > "Implement the Homepage as defined in SPEC.md — HeroBanner with Framer Motion, FeaturedCategories, FeaturedProducts using ISR data fetching."
   > "Implement the Product Listing page with FilterSidebar, ProductGrid, skeleton loaders and URL-based filter state."
   > "Implement the Product Detail page with ImageGallery, ProductInfo, Variants, Add to Cart, and JSON-LD schema markup."
   > "Implement the Checkout flow — AddressStep, PaymentStep, and Razorpay integration as defined in SPEC.md."
6. Finally:
   > "Add sitemap.ts, robots.ts, generateMetadata to all pages, and Google Analytics 4 events as defined in SPEC.md."
