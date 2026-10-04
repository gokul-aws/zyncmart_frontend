import Link from 'next/link';
import type { Category } from '@/types/category';
import { buttonClasses } from '@/components/ui/Button';
import HeroShowcase from './HeroShowcase';

/**
 * Static, server-rendered value proposition (what we sell, what to do next)
 * beside a rotating showcase of real category images from the API.
 */
export default function HeroBanner({ categories }: { categories: Category[] }) {
  const showcase = categories.filter((c) => c.isActive && !c.parent && c.image?.url).slice(0, 5);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Jewellery, toys &amp; home accessories
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Shop online and get it delivered across India. Pay securely online or choose cash on delivery.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={buttonClasses({ size: 'lg' })}>
              Shop all products
            </Link>
            <Link href="/categories" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              Browse categories
            </Link>
          </div>
        </div>
        {showcase.length > 0 && <HeroShowcase categories={showcase} />}
      </div>
    </section>
  );
}
