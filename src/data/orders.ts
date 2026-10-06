import type { Order, OrderStatus, PaymentMethod, TimelineEvent, OrderItem, Product } from '@/types';
import { seedProducts } from './products';
import { sellers } from './sellers';
import { customers, AREAS } from './customers';
import { makeRng } from '@/utils/random';
import { CITY_PROVINCE, deliveryDays } from '@/utils/delivery';
import { deliveryWindow, ymd } from '@/utils/format';

export const NOW = new Date('2026-10-05T14:30:00+05:00');
const FLOW: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const NOTES: Record<OrderStatus, string> = {
  pending: 'Order placed successfully',
  confirmed: 'Seller confirmed your order',
  processing: 'Seller is preparing your order',
  packed: 'Order packed and ready to ship',
  shipped: 'Handed over to courier',
  out_for_delivery: 'Rider is on the way',
  delivered: 'Delivered — thank you for shopping with B-Bazar',
  cancelled: 'Order cancelled',
  refunded: 'Refund issued to original payment method',
};
export const COURIERS = ['TCS', 'Leopards Courier', 'M&P Express', 'BlueEx', 'B-Bazar Express'];

export function buildTimeline(status: OrderStatus, createdAt: string): TimelineEvent[] {
  const start = new Date(createdAt).getTime();
  const step = (k: number) => new Date(start + k * 1000 * 60 * 60 * (k < 3 ? 3 : 14)).toISOString();
  if (status === 'cancelled') return [{ status: 'pending', at: createdAt, note: NOTES.pending }, { status: 'cancelled', at: step(1), note: 'Cancelled by customer before dispatch' }];
  if (status === 'refunded') {
    return [...FLOW.map((s, k) => ({ status: s, at: step(k), note: NOTES[s] })), { status: 'refunded' as OrderStatus, at: step(7), note: NOTES.refunded }];
  }
  const idx = status === 'processing' ? 1 : FLOW.indexOf(status);
  return FLOW.slice(0, idx + 1).map((s, k) => ({ status: s, at: step(k), note: NOTES[s] }));
}

export const toOrderItem = (p: Product, qty: number, variant?: string): OrderItem => {
  const seller = sellers.find((s) => s.id === p.sellerId)!;
  return { productId: p.id, title: p.title, image: p.images[0], icon: p.icon, sellerId: p.sellerId, sellerName: seller?.name ?? 'Seller', price: p.price, qty, variant, category: p.category };
};

const rng = makeRng(1042);
const approved = seedProducts.filter((p) => p.status === 'approved');
const techzone = approved.filter((p) => p.sellerId === 'S1001');
const PAYMENTS: PaymentMethod[] = ['cod', 'cod', 'cod', 'card', 'jazzcash', 'easypaisa', 'bank'];

function statusForAge(hours: number): OrderStatus {
  if (hours < 6) return rng.pick(['pending', 'pending', 'confirmed']);
  if (hours < 30) return rng.pick(['confirmed', 'processing', 'packed']);
  if (hours < 80) return rng.pick(['packed', 'shipped', 'shipped', 'out_for_delivery']);
  return rng.pick(['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'refunded']);
}

function makeOrder(i: number, created: Date, customerIdx: number, items: OrderItem[], forced?: Partial<Order>): Order {
  const c = customers[customerIdx];
  const hours = (NOW.getTime() - created.getTime()) / 3.6e6;
  const status = forced?.status ?? statusForAge(hours);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const deliveryFee = subtotal >= 2999 ? 0 : 199;
  const discount = rng.chance(0.25) ? Math.round(subtotal * 0.1 / 50) * 50 : 0;
  const payment = rng.pick(PAYMENTS);
  const [a, b] = deliveryDays(c.city);
  const area = AREAS[c.city] ?? AREAS.default;
  const id = `BBZ-${ymd(created)}-${String(1000 + ((i * 37) % 9000)).padStart(4, '0')}`;
  return {
    id,
    customerId: c.id, customerName: c.name, customerPhone: c.phone,
    items,
    address: { name: c.name, phone: c.phone, line: rng.pick(area), city: c.city, province: CITY_PROVINCE[c.city] ?? 'Punjab', postal: String(rng.int(44000, 75900)) },
    payment,
    paymentStatus: status === 'refunded' ? 'refunded' : status === 'cancelled' ? (payment === 'cod' ? 'pending' : 'refunded') : payment === 'cod' && status !== 'delivered' ? 'pending' : 'paid',
    status,
    createdAt: created.toISOString(),
    subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount,
    deliveryMethod: rng.chance(0.2) ? 'express' : 'standard',
    courier: rng.pick(COURIERS),
    tracking: `${rng.pick(['TCS', 'LCS', 'MNP', 'BEX', 'BBX'])}${rng.int(100000000, 999999999)}`,
    eta: deliveryWindow(created, a, b),
    timeline: buildTimeline(status, created.toISOString()),
    ...forced,
  };
}

const list: Order[] = [];
// Hero relationship: Ahmed Khan → Wireless Earbuds Pro X → TechZone PK
const earbuds = approved.find((p) => p.title === 'Wireless Earbuds Pro X')!;
list.push(makeOrder(0, new Date('2026-10-05T10:42:00+05:00'), 0, [toOrderItem(earbuds, 1, 'Midnight Black')], { id: 'BBZ-20261005-1042', status: 'confirmed', payment: 'cod', paymentStatus: 'pending', discount: 0, deliveryFee: 0, total: earbuds.price, courier: 'TCS', tracking: 'TCS784512369' }));
list[0].timeline = buildTimeline('confirmed', list[0].createdAt);

for (let i = 1; i < 50; i++) {
  const created = new Date(NOW.getTime() - rng.int(1, 30 * 24) * 3.6e6 - rng.int(0, 59) * 60000);
  const customerIdx = i < 6 ? 0 : rng.int(0, customers.length - 1);
  const pool = rng.chance(0.42) ? techzone : approved;
  const count = rng.chance(0.25) ? 2 : 1;
  const chosen = new Set<Product>();
  while (chosen.size < count) chosen.add(rng.pick(pool));
  const items = [...chosen].map((p) => toOrderItem(p, p.price > 20000 ? 1 : rng.int(1, 3), p.colors?.[0] ?? p.sizes?.[0]));
  list.push(makeOrder(i, created, customerIdx, items));
}
// Ensure Ahmed has a delivered order to review + one in transit
list[1].status = 'delivered'; list[1].timeline = buildTimeline('delivered', list[1].createdAt); list[1].paymentStatus = 'paid';
list[2].status = 'shipped'; list[2].timeline = buildTimeline('shipped', list[2].createdAt);

export const seedOrders: Order[] = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
