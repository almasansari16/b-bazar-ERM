import type { Coupon, Promotion, Banner, CommissionRule } from '@/types';
import { unsplash } from './images';

const cp = (id: number, code: string, type: Coupon['type'], value: number, minOrder: number, maxDiscount: number | undefined, start: string, end: string,
  usageLimit: number, used: number, status: Coupon['status'], description: string, categories: string[] = [], sellers: string[] = []): Coupon =>
  ({ id: `CP${100 + id}`, code, type, value, minOrder, maxDiscount, start, end, usageLimit, used, status, description, categories, sellers });

export const seedCoupons: Coupon[] = [
  cp(1, 'BAZAR10', 'percentage', 10, 1500, 1000, '2026-09-01', '2026-12-31', 10000, 4821, 'active', '10% off on orders above Rs. 1,500'),
  cp(2, 'WELCOME500', 'fixed', 500, 2500, undefined, '2026-01-01', '2026-12-31', 50000, 18240, 'active', 'Rs. 500 off your first order'),
  cp(3, 'FREESHIP', 'free_shipping', 0, 999, undefined, '2026-10-01', '2026-10-31', 20000, 3120, 'active', 'Free delivery on any order above Rs. 999'),
  cp(4, 'TECHWEEK15', 'percentage', 15, 5000, 3000, '2026-10-01', '2026-10-12', 5000, 1288, 'active', '15% off electronics during Tech Week', ['electronics', 'mobiles-tablets', 'computers-laptops']),
  cp(5, 'GLOW20', 'percentage', 20, 2000, 800, '2026-10-01', '2026-10-20', 3000, 744, 'active', '20% off beauty essentials', ['beauty']),
  cp(6, 'FASHION300', 'fixed', 300, 3000, undefined, '2026-10-05', '2026-10-25', 4000, 210, 'active', 'Rs. 300 off fashion orders', ['fashion']),
  cp(7, 'JAZZ250', 'fixed', 250, 2000, undefined, '2026-09-15', '2026-10-15', 6000, 2950, 'active', 'Rs. 250 off when paying via JazzCash'),
  cp(8, 'EASY200', 'fixed', 200, 1500, undefined, '2026-09-15', '2026-10-15', 6000, 2410, 'active', 'Rs. 200 off with Easypaisa'),
  cp(9, 'HOME12', 'percentage', 12, 4000, 2500, '2026-10-01', '2026-10-31', 2500, 388, 'active', '12% off home makeover', ['home-living']),
  cp(10, 'TECHZONE5', 'percentage', 5, 3000, 1500, '2026-09-20', '2026-11-20', 2000, 512, 'active', '5% off at TechZone PK', [], ['S1001']),
  cp(11, 'GROCERY7', 'percentage', 7, 2500, 600, '2026-10-01', '2026-10-31', 8000, 1960, 'active', '7% off grocery essentials', ['grocery']),
  cp(12, 'ELEVEN11', 'percentage', 25, 3000, 5000, '2026-11-11', '2026-11-12', 11000, 0, 'scheduled', '11.11 mega sale coupon'),
  cp(13, 'BLACKFRIDAY', 'percentage', 30, 5000, 7500, '2026-11-27', '2026-11-30', 15000, 0, 'scheduled', 'White Friday super saver'),
  cp(14, 'AZADI14', 'fixed', 1400, 7000, undefined, '2026-08-10', '2026-08-15', 14000, 13870, 'expired', 'Independence Day special'),
  cp(15, 'RAMADAN', 'percentage', 12, 2000, 1200, '2026-02-18', '2026-03-19', 20000, 17420, 'expired', 'Ramadan Kareem offer'),
  cp(16, 'EIDMUBARAK', 'percentage', 15, 3000, 2000, '2026-03-18', '2026-03-25', 15000, 14900, 'expired', 'Eid ul Fitr savings'),
  cp(17, 'BOOKWORM', 'percentage', 10, 1000, 500, '2026-09-01', '2026-12-31', 3000, 640, 'active', '10% off books', ['books-stationery']),
  cp(18, 'FITNOW', 'fixed', 400, 4000, undefined, '2026-10-01', '2026-11-30', 2500, 280, 'active', 'Rs. 400 off sports & fitness', ['sports-fitness']),
  cp(19, 'APPONLY', 'fixed', 350, 2000, undefined, '2026-07-01', '2026-12-31', 10000, 5120, 'disabled', 'App-only coupon (paused)'),
  cp(20, 'PETLOVE', 'percentage', 8, 1500, 400, '2026-10-01', '2026-12-31', 1500, 96, 'active', '8% off pet supplies', ['pet-supplies']),
];

const pr = (id: number, name: string, type: Promotion['type'], sellerId: string, products: number, start: string, end: string, usage: number, revenue: number, status: Promotion['status'], discount: string): Promotion =>
  ({ id: `PR${200 + id}`, name, type, sellerId, products, start, end, usage, revenue, status, discount });

export const seedPromotions: Promotion[] = [
  pr(1, 'Big B-Bazar Sale', 'flash_sale', 'platform', 1240, '2026-10-03', '2026-10-09', 18420, 6840000, 'active', 'Up to 50%'),
  pr(2, 'Tech Week', 'discount', 'platform', 386, '2026-10-01', '2026-10-12', 6210, 3920000, 'active', 'Up to 35%'),
  pr(3, 'Earbuds Flash Deal', 'flash_sale', 'S1001', 3, '2026-10-05', '2026-10-06', 412, 2059000, 'active', '38% off'),
  pr(4, 'TechZone Free Shipping', 'free_shipping', 'S1001', 48, '2026-09-25', '2026-10-25', 1280, 1740000, 'active', 'Free delivery'),
  pr(5, 'Gadget Bundle: Charger + Power Bank', 'bundle', 'S1001', 2, '2026-09-15', '2026-10-15', 236, 1415000, 'active', 'Save Rs. 1,000'),
  pr(6, 'TECHZONE5 Coupon', 'coupon', 'S1001', 120, '2026-09-20', '2026-11-20', 512, 980000, 'active', '5% off'),
  pr(7, 'Back to School', 'discount', 'S1001', 22, '2026-08-01', '2026-08-31', 890, 1210000, 'ended', '15% off'),
  pr(8, '11.11 Mega Sale', 'flash_sale', 'platform', 0, '2026-11-11', '2026-11-12', 0, 0, 'scheduled', 'Up to 70%'),
  pr(9, 'Fashion Festival', 'discount', 'platform', 940, '2026-10-05', '2026-10-25', 2140, 1680000, 'active', 'Flat 30%'),
  pr(10, 'Home Makeover', 'discount', 'platform', 410, '2026-10-01', '2026-10-31', 980, 1120000, 'active', 'Up to 40%'),
  pr(11, 'Beauty Essentials', 'coupon', 'platform', 260, '2026-10-01', '2026-10-20', 744, 510000, 'active', '20% off'),
  pr(12, 'White Friday', 'flash_sale', 'platform', 0, '2026-11-27', '2026-11-30', 0, 0, 'scheduled', 'Up to 80%'),
  pr(13, 'Smart Watch Launch', 'discount', 'S1001', 1, '2026-10-10', '2026-10-20', 0, 0, 'scheduled', '25% off'),
  pr(14, 'Weekend Audio Deals', 'discount', 'S1001', 6, '2026-09-05', '2026-09-07', 340, 620000, 'ended', '20% off'),
  pr(15, 'Azadi Sale', 'flash_sale', 'platform', 1800, '2026-08-10', '2026-08-15', 22100, 8420000, 'ended', 'Up to 60%'),
  pr(16, 'Grocery Saver Week', 'free_shipping', 'platform', 520, '2026-09-20', '2026-09-27', 3100, 1460000, 'paused', 'Free delivery'),
];

export const seedBanners: Banner[] = [
  { id: 'B1', placement: 'hero', eyebrow: 'Big B-Bazar Sale · 3–9 Oct', title: 'Up to 50% Off Everything You Love', subtitle: 'Gadgets, fashion and home essentials from 1,200+ verified sellers. Cash on delivery nationwide.', cta: 'Shop the Sale', link: '/shop?sort=discount', image: unsplash('1607082348824-0a96f2a4b9da', 1200), theme: 'indigo', active: true },
  { id: 'B2', placement: 'hero', eyebrow: 'New Arrivals', title: 'Upgrade Your Everyday', subtitle: 'Discover smart gadgets, fashion and home essentials.', cta: 'Shop Now', link: '/shop?tag=new', image: unsplash('1505740420928-5e560c06d30e', 1200), theme: 'violet', active: true },
  { id: 'B3', placement: 'hero', eyebrow: 'Free Delivery', title: 'Free Delivery on Selected Products', subtitle: 'No minimum on thousands of items. Karachi orders arrive in 1–2 days.', cta: 'Explore Deals', link: '/shop?delivery=free', image: unsplash('1586880244406-556ebe35f282', 1200), theme: 'teal', active: true },
  { id: 'B4', placement: 'promo', title: 'Tech Week', subtitle: 'Phones, laptops & audio up to 35% off', cta: 'Shop Tech', link: '/category/electronics', image: unsplash('1498049794561-7780e7231661', 800), theme: 'indigo', active: true },
  { id: 'B5', placement: 'promo', title: 'Fashion Festival', subtitle: 'Lawn, kurtas and sneakers — flat 30%', cta: 'Shop Fashion', link: '/category/fashion', image: unsplash('1445205170230-053b83016050', 800), theme: 'violet', active: true },
  { id: 'B6', placement: 'promo', title: 'Home Makeover', subtitle: 'Refresh every room for less', cta: 'Shop Home', link: '/category/home-living', image: unsplash('1555041469-a586c61ea9bc', 800), theme: 'amber', active: true },
  { id: 'B7', placement: 'promo', title: 'Beauty Essentials', subtitle: 'Skincare picks with code GLOW20', cta: 'Shop Beauty', link: '/category/beauty', image: unsplash('1596462502278-27bfdc403348', 800), theme: 'teal', active: true },
];

export const seedCommissions: CommissionRule[] = [
  { id: 'CM1', category: 'electronics', seller: 'all', rate: 8, effective: '2026-01-01', status: 'active' },
  { id: 'CM2', category: 'mobiles-tablets', seller: 'all', rate: 5, effective: '2026-01-01', status: 'active' },
  { id: 'CM3', category: 'computers-laptops', seller: 'all', rate: 6, effective: '2026-01-01', status: 'active' },
  { id: 'CM4', category: 'fashion', seller: 'all', rate: 10, effective: '2026-01-01', status: 'active' },
  { id: 'CM5', category: 'beauty', seller: 'all', rate: 12, effective: '2026-01-01', status: 'active' },
  { id: 'CM6', category: 'grocery', seller: 'all', rate: 6, effective: '2026-01-01', status: 'active' },
  { id: 'CM7', category: 'home-living', seller: 'all', rate: 9, effective: '2026-01-01', status: 'active' },
  { id: 'CM8', category: 'sports-fitness', seller: 'all', rate: 9, effective: '2026-01-01', status: 'active' },
  { id: 'CM9', category: 'appliances', seller: 'all', rate: 7, effective: '2026-01-01', status: 'active' },
  { id: 'CM10', category: 'electronics', seller: 'S1001', rate: 7, effective: '2026-07-01', status: 'active' },
  { id: 'CM11', category: 'jewelry-accessories', seller: 'all', rate: 11, effective: '2026-01-01', status: 'active' },
  { id: 'CM12', category: 'fashion', seller: 'all', rate: 11, effective: '2026-11-01', status: 'scheduled' },
];
/** Default commission when no rule matches */
export const DEFAULT_COMMISSION = 8;
