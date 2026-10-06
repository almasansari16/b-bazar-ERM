import type { Coupon, Product } from '@/types';
import type { CartLine } from '@/store/useCart';
import { STANDARD_DELIVERY_FEE, EXPRESS_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from './delivery';

export interface Totals { items: number; subtotal: number; savings: number; delivery: number; discount: number; total: number; couponError?: string; freeDeliveryGap: number }

export function validateCoupon(c: Coupon | undefined, subtotal: number, lines: { product: Product }[]): string | undefined {
  if (!c) return 'This coupon code is not valid.';
  if (c.status === 'expired') return 'This coupon has expired.';
  if (c.status === 'scheduled') return 'This coupon is not active yet.';
  if (c.status === 'disabled') return 'This coupon is no longer available.';
  if (c.used >= c.usageLimit) return 'This coupon has reached its usage limit.';
  if (subtotal < c.minOrder) return `Add Rs. ${(c.minOrder - subtotal).toLocaleString()} more to use this coupon (minimum Rs. ${c.minOrder.toLocaleString()}).`;
  if (c.categories.length && !lines.some((l) => c.categories.includes(l.product.category))) return 'This coupon does not apply to items in your cart.';
  if (c.sellers.length && !lines.some((l) => c.sellers.includes(l.product.sellerId))) return 'This coupon is valid only for a specific store.';
  return undefined;
}

export function computeTotals(lines: (CartLine & { product: Product })[], coupon: Coupon | undefined, method: 'standard' | 'express' = 'standard'): Totals {
  const sel = lines.filter((l) => l.selected && l.product.stock > 0);
  const subtotal = sel.reduce((n, l) => n + l.product.price * l.qty, 0);
  const savings = sel.reduce((n, l) => n + (l.product.originalPrice - l.product.price) * l.qty, 0);
  const allFree = sel.length > 0 && sel.every((l) => l.product.freeDelivery);
  let delivery = sel.length === 0 ? 0 : method === 'express' ? EXPRESS_DELIVERY_FEE : subtotal >= FREE_DELIVERY_THRESHOLD || allFree ? 0 : STANDARD_DELIVERY_FEE;
  let discount = 0;
  let couponError: string | undefined;
  if (coupon) {
    couponError = validateCoupon(coupon, subtotal, sel);
    if (!couponError) {
      const eligible = sel.filter((l) => (!coupon.categories.length || coupon.categories.includes(l.product.category)) && (!coupon.sellers.length || coupon.sellers.includes(l.product.sellerId)))
        .reduce((n, l) => n + l.product.price * l.qty, 0);
      if (coupon.type === 'percentage') discount = Math.min(coupon.maxDiscount ?? Infinity, Math.round((eligible * coupon.value) / 100));
      else if (coupon.type === 'fixed') discount = Math.min(coupon.value, eligible);
      else delivery = 0;
    }
  }
  return { items: sel.reduce((n, l) => n + l.qty, 0), subtotal, savings, delivery, discount, total: Math.max(0, subtotal + delivery - discount), couponError, freeDeliveryGap: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal) };
}
