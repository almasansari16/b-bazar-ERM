import type { Order, Product, CommissionRule } from '@/types';
import { history, SELLER_SHARE, CATEGORY_SHARE, CITY_SHARE, PAYMENT_SHARE } from '@/data/history';
import { DEFAULT_COMMISSION } from '@/data/marketing';

export type RangeKey = 'today' | '7d' | '30d' | '3m' | '12m';
export const RANGE_DAYS: Record<RangeKey, number> = { today: 1, '7d': 7, '30d': 30, '3m': 90, '12m': 365 };
export const RANGE_LABEL: Record<RangeKey, string> = { today: 'Today', '7d': '7 Days', '30d': '30 Days', '3m': '3 Months', '12m': '12 Months' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COUNTED = (o: Order) => o.status !== 'cancelled' && o.status !== 'refunded';
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export interface SeriesPoint { label: string; revenue: number; orders: number; aov: number; customers: number; sellers: number; prevRevenue?: number }

/** Build a time series = aggregated history (scaled by `share`) + live mock orders.
 *  `sellerId` restricts live orders to that seller's line items. */
export function buildSeries(orders: Order[], days: number, opts: { sellerId?: string } = {}): SeriesPoint[] {
  const share = opts.sellerId ? SELLER_SHARE[opts.sellerId] ?? 0.01 : 1;
  const end = new Date();
  const buckets = new Map<string, SeriesPoint>();
  const keyOf = (d: Date) => (days > 90 ? `${d.getFullYear()}-${d.getMonth()}` : days > 30 ? `w${Math.floor((end.getTime() - d.getTime()) / (7 * 864e5))}` : dayKey(d));
  const labelOf = (d: Date) => (days > 90 ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : days > 30 ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : days === 1 ? 'Today' : `${d.getDate()} ${MONTHS[d.getMonth()]}`);
  // pre-create buckets in chronological order
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const k = keyOf(d);
    if (!buckets.has(k)) buckets.set(k, { label: labelOf(d), revenue: 0, orders: 0, aov: 0, customers: 0, sellers: 0 });
  }
  // map history onto the current calendar (history ends "yesterday" relative to the dataset; shift to real today)
  const histLen = history.length;
  for (let i = 0; i < Math.min(days, histLen); i++) {
    const h = history[histLen - 1 - i];
    const d = new Date(end);
    d.setDate(d.getDate() - i - 1);
    const b = buckets.get(keyOf(d));
    if (!b) continue;
    b.revenue += h.gmv * share;
    b.orders += h.orders * share;
    b.customers += h.newCustomers * (opts.sellerId ? share * 4 : 1);
    b.sellers += h.newSellers;
  }
  // live orders are placed relative to the dataset's "now"; anchor them to real today
  const anchor = latestOrderDate(orders);
  for (const o of orders) {
    if (!COUNTED(o)) continue;
    const shifted = new Date(end.getTime() - (anchor - new Date(o.createdAt).getTime()));
    const b = buckets.get(keyOf(shifted));
    if (!b) continue;
    const items = opts.sellerId ? o.items.filter((it) => it.sellerId === opts.sellerId) : o.items;
    if (!items.length) continue;
    b.revenue += items.reduce((n, it) => n + it.price * it.qty, 0);
    b.orders += 1;
  }
  return [...buckets.values()].map((b) => ({ ...b, revenue: Math.round(b.revenue), orders: Math.round(b.orders), customers: Math.round(b.customers), aov: b.orders ? Math.round(b.revenue / b.orders) : 0 }));
}

function latestOrderDate(orders: Order[]) {
  // Seed orders are anchored on 5 Oct 2026; user-placed orders use the real clock.
  const seedMax = new Date('2026-10-05T14:30:00+05:00').getTime();
  const real = Date.now();
  return orders.some((o) => new Date(o.createdAt).getTime() > seedMax) ? Math.max(real, seedMax) : seedMax;
}

export const sumSeries = (s: SeriesPoint[]) => s.reduce((a, p) => ({ revenue: a.revenue + p.revenue, orders: a.orders + p.orders, customers: a.customers + p.customers, sellers: a.sellers + p.sellers }), { revenue: 0, orders: 0, customers: 0, sellers: 0 });

/** Percent change between the latest window and the one before it. */
export function trend(orders: Order[], days: number, key: 'revenue' | 'orders' | 'customers', sellerId?: string) {
  const both = buildSeries(orders, Math.min(365, days * 2), { sellerId });
  const total = (arr: SeriesPoint[]) => arr.reduce((n, p) => n + p[key], 0);
  const half = Math.floor(both.length / 2);
  const prev = total(both.slice(0, half));
  const cur = total(both.slice(half));
  return prev ? ((cur - prev) / prev) * 100 : 0;
}

export const lifetimeMarketplace = (orders: Order[]) => {
  const live = orders.filter(COUNTED);
  const gmv = history.reduce((n, h) => n + h.gmv, 0) + live.reduce((n, o) => n + o.subtotal, 0);
  const count = history.reduce((n, h) => n + h.orders, 0) + orders.length;
  return { gmv, orders: count };
};

export const lifetimeSeller = (orders: Order[], sellerId: string) => {
  const share = SELLER_SHARE[sellerId] ?? 0;
  const items = orders.filter(COUNTED).flatMap((o) => o.items.filter((it) => it.sellerId === sellerId));
  const ordersCount = orders.filter((o) => o.items.some((it) => it.sellerId === sellerId)).length;
  return {
    revenue: Math.round(history.reduce((n, h) => n + h.gmv, 0) * share + items.reduce((n, it) => n + it.price * it.qty, 0)),
    orders: Math.round(history.reduce((n, h) => n + h.orders, 0) * share) + ordersCount,
    customers: Math.round(history.reduce((n, h) => n + h.newCustomers, 0) * share * 6) + new Set(orders.filter((o) => o.items.some((it) => it.sellerId === sellerId)).map((o) => o.customerId)).size,
  };
};

export const commissionRate = (rules: CommissionRule[], category: string, sellerId: string) =>
  rules.find((r) => r.status === 'active' && r.category === category && r.seller === sellerId)?.rate ??
  rules.find((r) => r.status === 'active' && r.category === category && r.seller === 'all')?.rate ??
  DEFAULT_COMMISSION;

/** Distribute a total across share weights, adding live order contributions. */
export function categoryBreakdown(orders: Order[], total: number, catNames: Record<string, string>) {
  const live: Record<string, number> = {};
  orders.filter(COUNTED).forEach((o) => o.items.forEach((it) => { live[it.category] = (live[it.category] ?? 0) + it.price * it.qty; }));
  return Object.entries(CATEGORY_SHARE).map(([slug, w]) => ({ slug, name: catNames[slug] ?? slug, value: Math.round(total * w + (live[slug] ?? 0)) })).sort((a, b) => b.value - a.value);
}
export function cityBreakdown(orders: Order[], total: number) {
  const live: Record<string, number> = {};
  orders.filter(COUNTED).forEach((o) => { live[o.address.city] = (live[o.address.city] ?? 0) + o.total; });
  return Object.entries(CITY_SHARE).map(([city, w]) => ({ city, value: Math.round(total * w + (live[city] ?? 0)) })).sort((a, b) => b.value - a.value);
}
export const PAYMENT_LABEL: Record<string, string> = { cod: 'Cash on Delivery', card: 'Card', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', bank: 'Bank Transfer' };
export function paymentBreakdown(orders: Order[], totalOrders: number) {
  const live: Record<string, number> = {};
  orders.forEach((o) => { live[o.payment] = (live[o.payment] ?? 0) + 1; });
  return Object.entries(PAYMENT_SHARE).map(([k, w]) => ({ key: k, name: PAYMENT_LABEL[k], value: Math.round(totalOrders * w + (live[k] ?? 0)) }));
}
export function topProducts(products: Product[], orders: Order[], sellerId?: string, n = 5) {
  const units: Record<string, number> = {};
  orders.filter(COUNTED).forEach((o) => o.items.forEach((it) => { units[it.productId] = (units[it.productId] ?? 0) + it.qty; }));
  return products
    .filter((p) => p.status === 'approved' && (!sellerId || p.sellerId === sellerId))
    .map((p) => ({ product: p, units: p.sold + (units[p.id] ?? 0), revenue: (p.sold + (units[p.id] ?? 0)) * p.price }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}
