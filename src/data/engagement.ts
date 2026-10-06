import type { Notification, SupportTicket, ReturnRequest, Conversation } from '@/types';
import { makeRng } from '@/utils/random';
import { seedOrders, NOW } from './orders';

const rng = makeRng(909);
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3.6e6).toISOString();

const N_TEMPLATES: [Notification['type'], string, string, string?][] = [
  ['order', 'Your order has been shipped', 'Order BBZ-20260928-1037 is on its way with TCS. Track it anytime.', '/orders'],
  ['promotion', 'Wishlist price drop', 'Your wishlist item Smart Watch Series 8 is now 20% off.', '/wishlist'],
  ['order', 'Order confirmed', 'TechZone PK confirmed order BBZ-20261005-1042.', '/orders/BBZ-20261005-1042'],
  ['promotion', 'Flash Sale is live ⚡', 'Up to 50% off on top brands — ends tonight at midnight.', '/shop?tag=flash'],
  ['system', 'Password changed', 'Your account password was updated. If this wasn’t you, contact support.', '/account/profile'],
  ['order', 'Out for delivery', 'Your rider is on the way. Keep Rs. 0 ready — this order is prepaid.', '/orders'],
  ['promotion', 'Coupon unlocked', 'Use BAZAR10 for 10% off orders above Rs. 1,500.', '/shop'],
  ['order', 'Delivered', 'Your order was delivered. Rate your purchase to help other shoppers.', '/orders'],
  ['system', 'New login on Chrome, Windows', 'We noticed a sign-in from Lahore, Pakistan.', '/account/profile'],
  ['promotion', 'Tech Week starts now', 'Phones, laptops and audio up to 35% off with TECHWEEK15.', '/category/electronics'],
];
export const seedNotifications: Notification[] = Array.from({ length: 50 }, (_, i) => {
  const [type, title, body, link] = N_TEMPLATES[i % N_TEMPLATES.length];
  return { id: `N${5001 + i}`, type, title, body, link, date: hoursAgo(i * 7 + rng.int(0, 5)), read: i > 5 };
});

const SUBJECTS = ['Order not received yet', 'Wrong size delivered', 'Refund not credited', 'Payment deducted twice', 'Unable to apply coupon', 'Damaged product received', 'Seller not responding', 'Change delivery address', 'Product warranty claim', 'Account verification issue', 'COD order cancellation', 'Missing item in package'];
const AGENTS = ['Sana (L1)', 'Usman (L1)', 'Mariam (L2)', 'Adeel (L2)', 'Unassigned'];
export const seedTickets: SupportTicket[] = Array.from({ length: 22 }, (_, i) => {
  const o = seedOrders[(i * 3) % seedOrders.length];
  return {
    id: `TK-${8100 + i}`,
    customer: o.customerName,
    seller: o.items[0].sellerName,
    subject: SUBJECTS[i % SUBJECTS.length],
    priority: (['low', 'medium', 'high', 'urgent', 'medium', 'high'] as const)[i % 6],
    status: (['open', 'pending', 'resolved', 'escalated', 'open', 'resolved', 'pending'] as const)[i % 7],
    agent: AGENTS[i % AGENTS.length],
    created: hoursAgo(i * 9 + 2),
    channel: (['chat', 'email', 'phone'] as const)[i % 3],
    orderId: o.id,
  };
});

const REASONS = ['Size does not fit', 'Item damaged in transit', 'Wrong item received', 'Not as described', 'Changed my mind', 'Defective product'];
export const seedReturns: ReturnRequest[] = seedOrders.filter((o) => o.status === 'delivered' || o.status === 'refunded').slice(0, 16).map((o, i) => ({
  id: `RT-${6200 + i}`,
  orderId: o.id,
  customer: o.customerName,
  sellerId: o.items[0].sellerId,
  product: o.items[0].title,
  reason: REASONS[i % REASONS.length],
  amount: o.items[0].price * o.items[0].qty,
  status: o.status === 'refunded' ? 'completed' : (['requested', 'refund_pending', 'approved', 'rejected', 'requested'] as const)[i % 5],
  date: hoursAgo(i * 20 + 5),
}));

const m = (from: 'me' | 'them', text: string, h: number) => ({ id: `${from}-${h}-${text.length}`, from, text, at: hoursAgo(h) });
export const seedConversations: Conversation[] = [
  { id: 'CV1', with: 'TechZone PK', kind: 'seller', avatarColor: '#4338CA', online: true, unread: 1, productId: 'P10001', messages: [
    m('me', 'Assalam o Alaikum, do the Earbuds Pro X support wireless charging?', 26), m('them', 'Walaikum Assalam! Yes, the case supports Qi wireless charging.', 25.5),
    m('me', 'Great. Can you deliver to Gulshan by Wednesday?', 4), m('them', 'Your order BBZ-20261005-1042 is confirmed and will be dispatched today. Karachi delivery takes 1–2 days 🙂', 3.8) ] },
  { id: 'CV2', with: 'B-Bazar Support', kind: 'support', avatarColor: '#312E81', online: true, unread: 0, messages: [
    m('them', 'Hi Ahmed, this is Sana from B-Bazar Support. How can I help?', 72), m('me', 'My refund for order BBZ-20260918-1259 has not arrived.', 71.9),
    m('them', 'I have escalated it to finance. Refunds to JazzCash take 2–3 working days.', 71.5), m('me', 'Thank you!', 71.4) ] },
  { id: 'CV3', with: 'Glow & Care', kind: 'seller', avatarColor: '#E11D48', online: false, unread: 0, productId: 'P10037', messages: [
    m('me', 'Is the Vitamin C serum suitable for oily skin?', 120), m('them', 'Yes, it is a lightweight water-based formula. Use it with SPF in the morning.', 118) ] },
  { id: 'CV4', with: 'Urban Cart', kind: 'seller', avatarColor: '#DB2777', online: false, unread: 0, messages: [
    m('me', 'Do you have the cotton shirt in XXL?', 200), m('them', 'XXL will be restocked next week. Tap “Notify me” on the product page.', 198) ] },
];

// Seller inbox (TechZone PK talking to customers)
export const sellerConversations: Conversation[] = [
  { id: 'SC1', with: 'Ahmed Khan', kind: 'customer', avatarColor: '#0891B2', online: true, unread: 0, messages: [...seedConversations[0].messages.map((x) => ({ ...x, from: (x.from === 'me' ? 'them' : 'me') as 'me' | 'them' }))] },
  { id: 'SC2', with: 'Ayesha Siddiqui', kind: 'customer', avatarColor: '#DB2777', online: false, unread: 2, messages: [m('them', 'Is the Smart Watch Series 8 compatible with iPhone?', 6), m('them', 'Also, do you offer installments?', 5.9)] },
  { id: 'SC3', with: 'Hamza Ahmed', kind: 'customer', avatarColor: '#059669', online: true, unread: 1, messages: [m('them', 'My power bank stopped charging after a week. What should I do?', 2)] },
  { id: 'SC4', with: 'B-Bazar Seller Support', kind: 'support', avatarColor: '#312E81', online: true, unread: 0, messages: [m('them', 'Your payout of Rs. 184,320 has been processed to Meezan Bank.', 30), m('me', 'Received, thanks!', 29)] },
];
