import { useMemo } from 'react';
import { useMarket } from '@/store/useMarket';
import { history, CATEGORY_SHARE } from '@/data/history';
import { lifetimeMarketplace, commissionRate } from '@/utils/analytics';

/** Marketplace-wide KPIs derived from history + live orders + live entities. */
export function useAdminStats() {
  const orders = useMarket((s) => s.orders);
  const sellers = useMarket((s) => s.sellers);
  const products = useMarket((s) => s.products);
  const returns = useMarket((s) => s.returns);
  const customers = useMarket((s) => s.customers);
  const rules = useMarket((s) => s.commissions);
  return useMemo(() => {
    const { gmv, orders: orderCount } = lifetimeMarketplace(orders);
    const blended = Object.entries(CATEGORY_SHARE).reduce((n, [cat, w]) => n + w * commissionRate(rules, cat, 'all'), 0) / 100;
    const deliveryRevenue = history.reduce((n, h) => n + h.orders, 0) * 199 * 0.35;
    const adsRevenue = gmv * 0.012;
    return {
      gmv,
      orders: orderCount,
      customers: history.reduce((n, h) => n + h.newCustomers, 0) + customers.length,
      activeSellers: history.reduce((n, h) => n + h.newSellers, 0) + sellers.filter((s) => s.status === 'approved').length,
      pendingSellers: sellers.filter((s) => s.status === 'pending').length,
      pendingProducts: products.filter((p) => p.status === 'pending').length,
      refundRequests: returns.filter((r) => r.status === 'requested' || r.status === 'refund_pending').length,
      platformRevenue: Math.round(gmv * blended + deliveryRevenue + adsRevenue),
      blendedCommission: blended * 100,
    };
  }, [orders, sellers, products, returns, customers, rules]);
}
