// ---------- Core domain types (mirror future REST API DTOs) ----------
export type Role = 'customer' | 'seller' | 'admin';
export type PaymentMethod = 'cod' | 'card' | 'bank' | 'jazzcash' | 'easypaisa';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
export type ProductStatus = 'approved' | 'pending' | 'rejected' | 'suspended' | 'draft';
export type SellerStatus = 'approved' | 'pending' | 'suspended' | 'rejected';

export interface SubCategory { slug: string; name: string }
export interface Category {
  id: string;
  slug: string;
  name: string;
  short: string;
  icon: string; // lucide icon name
  description: string;
  color: string; // tint hex
  image: string;
  subcategories: SubCategory[];
  enabled: boolean;
  order: number;
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  category: string; // primary category slug
  rating: number;
  positive: number; // % positive ratings
  followers: number;
  responseRate: number;
  joined: string;
  status: SellerStatus;
  verified: boolean;
  official?: boolean;
  description: string;
  color: string;
  tagline: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string; // category slug
  subcategory: string;
  sellerId: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  images: string[];
  icon: string; // illustration fallback icon
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  storage?: string[];
  tags: ('flash' | 'new' | 'bestseller' | 'trending' | 'top')[];
  freeDelivery: boolean;
  warranty: string;
  returnPolicy: string;
  sku: string;
  status: ProductStatus;
  createdAt: string;
  submittedAt?: string;
  installments?: boolean;
  weightKg?: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line: string;
  city: string;
  province: string;
  postal: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joined: string;
  status: 'active' | 'blocked';
  wallet: number;
  rewardPoints: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  icon: string;
  sellerId: string;
  sellerName: string;
  price: number;
  qty: number;
  variant?: string;
  category: string;
}

export interface TimelineEvent { status: OrderStatus; at: string; note: string }

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  address: Omit<Address, 'id' | 'label'>;
  payment: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryMethod: 'standard' | 'express';
  courier: string;
  tracking: string;
  eta: string;
  timeline: TimelineEvent[];
  coupon?: string;
}

export interface Review {
  id: string;
  productId: string;
  sellerId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  photos: string[];
  status: 'published' | 'hidden' | 'flagged' | 'pending';
  sellerReply?: string;
  variant?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  start: string;
  end: string;
  usageLimit: number;
  used: number;
  categories: string[]; // empty = all
  sellers: string[];
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  description: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'coupon' | 'flash_sale' | 'bundle' | 'free_shipping';
  sellerId: string; // 'platform' for marketplace campaigns
  products: number;
  start: string;
  end: string;
  usage: number;
  revenue: number;
  status: 'active' | 'scheduled' | 'ended' | 'paused';
  discount: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system';
  title: string;
  body: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface SupportTicket {
  id: string;
  customer: string;
  seller?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'escalated';
  agent: string;
  created: string;
  channel: 'chat' | 'email' | 'phone';
  orderId?: string;
}

export interface CommissionRule {
  id: string;
  category: string;
  seller: string; // 'all' or seller id
  rate: number;
  effective: string;
  status: 'active' | 'scheduled' | 'inactive';
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  sellerId: string;
  product: string;
  reason: string;
  amount: number;
  status: 'requested' | 'refund_pending' | 'approved' | 'rejected' | 'completed';
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  theme: 'indigo' | 'violet' | 'teal' | 'amber';
  placement: 'hero' | 'promo';
  active: boolean;
  eyebrow?: string;
}

export interface ChatMessage { id: string; from: 'me' | 'them'; text: string; at: string }
export interface Conversation {
  id: string;
  with: string;
  kind: 'seller' | 'support' | 'customer';
  avatarColor: string;
  online: boolean;
  messages: ChatMessage[];
  unread: number;
  productId?: string;
}

export interface Payout {
  id: string;
  orderId: string;
  amount: number;
  fee: number;
  net: number;
  date: string;
  status: 'paid' | 'pending' | 'processing' | 'on_hold';
}

export interface DailyStat { date: string; gmv: number; orders: number; newCustomers: number; newSellers: number; visitors: number }

export interface User { id: string; name: string; email: string; role: Role; sellerId?: string; phone?: string }
