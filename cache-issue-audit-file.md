Root Cause

Two independent caching layers exist in this app, and neither had any on-demand invalidation wired up — both were purely time-based:

1. Next.js server-side Data Cache (the actual cause of the "admin creates a product, customer doesn't see it" problem). The homepage, category listing page, category detail page, and product detail page are all async Server Components that fetch data directly via fetch() with next: { revalidate: 3600 } (a flat 1-hour ISR window). Nothing in the codebase ever called revalidateTag/revalidatePath/updateTag — I confirmed via grep that no such call existed anywhere. So after any admin mutation, these pages kept serving the pre-mutation snapshot to every visitor for up to an hour, or until the Next.js server process happened to cycle.
2. React Query (client-side), used by the product listing grid and the site's category nav bar. Admin mutations already called queryClient.invalidateQueries(...) — but that only clears the admin's own browser's cache. It has zero effect on any other visitor's separate browser session, and — for categories specifically — it wasn't even invalidating the customer-facing query key (['categories']); only ['admin-categories'] was ever touched.

The admin's mutation flow calls the Express backend directly via axios — never through the Next.js server — so the Next.js process had no way of knowing a write had happened at all.

Fixes

1. Tagged the customer-facing fetch() calls in lib/api/products.ts and lib/api/categories.ts (products, product:{slug}, categories, category:{slug}), keeping the existing revalidate: 3600 as a fallback safety net.
2. Added lib/actions/revalidate.ts — two Server Actions (revalidateProducts(slug?), revalidateCategories(slug?)) that call updateTag(). I deliberately used updateTag, not revalidateTag — this Next.js 16 version's revalidateTag(tag, 'max') (the recommended profile) is stale-while-revalidate: the very next visitor after a mutation would still get served the old snapshot while a fresh copy loads in the background, which fails "immediate visibility" outright. updateTag expires the tag immediately, so the next request is a genuine cache miss — but it only works when invoked from within an actual Server Action, which is exactly what this file provides.
3. Wired both into the existing admin mutation hooks — hooks/useAdminProducts.ts's invalidateStorefrontQueries() (already called by every product create/update/delete/toggle-status/image-upload mutation) now also calls revalidateProducts(slug). hooks/useAdminCategories.ts got a new equivalent helper (it previously only invalidated ['admin-categories'], never the customer-facing ['categories'] key at all — fixed that gap too) that calls revalidateCategories(slug).
4. Invalidation only fires inside onSuccess, after the mutation's own promise has already resolved (i.e., after the database write succeeded) — never before, and never on failure.

Files Changed

- lib/actions/revalidate.ts (new) — the two Server Actions.
- lib/api/products.ts — added tags: ['products'] to fetchProducts, tags: ['product:{slug}'] to fetchProduct.
- lib/api/categories.ts — added tags: ['categories'] to fetchCategories, tags: ['category:{slug}'] to fetchCategory.
- hooks/useAdminProducts.ts — invalidateStorefrontQueries() now also calls revalidateProducts(slug).
- hooks/useAdminCategories.ts — new shared invalidateStorefrontCategoryQueries() helper invalidates the customer-facing ['categories'] React Query key (previously missing) and calls revalidateCategories(slug); wired into create/update/delete.

(All other files in the working tree are carried over from earlier turns in this session — Product/Cart/Order/Wishlist audits — not part of this fix.)

Cache Strategy

- Targeted, tag-based invalidation, not a global cache wipe. A product mutation busts products (covers every listing/homepage section that fetched under that tag) and, when the slug is known, product:{slug} (that one PDP) — it does not touch other products' individually-cached PDPs. Same split for categories.
- updateTag for true immediate expiry, called from Server Actions triggered by the admin's own mutation success — not revalidateTag's stale-while-revalidate mode, which would still show one visitor the old data.
- The revalidate: 3600 ISR ceiling stays in place as a fallback (e.g., if a mutation path is somehow missed), matching "do not simply disable all caching."
- Backend GET /products/GET /categories already query MongoDB fresh on every request with correct isActive filtering (verified in an earlier audit pass) — no backend-side caching layer (no Redis in this path) needed to be touched.

Verification

- tsc --noEmit: clean (this also caught a real issue — this Next.js 16 install's revalidateTag/updateTag signatures differ from older Next.js docs I might otherwise have assumed; I read the actual bundled node_modules/next/dist/docs/ per this repo's own AGENTS.md instruction before writing any code, which is what surfaced the updateTag vs revalidateTag distinction in the first place).
- eslint: no new errors introduced (remaining errors/warnings on useAdminProducts.ts/useAdminCategories.ts are pre-existing no-explicit-any/unused-import issues unrelated to this change).
- Live-verified: booted both servers and confirmed the homepage, PDP, category listing, and category detail pages all still render correctly (200, no errors) after adding the tags option to their underlying fetches.
- Live-verified the failure mode of the guard itself: I first tried calling the new Server Action from a Route Handler as a sanity check, and Next.js correctly threw updateTag can only be called from within a Server Action — confirming the runtime genuinely enforces this contract and that my file is recognized as containing real Server Actions.
- Not fully verified end-to-end: I could not exercise the actual client-invocation path (admin hook → Server Action → immediate customer-visible update) live. That requires either a real browser executing the client bundle (the claude-in-chrome extension was offered and declined) or admin login credentials against this live, populated database, which I avoided using for the reasons noted in earlier turns of this session (no test account, didn't want to mutate real data). I attempted a safe, no-auth-required verification via a temporary test page that calls the Server Action from a client component, but confirming its output requires JS execution (a real browser) that I don't have access to in this environment — I removed that temporary page/route rather than leave it in place unverified.
- What I'm confident in, and why: the implementation matches Next.js's own official documented example for this exact use case (updateTag('posts') / updateTag('post-{id}') inside a Server Action after a database write, from the bundled updateTag.md for this exact installed version) line-for-line in structure, and the one behavior I could verify live (the guard rejecting a non-Server-Action call) behaved exactly as documented.
- Recommendation for the user: after deploying, do one manual pass — update a product's price in the admin panel, then load that product's PDP in a separate private/incognito window (not the admin's own tab) and confirm the new price appears without a delay. That's the one link in this chain I couldn't close out myself.