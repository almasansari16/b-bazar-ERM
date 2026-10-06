# B-Bazar — Multi-vendor Marketplace Frontend

**Everything You Need. All in One Bazar.**

A complete React + TypeScript frontend prototype with three connected experiences — **Customer**, **Seller Center** and **Admin Console** — running entirely on mock data (no backend required).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build -> dist/
npm run build:demo   # single-file HTML demo (hash routing) -> dist-demo/
```

### Demo accounts (password `Demo@123`)

| Role | Email | Lands on |
|---|---|---|
| Customer | customer@bbazar.com | `/` |
| Seller (TechZone PK) | seller@bbazar.com | `/seller/dashboard` |
| Admin | admin@bbazar.com | `/admin/dashboard` |

A discreet **Demo** button (bottom-right) switches roles, simulates a slow network (skeletons) and resets demo data.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · React Router 6 · Zustand (persisted to localStorage) · Recharts · React Hook Form + Zod · Lucide icons · Sonner toasts.

## Structure
```
src/
  components/  ui/ (Button, Form, Modal, Drawer, Tabs, DataTable…)  common/  product/  customer/  dashboard/  navigation/
  layouts/     CustomerLayout · SellerLayout · AdminLayout · DashboardShell
  pages/       customer/ · seller/ · admin/ · auth/
  data/        products · sellers · customers · orders · reviews · marketing · engagement · history (all typed mock data)
  store/       useMarket (marketplace DB) · useCart · useWishlist · useAuth · useUI
  services/    apiClient + productService, orderService, sellerService, adminService… (API-ready)
  hooks/ utils/ types/ routes/
```

## Interconnected demo flows
- **Checkout → everywhere:** placing an order (`BBZ-YYYYMMDD-####`) adds it to the customer's orders, the seller's order list, the admin order console and the dashboards; stock and coupon usage update.
- **Seller → Admin → Customer:** a product submitted for approval appears in Admin › Products › Pending; once approved it goes live on the storefront.
- **Admin approvals:** approving/suspending sellers, products and reviews takes effect immediately in the storefront.
- Dashboard metrics are **derived** from 12 months of aggregated history (`data/history.ts`) plus live orders — not hard-coded.

## Connecting a real backend
Set `VITE_API_URL` and replace the mock branch in `src/services/index.ts`. Each method documents its endpoint, e.g. `GET /api/products`, `POST /api/orders`, `POST /api/admin/products/:id/approve`, `POST /api/admin/sellers/:id/approve`. Page components consume the store/services and do not need to change.

## Images
Product photos load from Unsplash. If a photo can't load (offline, blocked network), `SmartImage` renders a branded illustration instead, so the UI never shows a broken image.
