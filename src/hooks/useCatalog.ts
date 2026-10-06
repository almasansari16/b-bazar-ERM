import { useMemo } from 'react';
import { useMarket } from '@/store/useMarket';
import type { Product, Seller } from '@/types';

/** Products visible to shoppers: approved product from an approved seller. */
export function useLiveProducts(): Product[] {
  const products = useMarket((s) => s.products);
  const sellers = useMarket((s) => s.sellers);
  return useMemo(() => {
    const ok = new Set(sellers.filter((s) => s.status === 'approved').map((s) => s.id));
    return products.filter((p) => p.status === 'approved' && ok.has(p.sellerId));
  }, [products, sellers]);
}
export function useSellerMap(): Record<string, Seller> {
  const sellers = useMarket((s) => s.sellers);
  return useMemo(() => Object.fromEntries(sellers.map((s) => [s.id, s])), [sellers]);
}
export function useCategoryMap() {
  const categories = useMarket((s) => s.categories);
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c])), [categories]);
}
export function useProductMap(): Record<string, Product> {
  const products = useMarket((s) => s.products);
  return useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
}
