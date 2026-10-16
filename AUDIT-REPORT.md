# DaffoMart Verification Audit Report

**Audited package:** `Daffomart_Production_Ready_Final.zip` (prior claimed-final build)  
**Date:** 2026-10-16  
**Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, Firebase Admin (optional) / local JSON driver, Netlify plugin, jose JWT sessions.

## Summary counts (original claimed-final ZIP, before this fix pass)

| Status | Count (approx.) |
|--------|------------------|
| PASS | ~28 |
| PARTIAL | ~12 |
| FAIL | ~4 |
| BLOCKED | ~6 |
| N/A | ~2 |

**Overall readiness of original claimed-final ZIP:** **Not fully production-ready** without fixes and external credentials. Core storefront + admin CRUD largely present; critical employee data exposure and incomplete invoice/analytics/favicon details needed correction.

## Critical findings (original ZIP)

### FAIL — Employee & attendance APIs publicly listable
- **Evidence:** `src/server/resources.ts` `employeeCfg` / `attendanceCfg` had **no `visible` filter**.
- **Behavior:** `collectionRoutes` GET returns all records to unauthenticated callers when `visible` is absent (`src/server/crud.ts`).
- **Impact:** Staff names, phones, emails, attendance records exposed.
- **Fix applied:** `visible: () => false` so only authenticated admin receives data.

### FAIL — Meta Pixel absent
- No `fbq` / Pixel ID configuration in source.
- **Fix applied:** Optional `metaPixelId` in settings + `MetaPixel` client component (loads only when ID set). Live delivery still **BLOCKED** until real Pixel ID is configured.

### PARTIAL — Invoice
- Print-from-order existed; **no separate persistent invoice entity / PDF**.
- **Fix applied:** `invoiceNo` (`INV-…`) stored on order at creation; print uses invoiceNo + orderNo + settings footer.
- PDF download remains **PARTIAL** (browser print only; no PDF library).

### PARTIAL — Favicon
- Assets existed but were **512×512 ~100KB** (same as logo), not optimized for 16×16.
- **Fix applied:** Generated 16/32/48/180/192 PNGs with padding; layout metadata updated.

### PARTIAL — Branding “no city lock-in”
- Tagline correctly “Everyday Essentials, Delivered with Care.”
- Seed still had Dhaka-centric **announcement** and feature text.
- **Fix applied:** Neutral default announcement/feature copy. Delivery **zones** still name Inside/Outside Dhaka (operational, acceptable).

### PARTIAL — RBAC / HR roles
- Single admin JWT + separate rider app. Employee roles are **records only**, not permission enforcement.
- Multi-role finance/HR server-side matrix: **PARTIAL / not fully implemented**.

### PARTIAL — Courier
- Manual partner CRUD works; no live courier API integration without credentials → **BLOCKED** for automated booking.

### BLOCKED — Full E2E / Netlify deploy / live payments / Pixel Events Manager
- Requires real env, browser, Meta dashboard, gateway merchant keys.

### PASS (with evidence)
- Tagline & default titles: `src/lib/site.ts`, `src/app/layout.tsx`, seed  
- Admin middleware + `requireAdmin` on mutations: `src/middleware.ts`, `src/server/auth.ts`, `src/server/crud.ts`  
- Settings persist via DB (`settings` collection), not localStorage  
- Custom payment methods CRUD + checkout merge  
- Category covers, empty states, return/exchange policy pages  
- Orders require admin for list; track uses orderNo+phone  
- Upload requires admin + image processing  
- robots/sitemap exclude private areas  
- Netlify.toml + Next plugin present  

## Security notes remaining
- `/api/orders/my?phone=` returns recent order summaries for a phone (rate-limited). Documented trade-off for COD “my orders” UX.
- `/api/health` may expose config booleans — acceptable for ops; protect if undesired.
- Production **requires** `AUTH_SECRET`, strong `ADMIN_PASSWORD`, Firebase for durable Netlify data.

## Build verification (this environment)
Dependency install / `next build` often timed out or OOM in the audit sandbox. **You must run on a normal machine or Netlify:**

```bash
npm install
npm run lint
npm run build
```

## Fixes in this package (`Daffomart_Final_Verified.zip`)
1. Admin-only employees & attendance API visibility  
2. Order `invoiceNo` persistence + print label  
3. Meta Pixel optional configuration  
4. Multi-size favicons + metadata  
5. Neutraler default marketing copy  

