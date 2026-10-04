'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

/** Category links from the API (shares the header's cached category query). */
export default function FooterCategoryLinks({ linkClassName }: { linkClassName: string }) {
  const { data: categories = [] } = useCategories();
  return (
    <>
      {categories
        .filter((c) => c.isActive && !c.parent)
        .slice(0, 6)
        .map((c) => (
          <li key={c._id}>
            <Link href={`/categories/${c.slug}`} className={linkClassName}>
              {c.name}
            </Link>
          </li>
        ))}
    </>
  );
}
