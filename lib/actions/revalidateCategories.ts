'use server';

import { updateTag } from 'next/cache';

// Expire cached category data so storefront pages show admin changes immediately.
export async function revalidateCategories() {
  updateTag('categories');
}
