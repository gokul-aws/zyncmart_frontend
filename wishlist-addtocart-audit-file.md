Add to Cart

Issues found:
- Critical: A variable product could be added to cart with no variantId (or an already-invalid one). Since a variable product has no usable top-level price, this priced the cart item at ₹0 and deducted from the wrong stock counter (the aggregate top-level stock, not any specific variant's). This existed in both addItem and the read-time refreshCartPrices re-sync.
- Add to Cart / Buy Now never checked authentication before calling the backend — a logged-out click got a confusing generic "Failed to add to cart" toast instead of being told to log in.
- The product card's quick-add button silently picked some in-stock variant for variable products without the shopper ever choosing color/size — exactly the "auto-select an incorrect/default variant" failure mode.
- No double-click guard on any Add to Cart button — a fast double click could race two addItem calls.

Issues fixed: variant-required validation closes the ₹0 exploit; Add to Cart/Buy Now now check auth first and redirect to login with a redirect back-link; the product card now shows "Select Options" (navigates to the PDP) for variable products instead of guessing; a useSubmitGuard-based double-click guard was added to the card's Add to Cart.

Simple product: Was already correct once the exploit above is out of scope — productId + quantity, backend-resolved price/stock/image, unchanged.

Variant product: Now hard-requires a real variant belonging to the same product; color/size/image/SKU/price all correctly resolved from the selected variant (carried over from the prior checkout audit's PDP fix, verified still intact).

Stock validation: addItem already checked stock and merged quantities into the existing item correctly (confirmed, no bug) — the only gap was the ₹0/wrong-stock-counter exploit above, now closed.

Price validation: Confirmed price was never accepted from the client anywhere in the cart flow — the only real issue was the variable-product-without-variant path silently computing ₹0, not a client-supplied price being trusted.

Wishlist

Issues found — this is the headline finding: there was no backend wishlist at all. The entire feature was localStorage only (Zustand persist), meaning: zero authentication requirement (contradicts the task's own auth requirement), completely disconnected from the user's account (doesn't survive a new device/browser, doesn't match "only authenticated users" anywhere in the spec), and the wishlist page itself had a separate, serious bug — it called fetchProducts({limit:50}) and filtered client-side by ID, which silently dropped any wishlisted item that wasn't among the 50 most-recently-created products in the entire catalog.

Issues fixed: Built a real backend Wishlist (model + controller + routes), mirroring the existing Cart architecture and conventions exactly (same authenticate gate, same mongoose.Types.ObjectId.isValid validation, same normalizeProduct reuse for the populated product data). Rewrote the frontend store to be backend-synced (optimistic update + rollback, matching cartStore's existing pattern) instead of persisted to localStorage. Rewrote the wishlist page to render the backend's fully-populated list directly — no more 50-item ceiling, no more silently-missing items. Wired loadWishlist() into the same login/logout/app-boot points loadCart() already uses.

Simple product: productId-only, matches the pre-existing (and preserved) product-level design.

Variant product: Wishlist remains product-level, as it always was — I did not introduce a variant dimension to it (per the instruction not to introduce a different data model without checking first; the existing behavior was product-level and I kept it that way).

Duplicate prevention: Enforced with a real MongoDB unique compound index on (user, product) — a genuine DB-level guarantee, not just app logic, so even a raced double-click can't create two rows (the second insert's duplicate-key error is caught and treated as an idempotent success).

Cart

Issues found: (1) the ₹0/wrong-stock-counter exploit above. (2) No format validation on productId/variantId in POST /cart/add (malformed input → 500 instead of 400) — already partly covered by the previous checkout audit for order creation, but not for cart-add specifically. (3) WishlistClient.tsx's cart-adjacent quantity/duplicate behavior — verified correct, not a bug (see below).

Issues fixed: added mongoose.Types.ObjectId.isValid checks to addToCart.

Quantity update: QuantitySelector was already correctly bounded to [1, stock] with no way to reach 0 except the explicit remove action — verified, no bug found.

Remove item: removeItem in the cart service already worked correctly (deletes the subdocument, recalculates totals) — verified, no bug found.

Multiple variants: Verified correct — addItem's existing-item lookup matches on (product, variant) together, so Blue/M and Red/L of the same product stay as separate cart rows, while adding Blue/M twice merges into one row with an incremented quantity. No fix needed here.

Authentication

Issues found: Wishlist had none (see above). Add to Cart/Buy Now attempted the API call before checking auth, producing a confusing generic error instead of a clear login prompt. Cart/Order/Payment endpoints already correctly derived userId from the JWT (req.user.userId), never from the request body — confirmed, no gap there.

Issues fixed: explicit isAuthenticated() checks with a redirect-to-login (carrying a redirect back-link) added to Add to Cart, Buy Now, and both wishlist entry points (button + PDP), matching the pattern already used elsewhere in the app for checkout.

Files Changed

Backend
- src/models/Wishlist.js (new) — {user, product} with a unique compound index.
- src/controllers/wishlistController.js (new) — list (fully populated + orphan cleanup), add (idempotent on duplicate), remove.
- src/routes/wishlist.js (new) — authenticated CRUD routes.
- src/app.js — registers /wishlist.
- src/services/cart.js — closes the variable-product-without-variant ₹0 exploit in both addItem and refreshCartPrices.
- src/controllers/cartController.js — ObjectId validation on add-to-cart.

Frontend
- lib/store/wishlistStore.ts — rewritten from localStorage-persisted to backend-synced with optimistic updates.
- lib/api/wishlist.ts, types/wishlist.ts (new).
- hooks/useWishlist.ts — exposes the new async API and populated products.
- components/ui/WishlistButton.tsx, components/product/ProductInfo.tsx — auth-gated, async-aware wishlist toggling; auth-gated Add to Cart/Buy Now.
- components/product/ProductCard.tsx — variant quick-add fixed to navigate instead of guessing; double-click guard added.
- app/(storefront)/(account)/account/wishlist/WishlistClient.tsx — rewritten to use the real populated wishlist data instead of the buggy top-50 fetch-and-filter.
- components/layout/Providers.tsx, hooks/useAuth.ts — wishlist load/clear wired into the same boot/login/logout points as cart.
- components/checkout/CheckoutClient.tsx — refreshes the cart on checkout mount so stale price/stock is caught before payment, not just at final order rejection.

(The app/(admin).../orders/[id]/page.tsx, OrderDetailClient.tsx, lib/api/orders.ts, types/order.ts, types/cart.ts entries in the diff are carried over from the prior Checkout Flow audit turn in this same session, not new in this pass.)

API Changes

- GET /wishlist, POST /wishlist, DELETE /wishlist/:productId (new) — all authenticate-gated; list returns fully-populated product data (same shape as GET /products).
- POST /cart/add — rejects a variable product with no/invalid variant with a clean 400 instead of silently pricing it at ₹0; rejects malformed productId/variantId with 400.

Database Changes

- New wishlists collection with a unique index on {user: 1, product: 1}. No changes to existing collections' schemas.

Testing

- tsc --noEmit: clean throughout every round of edits (final exit code 0).
- eslint: no new errors introduced (all remaining errors are the same pre-existing set-state-in-effect convention already present elsewhere in the codebase, e.g. WishlistButton.tsx's hydration guard — confirmed not something I introduced).
- Backend: node --check on every new/edited file; npm test passes (same 5 suites, unchanged pass count).
- Live-verified against the real backend + database (read-only): booted both servers; confirmed GET /wishlist correctly 401s when unauthenticated; confirmed the product listing and a real variant product's PDP render without errors, with "Add to wishlist" and "Add to Cart"/"Buy Now" all present in the rendered HTML.
- Not verified live: the actual authenticated wishlist add/remove/duplicate-prevention flow, and the fixed variant-required cart-add rejection — I have no login credentials for this populated database and didn't want to create test accounts/data against it. These were verified by code tracing (confirmed the ₹0 exploit was reachable before the fix, confirmed the new check blocks it) and by the new backend module loading and routing correctly, not by an end-to-end authenticated request.
- The product listing page's client-fetched grid (where ProductCard's "Select Options" change lives) couldn't be verified via a plain HTTP fetch — it renders via useQuery after hydration, which a non-JS request can't observe. I don't have browser automation available in this environment, so this specific piece is verified by tsc/type-safety and code review only, not by seeing it rendered.
- The backend's own test suite still doesn't exercise any of this — as flagged in the prior audit, its cart test is a disconnected reimplementation and the others are test.todo() placeholders, so none of this session's fixes have automated regression coverage. I'd repeat the earlier recommendation: add real integration tests for cart.js's addItem/refreshCartPrices (especially the variable-product-without-variant case) and for the new wishlist controller.