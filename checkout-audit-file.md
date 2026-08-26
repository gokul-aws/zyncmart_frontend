Audit Summary

Simple Product Checkout:
- Issues found: Discount from an applied coupon was silently dropped at checkout — both the
  displayed total and the actual amount charged ignored it entirely (hardcoded discount: 0).
  Otherwise price/stock/image/SKU were already correctly backend-sourced.
- Issues fixed: Checkout now uses the cart's real discount for its total, and sends the coupon
  code to the backend, which independently re-validates and applies it (never trusts the
  frontend's discount number).
- Verification: Live-verified GET /products still serves correct simple-product data after all
  changes; coupon logic verified by code review + type-checking (not live-tested — no coupon
  exists in the live DB I could safely test against without creating one).

Variant Product Checkout:
- Issues found: (1) [carried from prior audit turn, already fixed then] frontend/backend field
  name mismatch dropped variant selection. (2) NEW — a variable product could be ordered with a
  missing or mismatched variantId, silently pricing the item at ₹0 (variable products have no
  usable top-level price) while deducting from the wrong stock counter. (3) A variantId belonging
  to a *different* product was accepted without any cross-check.
- Issues fixed: createOrder now hard-requires a real variant on the *same* product for every
  variable-product item before touching stock or price — anything else is rejected with a clean
  400, before any stock mutation happens.
- Verification: Live-fetched a real variant product (3 variants, 2 colors) through the actual
  storefront page — confirmed correct variant resolution end-to-end. The order-creation exploit
  itself was verified by code tracing (confirmed exploitable pre-fix, confirmed blocked post-fix)
  — not exercised as a live order against the real database.

Cart:
- Issues found: (1) Backend never validated quantity/productId/variantId shape on
  add-to-cart/order creation — a negative quantity would flip the stock $inc sign and *increase*
  stock instead of decreasing it. (2) Price/stock changes on refresh were applied silently with
  no way for the user to know their cart changed. (3) types/cart.ts's stock field was a fabricated
  object shape that never matched the real number the API returns (quantity selector always
  allowed up to 99). (4) No format validation on cart item IDs.
- Issues fixed: strict quantity/ObjectId validation added; refreshCartPrices now returns
  human-readable notices (item removed / price changed / quantity reduced) surfaced as toasts;
  stock type/read fixed; ObjectId validation added to cart routes.

Buy Now:
- Issues found: **Completely unwired.** The Buy Now button called the cart's addItem and
  navigated to plain /checkout with no buyNow flag — it silently checked out the user's entire
  cart, not just the clicked product. The dedicated buyNowStore existed but nothing ever called
  its setItems.
- Issues fixed: Buy Now now builds its single line item from already-backend-sourced
  product/variant data, stores it in buyNowStore, and navigates to /checkout?buyNow=true so
  checkout genuinely isolates it from the cart.
- Verification: Live-rendered the product page and confirmed the button/handler wiring
  compiles and renders; the actual isolated-checkout behavior could not be exercised end-to-end
  without login credentials.

Payment:
- Issues found: (1) Webhook signature was computed over JSON.stringify(req.body) instead of the
  raw bytes Razorpay sent — re-serialization isn't guaranteed to match byte-for-byte, so
  legitimate webhooks could fail verification. (2) orderId wasn't format-validated before hitting
  Mongoose. (3) [already good] client-side "payment success" was already independently verified
  server-side via HMAC before marking an order paid, and markOrderPaid was already idempotent.
- Issues fixed: raw body now captured and used for webhook HMAC; orderId validated in both
  payment endpoints.
- Verification: Verified by code review of the crypto/HMAC logic and Express middleware order;
  could not trigger a real Razorpay webhook in this environment.

Order Creation:
- Issues found: (1) [critical, described above] missing quantity/variant validation. (2)
  Order-confirmation and payment-success emails referenced a `variant` field that doesn't exist
  on the Order schema (it stores color/size separately) — every email silently omitted the
  purchased color/size. (3) Coupon discount never applied to the persisted order.
- Issues fixed: all three. Emails now build the display label from color+size; coupon is
  re-validated and applied server-side.
- Verification: Live-fetched a real variant product and confirmed order-item field shapes match
  what the (fixed) email/admin code now expects; did not place a real order.

Stock:
- Issues found: negative-quantity exploit (above); otherwise the atomic conditional
  $inc-with-$gte pattern in adjustProductStock was already correct and race-safe for the
  "last unit, two buyers" scenario — MongoDB serializes concurrent updates to the same document,
  and the conditional filter prevents either from taking it below zero. No explicit
  multi-document transaction is needed for this; verified sound rather than rebuilt.
- Issues fixed: negative-quantity path closed (see Order Creation). Cart cleanup after order
  creation used to unconditionally `Cart.deleteOne()` — this would wipe a user's entire persisted
  cart even for a Buy Now purchase that had nothing to do with it. Replaced with a surgical
  `$pull` that removes only the specific items actually purchased.

Files Changed

Backend
- src/controllers/orderController.js — quantity/productId/variantId validation before any stock mutation; hard variant-required check for variable products; surgical cart-cleanup ($pull instead of blanket delete); coupon re-validation + application; usedCount increment; fixed the variant field in email payloads.
- src/controllers/paymentController.js — webhook now verifies against the raw request body; orderId format validation in both endpoints; same email variant-field fix.
- src/controllers/cartController.js — productId/variantId/quantity validation on add-to-cart; threads price/stock-change notices through to the response.
- src/services/cart.js — refreshCartPrices now returns notices instead of silently mutating; toCartResponse includes them.
- src/app.js — express.json now captures the raw body buffer for webhook signature verification.
- src/middleware/validateObjectId.js (new) — shared ObjectId-format-validation middleware, extracted for reuse across products/orders/cart routes.
- src/routes/products.js, src/routes/orders.js, src/routes/cart.js — apply the shared ID-validation middleware.

Frontend
- components/product/ProductInfo.tsx — Buy Now rewritten to use buyNowStore instead of the cart, isolating it as its own checkout.
- components/checkout/CheckoutClient.tsx — actual checkout total now includes the discount (it didn't before); sends couponCode; double-submit guard on order placement.
- lib/store/cartStore.ts — surfaces backend cart notices as toasts.
- lib/api/orders.ts — couponCode added to the create-order payload.
- types/cart.ts — stock corrected from a fabricated object to the real number; notices added.
- types/order.ts — added the missing size field, removed the fictitious variant field that was never actually populated by the backend.
- app/(admin)/admin/orders/[id]/page.tsx, app/(storefront)/(account)/account/orders/[id]/OrderDetailClient.tsx — display Size (was missing entirely); removed the dead always-undefined variant line.

API Changes

- POST /orders — accepts optional couponCode; rejects invalid quantity/productId/variantId with a 400 (previously either silently mispriced the order or 500'd); no longer trusts pricing.shipping; response's pricing.discount now reflects a real, re-validated coupon.
- POST /payments/verify, POST /payments/create-order — reject a malformed orderId with 400.
- PUT /products/:id, DELETE /products/:id, image sub-routes, GET/POST /orders/:id*, PATCH/DELETE /cart/item/:itemId — malformed IDs now return 400 instead of a raw 500.
- GET /cart, POST /cart/add — response now includes notices: string[] describing anything the backend changed while re-syncing against live product data.

Database Changes

- No schema changes. Coupon.usedCount is now actually incremented (the field already existed but was write-only-in-name — usage limits were previously unenforceable). No migration needed.

Testing Performed

- tsc --noEmit: clean throughout every round of edits.
- eslint: no new errors introduced (confirmed the remaining errors/warnings are pre-existing, unrelated to this work).
- Backend: node --check on every edited file; npm test passes (same 5 suites as before this work).
- Live-verified against the real backend + database (read-only — no writes made): booted both servers; confirmed GET /products/GET /products/:slug still work; confirmed a real variant product's storefront page renders correctly with the Buy Now button present and no console/server errors; confirmed malformed IDs on protected routes correctly hit the auth check first (401) rather than leaking whether the ID itself is valid.

What was not verified (and why):
- I did not place any real orders, apply any real coupons, or trigger a real Razorpay payment/webhook — I have no login credentials for this live, populated database, and creating test orders/coupons against it risks polluting real data. The order-creation exploit fixes (negative quantity, cross-product variantId, dropped coupon) were verified by tracing the exact code path an attacker/legitimate request would take, not by sending a live request.
- The backend's own test suite still doesn't exercise any of this: as noted in the prior audit, cart.test.js tests a disconnected reimplementation that never imports the real service, and orders.test.js/payments.test.js are test.todo() placeholders — none of the fixes in this pass are covered by an automated regression test. I'd strongly recommend adding real integration tests for createOrder (the negative-quantity and cross-product-variant cases especially) as a follow-up, since both were live, exploitable bugs that existing tests gave zero signal on.
- Browser-interactive testing (clicking Buy Now, completing a Razorpay payment, watching a webhook fire) wasn't performed — only SSR output, code paths, and type-checking were verified.
