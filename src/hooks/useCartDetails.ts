import { useMemo } from 'react';
import { useCart } from '@/store/useCart';
import { useMarket } from '@/store/useMarket';
import { useProductMap, useSellerMap } from './useCatalog';
import { computeTotals } from '@/utils/pricing';

export function useCartDetails(method: 'standard' | 'express' = 'standard') {
  const lines = useCart((s) => s.lines);
  const code = useCart((s) => s.coupon);
  const coupons = useMarket((s) => s.coupons);
  const products = useProductMap();
  const sellers = useSellerMap();
  return useMemo(() => {
    const detailed = lines.filter((l) => products[l.productId]).map((l) => ({ ...l, product: products[l.productId], seller: sellers[products[l.productId].sellerId] }));
    const coupon = code ? coupons.find((c) => c.code === code) : undefined;
    const totals = computeTotals(detailed, coupon, method);
    const groups = Object.values(detailed.reduce<Record<string, typeof detailed>>((m, l) => { (m[l.product.sellerId] ??= []).push(l); return m; }, {}));
    return { lines: detailed, groups, coupon, totals };
  }, [lines, code, coupons, products, sellers, method]);
}
