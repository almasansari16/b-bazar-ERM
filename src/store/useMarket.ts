import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './persist';
import type {
  Product, Seller, Order, Review, Coupon, Promotion, Notification, SupportTicket, ReturnRequest, CommissionRule, Category, Banner,
  Customer, Address, OrderStatus, PaymentMethod, ProductStatus, SellerStatus,
} from '@/types';
import { seedProducts } from '@/data/products';
import { sellers as seedSellers } from '@/data/sellers';
import { seedOrders, buildTimeline, toOrderItem, COURIERS } from '@/data/orders';
import { seedReviews } from '@/data/reviews';
import { seedCoupons, seedPromotions, seedBanners, seedCommissions } from '@/data/marketing';
import { seedNotifications, seedTickets, seedReturns, seedConversations, sellerConversations } from '@/data/engagement';
import { categories as seedCategories } from '@/data/categories';
import { customers as seedCustomers, defaultAddresses } from '@/data/customers';
import { deliveryDays } from '@/utils/delivery';
import { deliveryWindow, ymd } from '@/utils/format';

export interface PlaceOrderInput {
  customerId: string;
  customerName: string;
  lines: { productId: string; qty: number; variant?: string }[];
  address: Omit<Address, 'id' | 'label'>;
  payment: PaymentMethod;
  deliveryMethod: 'standard' | 'express';
  deliveryFee: number;
  discount: number;
  coupon?: string;
}

const seed = () => ({
  products: seedProducts,
  sellers: seedSellers,
  orders: seedOrders,
  reviews: seedReviews,
  coupons: seedCoupons,
  promotions: seedPromotions,
  notifications: seedNotifications,
  tickets: seedTickets,
  returns: seedReturns,
  commissions: seedCommissions,
  categories: seedCategories,
  banners: seedBanners,
  customers: seedCustomers,
  conversations: seedConversations,
  sellerInbox: sellerConversations,
  addresses: defaultAddresses,
  sellerNotifications: [] as Notification[],
  adminNotifications: [] as Notification[],
  orderSeq: 1043,
});
type Data = ReturnType<typeof seed>;

interface Actions {
  placeOrder: (input: PlaceOrderInput) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  setProductStatus: (id: string, status: ProductStatus) => void;
  deleteProduct: (id: string) => void;
  setSellerStatus: (id: string, status: SellerStatus) => void;
  updateSeller: (id: string, patch: Partial<Seller>) => void;
  addReview: (r: Review) => void;
  setReviewStatus: (id: string, status: Review['status']) => void;
  deleteReview: (id: string) => void;
  replyReview: (id: string, reply: string) => void;
  markHelpful: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  upsertPromotion: (p: Promotion) => void;
  markNotification: (id: string) => void;
  markAllNotifications: () => void;
  setTicketStatus: (id: string, status: SupportTicket['status'], agent?: string) => void;
  setReturnStatus: (id: string, status: ReturnRequest['status']) => void;
  upsertCommission: (c: CommissionRule) => void;
  deleteCommission: (id: string) => void;
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, dir: -1 | 1) => void;
  upsertBanner: (b: Banner) => void;
  setCustomerStatus: (id: string, status: Customer['status']) => void;
  sendMessage: (box: 'customer' | 'seller', convId: string, text: string) => void;
  readConversation: (box: 'customer' | 'seller', convId: string) => void;
  upsertAddress: (a: Address) => void;
  deleteAddress: (id: string) => void;
  resetDemo: () => void;
}

const now = () => new Date().toISOString();
const notif = (type: Notification['type'], title: string, body: string, link?: string): Notification => ({ id: `N${Date.now()}${Math.floor(Math.random() * 999)}`, type, title, body, link, date: now(), read: false });

export const useMarket = create<Data & Actions>()(persist((set, get) => ({
  ...seed(),

  placeOrder: (input) => {
    const s = get();
    const created = new Date();
    const id = `BBZ-${ymd(created)}-${String(s.orderSeq).padStart(4, '0')}`;
    const items = input.lines.map((l) => {
      const p = s.products.find((x) => x.id === l.productId)!;
      const it = toOrderItem(p, l.qty, l.variant);
      it.sellerName = s.sellers.find((x) => x.id === p.sellerId)?.name ?? it.sellerName;
      return it;
    });
    const subtotal = items.reduce((n, it) => n + it.price * it.qty, 0);
    const [a, b] = deliveryDays(input.address.city);
    const express = input.deliveryMethod === 'express';
    const order: Order = {
      id, customerId: input.customerId, customerName: input.customerName, customerPhone: input.address.phone,
      items, address: input.address, payment: input.payment,
      paymentStatus: input.payment === 'cod' ? 'pending' : 'paid',
      status: 'pending', createdAt: created.toISOString(),
      subtotal, deliveryFee: input.deliveryFee, discount: input.discount, total: subtotal + input.deliveryFee - input.discount,
      deliveryMethod: input.deliveryMethod, courier: express ? 'B-Bazar Express' : COURIERS[s.orderSeq % 4],
      tracking: `BBX${Math.floor(100000000 + Math.random() * 899999999)}`,
      eta: deliveryWindow(created, express ? Math.max(1, a - 1) : a, express ? Math.max(1, b - 1) : b),
      timeline: buildTimeline('pending', created.toISOString()), coupon: input.coupon,
    };
    const qtyBy = Object.fromEntries(input.lines.map((l) => [l.productId, l.qty]));
    set({
      orders: [order, ...s.orders],
      orderSeq: s.orderSeq + 1,
      products: s.products.map((p) => (qtyBy[p.id] ? { ...p, stock: Math.max(0, p.stock - qtyBy[p.id]), sold: p.sold + qtyBy[p.id] } : p)),
      coupons: input.coupon ? s.coupons.map((c) => (c.code === input.coupon ? { ...c, used: c.used + 1 } : c)) : s.coupons,
      notifications: [notif('order', 'Order placed successfully', `Your order ${id} has been placed. We'll notify you when the seller confirms it.`, `/orders/${id}`), ...s.notifications],
      sellerNotifications: [notif('order', 'New order received', `${input.customerName} placed ${id} (${items.length} item${items.length > 1 ? 's' : ''}).`, '/seller/orders'), ...s.sellerNotifications],
      adminNotifications: [notif('order', 'New marketplace order', `${id} · ${input.address.city}`, '/admin/orders'), ...s.adminNotifications],
    });
    return order;
  },

  updateOrderStatus: (id, status) => set((s) => ({
    orders: s.orders.map((o) => {
      if (o.id !== id) return o;
      const label = status.replace(/_/g, ' ');
      return {
        ...o, status,
        paymentStatus: status === 'delivered' ? 'paid' : status === 'refunded' ? 'refunded' : o.paymentStatus,
        timeline: [...o.timeline.filter((t) => t.status !== status), { status, at: now(), note: `Status updated to ${label}` }],
      };
    }),
    notifications: [notif('order', `Order ${status.replace(/_/g, ' ')}`, `Order ${id} is now ${status.replace(/_/g, ' ')}.`, `/orders/${id}`), ...s.notifications],
  })),

  addProduct: (p) => set((s) => ({
    products: [p, ...s.products],
    adminNotifications: p.status === 'pending' ? [notif('system', 'Product awaiting approval', `${p.title} was submitted for review.`, '/admin/products'), ...s.adminNotifications] : s.adminNotifications,
  })),
  updateProduct: (id, patch) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  setProductStatus: (id, status) => set((s) => {
    const p = s.products.find((x) => x.id === id);
    return {
      products: s.products.map((x) => (x.id === id ? { ...x, status } : x)),
      sellerNotifications: p ? [notif('system', `Product ${status}`, `${p.title} was ${status} by B-Bazar moderation.`, '/seller/products'), ...s.sellerNotifications] : s.sellerNotifications,
    };
  }),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  setSellerStatus: (id, status) => set((s) => ({ sellers: s.sellers.map((x) => (x.id === id ? { ...x, status, verified: status === 'approved' ? true : x.verified, rating: x.rating || (status === 'approved' ? 5 : 0), positive: x.positive || (status === 'approved' ? 100 : 0) } : x)) })),
  updateSeller: (id, patch) => set((s) => ({ sellers: s.sellers.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  addReview: (r) => set((s) => ({
    reviews: [r, ...s.reviews],
    products: s.products.map((p) => (p.id === r.productId ? { ...p, reviewCount: p.reviewCount + 1, rating: Number(((p.rating * p.reviewCount + r.rating) / (p.reviewCount + 1)).toFixed(1)) } : p)),
  })),
  setReviewStatus: (id, status) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
  deleteReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
  replyReview: (id, reply) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, sellerReply: reply } : r)) })),
  markHelpful: (id) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)) })),
  upsertCoupon: (c) => set((s) => ({ coupons: s.coupons.some((x) => x.id === c.id) ? s.coupons.map((x) => (x.id === c.id ? c : x)) : [c, ...s.coupons] })),
  deleteCoupon: (id) => set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
  upsertPromotion: (p) => set((s) => ({ promotions: s.promotions.some((x) => x.id === p.id) ? s.promotions.map((x) => (x.id === p.id ? p : x)) : [p, ...s.promotions] })),
  markNotification: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })), sellerNotifications: s.sellerNotifications.map((n) => ({ ...n, read: true })), adminNotifications: s.adminNotifications.map((n) => ({ ...n, read: true })) })),
  setTicketStatus: (id, status, agent) => set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status, agent: agent ?? t.agent } : t)) })),
  setReturnStatus: (id, status) => set((s) => ({ returns: s.returns.map((r) => (r.id === id ? { ...r, status } : r)) })),
  upsertCommission: (c) => set((s) => ({ commissions: s.commissions.some((x) => x.id === c.id) ? s.commissions.map((x) => (x.id === c.id ? c : x)) : [c, ...s.commissions] })),
  deleteCommission: (id) => set((s) => ({ commissions: s.commissions.filter((c) => c.id !== id) })),
  upsertCategory: (c) => set((s) => ({ categories: s.categories.some((x) => x.id === c.id) ? s.categories.map((x) => (x.id === c.id ? c : x)) : [...s.categories, c] })),
  deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
  moveCategory: (id, dir) => set((s) => {
    const list = [...s.categories].sort((a, b) => a.order - b.order);
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return {};
    [list[i], list[j]] = [list[j], list[i]];
    return { categories: list.map((c, k) => ({ ...c, order: k + 1 })) };
  }),
  upsertBanner: (b) => set((s) => ({ banners: s.banners.some((x) => x.id === b.id) ? s.banners.map((x) => (x.id === b.id ? b : x)) : [...s.banners, b] })),
  setCustomerStatus: (id, status) => set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, status } : c)) })),
  sendMessage: (box, convId, text) => set((s) => {
    const key = box === 'customer' ? 'conversations' : 'sellerInbox';
    const msg = { id: `m${Date.now()}`, from: 'me' as const, text, at: now() };
    return { [key]: s[key].map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)) } as Partial<Data>;
  }),
  readConversation: (box, convId) => set((s) => {
    const key = box === 'customer' ? 'conversations' : 'sellerInbox';
    return { [key]: s[key].map((c) => (c.id === convId ? { ...c, unread: 0 } : c)) } as Partial<Data>;
  }),
  upsertAddress: (a) => set((s) => {
    let list = s.addresses.some((x) => x.id === a.id) ? s.addresses.map((x) => (x.id === a.id ? a : x)) : [...s.addresses, a];
    if (a.isDefault) list = list.map((x) => ({ ...x, isDefault: x.id === a.id }));
    return { addresses: list };
  }),
  deleteAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
  resetDemo: () => set(seed()),
}), { name: 'bbazar-market-v1', storage: safeStorage, version: 1 }));

// ---- derived helpers (pure) ----
export const isLive = (p: Product, sellers: Seller[]) => p.status === 'approved' && sellers.find((s) => s.id === p.sellerId)?.status === 'approved';
