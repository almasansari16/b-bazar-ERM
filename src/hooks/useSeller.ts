import { useMemo } from 'react';
import { useAuth } from '@/store/useAuth';
import { useMarket } from '@/store/useMarket';

export const DEFAULT_SELLER = 'S1001';
/** Current seller context: profile, own products and orders containing their items. */
export function useSeller() {
  const user = useAuth((s) => s.user);
  const sellerId = user?.sellerId ?? DEFAULT_SELLER;
  const sellers = useMarket((s) => s.sellers);
  const products = useMarket((s) => s.products);
  const orders = useMarket((s) => s.orders);
  return useMemo(() => {
    const seller = sellers.find((s) => s.id === sellerId)!;
    const myProducts = products.filter((p) => p.sellerId === sellerId);
    const myOrders = orders.filter((o) => o.items.some((i) => i.sellerId === sellerId)).map((o) => {
      const items = o.items.filter((i) => i.sellerId === sellerId);
      return { ...o, items, sellerTotal: items.reduce((n, i) => n + i.price * i.qty, 0) };
    });
    return { sellerId, seller, products: myProducts, orders: myOrders };
  }, [sellerId, sellers, products, orders]);
}
export type SellerOrder = ReturnType<typeof useSeller>['orders'][number];
