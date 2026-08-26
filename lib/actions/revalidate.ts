'use server';

import { updateTag } from 'next/cache';

// Called from the admin mutation hooks' onSuccess (after the write has
// already landed in the database) to bust the Next.js Data Cache on demand,
// instead of waiting out the `revalidate: 3600` ISR ceiling those fetches
// carry as a fallback.
//
// updateTag (not revalidateTag) deliberately — revalidateTag's recommended
// 'max' profile is stale-while-revalidate: the *next* visitor after the
// mutation would still get served the pre-mutation snapshot while a fresh
// fetch happens in the background, which fails the "immediate visibility"
// requirement outright. updateTag expires the tag immediately, so the very
// next request for it is a real cache miss. It only works inside a Server
// Action, which is exactly what this file is.
//
// Tag-scoped, not revalidatePath('/')/a full cache wipe — invalidating
// 'products' (or 'categories') automatically covers every page that
// fetched data under that tag (homepage sections, listing, category
// pages), since Next.js tracks tag → cache-entry associations itself
// rather than needing each page's path enumerated here.

export async function revalidateProducts(slug?: string) {
  updateTag('products');
  if (slug) updateTag(`product:${slug}`);
}

export async function revalidateCategories(slug?: string) {
  updateTag('categories');
  if (slug) updateTag(`category:${slug}`);
}
