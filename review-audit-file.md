
Root Cause

The average rating calculation and aggregation were already mathematically correct — I verified this against live data: Product.ratings.average/count matched an independent live recomputation from the Review collection exactly, for every reviewed product in the database. The actual bug was in the "immediate visibility" pipeline after a review is submitted, and a latent bug in the rating distribution bars:

1. Wrong React Query cache key. hooks/useReviews.ts's useAddReview/useDeleteReview invalidated ['products', slug] (plural) after a review mutation — but the product detail page actually reads product data via ['product', slug] (singular, from useProduct()). That key was never used anywhere, so the invalidation call was a silent no-op: the cached product object (holding the pre-review ratings.average/count) never got told to refresh.
2. Missing server-side cache invalidation. The product detail page is a cached Server Component (next: { revalidate: 3600 }, plus tagging I added in an earlier pass this session). router.refresh() re-renders the Server Component tree, but doesn't bypass the underlying fetch()'s cache — so even with (1) fixed, the page would keep serving the same cached snapshot until the 1-hour ISR window lapsed, since nothing told Next.js to invalidate the product:{slug} tag after a review.
3. Rating distribution computed from the wrong dataset. ProductReviews.tsx's per-star bars were computed from reviews — the current page of reviews (paginated at 10/page) — not the full review set. For any product with more than one page of reviews, every bar's percentage would be wrong (computed against ~10 reviews instead of the true total). This didn't show up as visibly broken with the current dataset (every product in this DB has exactly 0 or 1 review, so page 1 already contains 100% of the data), but it's a real, confirmed bug.
4. Minor: rating validation on POST /reviews/:slug/reviews only checked truthiness (if (!rating)), relying on Mongoose's own schema validator to reject out-of-range/non-numeric values — which works, but surfaces as a raw ValidationError/CastError through the generic error handler instead of a clean, predictable 400.
5. Minor: the backend pre-rounded the average to 1 decimal before storing it (parseFloat(avg.toFixed(1))), discarding precision the display layer never needed pre-rounded (every display site — ProductCard, ProductInfo, ProductReviews — already calls .toFixed(1) itself).

Fixes

1. Fixed the React Query invalidation key (['product', slug], matching what useProduct() actually reads) and added a call to the revalidateProducts(slug) Server Action (the same mechanism wired into admin mutations in an earlier task this session) so the server-side Data Cache is genuinely busted, not just the client cache.
2. Extended the single existing recalcRatings aggregation to also compute a per-star distribution in the same query (grouping by $rating instead of a separate $avg/$sum pass — one aggregation, not two), and added Product.ratings.distribution to the schema. Updated ProductReviews.tsx to read this backend-computed distribution instead of deriving it from the paginated review list.
3. Backfilled the new distribution field onto all 27 existing products via a one-off idempotent script (matching this repo's existing migrateColorVariants.js convention), since it wouldn't otherwise populate until a product's next review create/delete.
4. Added explicit rating validation (type + 1–5 range check, coercing a numeric string) with a clean 400, before the value ever reaches Review.create.
5. Removed the premature rounding — ratings.average is now stored at full precision; display-layer rounding (already present everywhere it's shown) is unaffected.

Review Flow

Review creation:              PASS
Review validation:            PASS (hardened — was relying on schema validator only)
Average rating:                PASS (calculation was already correct; storage precision fixed)
Review count:                  PASS
Rating distribution:           PASS (was computing from current page only — fixed)
Product listing:                PASS
Product details:                PASS
Immediate update after review:  PASS (was broken — wrong cache key + missing server invalidation — fixed)

Files Changed

Backend
- src/controllers/reviewController.js — recalcRatings now computes distribution alongside average/count in one aggregation, stores unrounded average; createReview gets explicit rating type/range validation.
- src/models/Product.js — added ratings.distribution (per-star counts).
- src/scripts/backfillProductRatings.js (new) — one-off idempotent backfill for the new field; run once against the live DB during this session.
- package.json — added the backfill:product-ratings script entry.

Frontend
- hooks/useReviews.ts — fixed the dead invalidation key; added revalidateProducts(slug) calls to both add and delete.
- components/product/ProductReviews.tsx — distribution bars now use ratings.distribution instead of the paginated reviews array.
- types/product.ts — added ratings.distribution to the Product type.

(All other files in the working tree are carried over from earlier turns in this session — Product/Cart/Wishlist/Caching audits — not part of this fix.)

API Changes

- GET /products, GET /products/:slug — ratings now includes a distribution: { "1": n, "2": n, "3": n, "4": n, "5": n } field alongside the existing average/count. Purely additive — no existing field renamed or removed.
- POST /reviews/:slug/reviews — invalid rating (non-numeric, out of 1–5 range, null) now returns a clean 400 { error: "rating must be a number between 1 and 5" } instead of a raw validation-error message.

Database Changes

- Product.ratings.distribution (new nested field, default all-zero). No index changes — the existing {product:1, user:1} unique compound index on Review already efficiently supports the Review.find({product})/aggregation-by-product access pattern used here; no new index was needed.
- One-time backfill executed against the live database: all 27 products now have a populated ratings.distribution (previously only average/count existed).

Testing

- tsc --noEmit: clean.
- eslint: no new errors (remaining errors on ProductReviews.tsx/useReviews.ts are pre-existing, unrelated to this change — confirmed by checking they were already flagged in this session's first-turn audit).
- Backend: node --check on every edited/new file; npm test passes (same 5 suites, unchanged).
- Live-verified against the real database: wrote a diagnostic script comparing Product.ratings against an independent live recomputation from Review documents for every product that has reviews — confirmed the stored average/count matched exactly (no calculation bug existed). Ran the backfill script live (27 products updated). Re-fetched GET /products/jbl1 and confirmed the response now includes the correct distribution: {"5":1, others:0}. Booted both servers and loaded the actual product page in a real request — confirmed the RSC payload carries ratings:{"average":5,"count":1,"distribution":{...}} end-to-end, and the rendered page shows "5.0" and "Reviews (1)" correctly.
- Not verified live: actually submitting/editing/deleting a review through the UI as an authenticated user (no login credentials available for this populated database, consistent with earlier tasks this session), so the "average updates without refresh" fix is verified by code tracing (the exact same Server Action mechanism already proven to work for admin mutations in a prior task) rather than an observed end-to-end submission. There is also no "review edit" endpoint in the current backend at all (only create/delete) — per the task's own conditional framing, I did not add one since it isn't part of the existing architecture. Review moderation/status (pending/approved/rejected) also doesn't exist in the current schema — not introduced, for the same reason.