import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryTileProps {
  category: Category;
  sizes: string;
  showDescription?: boolean;
  priority?: boolean;
  className?: string;
}

/** Real category image (or a neutral initial) with the name below — never text over a photo. */
export default function CategoryTile({ category, sizes, showDescription = false, priority = false, className }: CategoryTileProps) {
  return (
    <Link href={`/categories/${category.slug}`} className={cn('group flex flex-col rounded-xl', className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
        {category.image?.url ? (
          <Image
            src={category.image.url}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground" aria-hidden="true">
            {category.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="mt-2.5 text-sm font-semibold text-foreground group-hover:text-primary">{category.name}</span>
      {showDescription && category.description && <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{category.description}</span>}
    </Link>
  );
}
