# Daffomart – analysis & bug-fix pass

Checked: `npm ci`, `tsc --noEmit` (0 errors), `next build` (passes), plus a live smoke test of checkout → online pay → track → cancel → rider GPS.

## Bugs fixed
1. **Payment callback was unsafe** (`api/payments/online/callback`)
   - it could mark *any* order (even COD) as paid/failed → now only `payment === "online"` orders
   - a later "fail" callback could flip an already-paid order back to `failed` → paid orders are now never changed again
   - redirect URL now URL-encodes order no. / phone
2. **"Pay now" button was missing on the Track page** – checkout says "retry from the Track page" but no button existed (`payNow()` was dead code). Added, for unpaid online orders.
3. **Service charge could never be saved** – field was missing from `settingsSchema` (zod stripped it) and from the admin Settings UI. Added both. (Backend + checkout + track already supported it.)
4. **Overselling race in `createOrder`** – stock is now re-read right before the order is saved, and the order is written only after stock checks pass.
5. **Reorder created broken product links** – Track/My-orders reorder stored the product *id* as `slug` → `/products/<id>` = 404. Cart sync now refreshes the real slug.
6. **Rider GPS wrote the whole rider record from a stale copy** (could overwrite an admin edit/deactivation) → now `db.update` with only lat/lng/locAt. Same in rider logout.
7. **Rider login timing leak** – unknown phone skipped password hashing; now always hashes.
8. **Rider sign-out left "share location" ON** in localStorage → next login auto-started GPS. Now cleared.
9. **Phone formats** – `+8801712…`, `8801712…`, spaces/dashes now work in Track, Cancel, My orders and Pay-init (new `normPhone` helper).

## Not changed (your decision) – recommendations
- `/api/orders/my?phone=` returns order numbers for any phone number, which weakens the "order no. + phone" check used by Track/Cancel. Consider an OTP, or return less data.
- `npm audit` flags `sharp`, `postcss` (build-time) – run `npm audit fix` and re-test when convenient.
- In-memory rate-limiter resets per serverless instance (fine as a basic guard, not strict).
- Stock decrement is still read-modify-write; for heavy traffic use a Firestore transaction.
- `/api/health` is public and shows which env vars are set (booleans only). Fine for debugging; remove or protect later.
- Set `PAYMENT_TEST_MODE` to `false`/unset on the live site – the sandbox gateway lets anyone "pay" for free.
- Google `Marker` is deprecated (still works); migrate to `AdvancedMarkerElement` later.
