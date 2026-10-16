# DaffoMart – Implementation Report (Production Package)

Date: 2026-10-16

## Summary of changes in this package

### Critical fixes (were broken / incomplete)
1. **DB collections missing from type** – `employees`, `attendance`, `couriers`, `payment_methods` added to `Col` in `src/server/db.ts`.
2. **Resource configs missing** – API routes for employees / attendance / couriers referenced `resource.employees` etc. but `resources.ts` did not export them. Full CRUD configs added and exported.
3. **Admin navigation** – Employees & Attendance and Courier Partners were page files without nav links. Added to `AdminShell` NAV.
4. **Custom payment methods** – Full end-to-end:
   - Types + Zod schema
   - DB collection + resource CRUD
   - API `/api/payment-methods` (+ `[id]`)
   - Admin UI on Payments page (add / edit / delete / visibility / sort / icon / number / require Trx)
   - Checkout merges custom methods with built-in COD / bKash / Nagad / Online
   - Order creation treats custom methods with a number as manual (TrxID + payer number required)
   - Footer lists active custom methods

### Invoice
- Print invoice from Admin → Orders uses store name, tagline, address, phone, email, service charge, and **Invoice footer text** from Settings (Admin → Settings → Invoice & outside Dhaka).

### Already present and preserved
- Tagline: “Everyday Essentials, Delivered with Care.”
- Favicon / logo assets under `public/` and `src/app/icon.png`
- Return & Exchange policy page + admin fields (`returnPolicy`, `exchangePolicy`)
- Category covers admin (`/admin/covers`)
- Support Call / WhatsApp buttons (admin-configurable)
- Theme colors, button radius/size, empty states, footer promo image
- Riders, live map, delivery zones, inventory, offers, content, settings
- Netlify + Next.js 15 App Router setup

## How to deploy (Netlify)

1. Extract this ZIP.
2. `npm install` (Node 20+ recommended; engines relaxed to `>=20`).
3. Set environment variables (see `.env.example`):
   - `NEXT_PUBLIC_SITE_URL` – production URL
   - Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or existing auth vars in project)
   - Firebase (if used for production data): `FIREBASE_*` / `NEXT_PUBLIC_FIREBASE_*`
   - Optional: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `PAYMENT_TEST_MODE`, gateway keys
4. Connect repo or drag-drop to Netlify; build command `npm run build` (see `netlify.toml`).
5. After deploy: log in to `/admin`, configure Payments (custom methods), Settings, Employees, Couriers.

## Admin modules (new / fixed)

| Module | Path | Notes |
|--------|------|--------|
| Employees & Attendance | `/admin/employees` | Roles CEO → Rider; attendance present/absent/late/half/leave |
| Courier Partners | `/admin/couriers` | Outside Dhaka and other areas; manual partners |
| Payments (custom) | `/admin/payments` | Built-in + arbitrary custom methods |
| Invoice footer | `/admin/settings` | Used on printed invoices |
| Orders invoice print | `/admin/orders` | Enhanced print layout |

## Testing status (this environment)

- Source audit and wiring completed.
- Full `npm install` / `next build` could not be completed reliably in the constrained sandbox (OOM / timeouts). **You must run locally or on Netlify:**
  ```bash
  npm install
  npm run lint    # tsc --noEmit
  npm run build
  ```
- Functional flows to verify after deploy: admin login, add custom payment method, place order with that method, print invoice, create employee + attendance, add courier partner.

## Remaining limitations (need your credentials / decisions)

- Real payment gateway (SSLCommerz / AamarPay / bKash PGW) – adapter slot ready; set keys + disable `PAYMENT_TEST_MODE` for live.
- Meta Pixel ID – configure when you have a real Pixel ID (do not invent one).
- Firebase / production DB credentials – use existing project vars; local driver uses `.data` or `/tmp` on serverless.
- Courier provider APIs – manual workflow is implemented; automated booking needs provider credentials.
- Role-based permission matrix beyond admin cookie – current model is single admin session + rider app; finer HR/finance roles would need extra auth design.

## Requirement → status (high level)

| Area | Status |
|------|--------|
| Branding & tagline | Implemented |
| Favicon / logos | Implemented (existing assets) |
| Admin text / theme / settings | Implemented (settings + content) |
| Category icons & covers | Implemented |
| Empty states | Implemented (settings fields) |
| WhatsApp / Call Now | Implemented |
| Return / exchange policy | Implemented |
| Orders lifecycle | Implemented |
| Couriers (outside Dhaka) | Implemented (manual partners) |
| Invoice per order | Implemented (print + customizable footer) |
| Employees + attendance | Implemented (fixed wiring) |
| Custom payment methods | Implemented (this package) |
| SEO / sitemap / robots | Implemented (existing) |
| Netlify compatibility | Preserved |
| Meta Pixel | Config slot only – needs your Pixel ID |
| Full RBAC (finance/HR roles) | Partial – single admin + rider |
| Live courier API tracking | Manual only without provider keys |

