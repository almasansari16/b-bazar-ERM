import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingCart, Users, Store, UserCheck, PackageCheck, RotateCcw, Landmark, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useCategoryMap, useSellerMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services';
import { PageHeader, KpiCard, ChartCard, RangeFilter, CHART } from '@/components/dashboard';
import { RevenueChart, SimpleBars, Donut, MultiLine } from '@/components/dashboard/Charts';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartImage } from '@/components/common/SmartImage';
import { buildSeries, sumSeries, trend, categoryBreakdown, cityBreakdown, paymentBreakdown, topProducts, RANGE_DAYS, type RangeKey } from '@/utils/analytics';
import { formatPKRCompact, formatNumber, formatPKR, timeAgo } from '@/utils/format';

export default function AdminDashboard() {
  usePageMeta('Admin Dashboard');
  const s = useAdminStats();
  const orders = useMarket((st) => st.orders);
  const products = useMarket((st) => st.products);
  const sellersList = useMarket((st) => st.sellers);
  const cats = useCategoryMap();
  const sellers = useSellerMap();
  const loading = useSimulatedLoad('adash', 650);
  const [range, setRange] = useState<RangeKey>('30d');
  const days = RANGE_DAYS[range];
  const series = useMemo(() => buildSeries(orders, days), [orders, days]);
  const t = sumSeries(series);
  const catNames = Object.fromEntries(Object.values(cats).map((c) => [c.slug, c.short]));
  const catData = categoryBreakdown(orders, t.revenue, catNames).slice(0, 8);
  const cityData = cityBreakdown(orders, t.revenue).slice(0, 8);
  const payData = paymentBreakdown(orders, t.orders);
  const top = topProducts(products, orders, undefined, 6);
  const growth = series.map((p) => ({ label: p.label, customers: p.customers, sellers: p.sellers * 6 }));
  const pendingSellers = sellersList.filter((x) => x.status === 'pending');
  const pendingProducts = products.filter((p) => p.status === 'pending');

  return (
    <>
      <PageHeader eyebrow="Marketplace overview" title="B-Bazar Administration" subtitle="Monitor, approve and scale the marketplace" actions={<RangeFilter value={range} onChange={setRange} options={['today', '7d', '30d', '3m', '12m']} />} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard loading={loading} featured label="Gross Merchandise Value" value={formatPKRCompact(s.gmv)} icon={<Wallet className="h-5 w-5" />} delta={trend(orders, 30, 'revenue')} hint="Trailing 12 months" />
        <KpiCard loading={loading} label="Total Orders" value={formatNumber(s.orders)} icon={<ShoppingCart className="h-5 w-5" />} delta={trend(orders, 30, 'orders')} />
        <KpiCard loading={loading} label="Customers" value={formatNumber(s.customers)} icon={<Users className="h-5 w-5" />} tone="accent" delta={trend(orders, 30, 'customers')} />
        <KpiCard loading={loading} label="Active Sellers" value={formatNumber(s.activeSellers)} icon={<Store className="h-5 w-5" />} tone="violet" />
        <KpiCard loading={loading} label="Pending Seller Approvals" value={s.pendingSellers} icon={<UserCheck className="h-5 w-5" />} tone="warning" hint="KYC review queue" />
        <KpiCard loading={loading} label="Pending Product Approvals" value={s.pendingProducts} icon={<PackageCheck className="h-5 w-5" />} tone="warning" hint="Moderation queue" />
        <KpiCard loading={loading} label="Refund Requests" value={s.refundRequests} icon={<RotateCcw className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Platform Revenue" value={formatPKRCompact(s.platformRevenue)} icon={<Landmark className="h-5 w-5" />} tone="success" hint={`Commission ~${s.blendedCommission.toFixed(1)}% + fees`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <ChartCard loading={loading} className="xl:col-span-2" title="GMV Trend" subtitle={`${formatPKR(t.revenue)} in selected period · dashed line = previous period`} height={300}><RevenueChart data={series} compare /></ChartCard>
        <ChartCard loading={loading} title="Payment Method Distribution" subtitle="Share of orders" height={300}><Donut data={payData} center={{ label: 'orders', value: formatNumber(t.orders) }} /></ChartCard>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard loading={loading} title="Orders Trend" height={240}><RevenueChart data={series} metric="orders" color={CHART.cyan} /></ChartCard>
        <ChartCard loading={loading} title="Revenue (Platform)" subtitle="Commission + fees" height={240}><RevenueChart data={series.map((p) => ({ ...p, revenue: Math.round(p.revenue * (s.blendedCommission / 100 + 0.035)) }))} color={CHART.emerald} /></ChartCard>
        <ChartCard loading={loading} title="New Customers & Seller Growth" subtitle="Sellers scaled ×6 for readability" height={240}><MultiLine data={growth} lines={[{ key: 'customers', name: 'Customers', color: CHART.violet }, { key: 'sellers', name: 'Sellers (×6)', color: CHART.amber }]} /></ChartCard>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard loading={loading} title="Category Performance" subtitle="GMV by category" height={300}><SimpleBars data={catData} dataKey="value" nameKey="name" horizontal money colors={CHART.series} /></ChartCard>
        <ChartCard loading={loading} title="Sales by City" height={300}><SimpleBars data={cityData} dataKey="value" nameKey="city" money color={CHART.indigo} /></ChartCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Top Selling Products" action={<Link to="/admin/products" className="text-sm font-semibold text-brand-600 hover:underline">All</Link>} />
          <ul className="mt-3 divide-y divide-line">{top.map(({ product: p, units, revenue }) => <li key={p.id} className="flex items-center gap-3 px-5 py-2.5"><SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-9 w-9 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.title}</p><p className="text-xs text-ink-soft">{sellers[p.sellerId]?.name} · {formatNumber(units)} sold</p></div><span className="text-sm font-bold tabular-nums">{formatPKRCompact(revenue)}</span></li>)}</ul>
        </Card>
        <Card>
          <CardHeader title="Seller approvals" subtitle={`${pendingSellers.length} awaiting review`} action={<Link to="/admin/sellers" className="text-sm font-semibold text-brand-600 hover:underline">Queue</Link>} />
          <ul className="mt-3 divide-y divide-line">
            {pendingSellers.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-soft">Queue is clear 🎉</li>}
            {pendingSellers.map((x) => <li key={x.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={x.name} color={x.color} size="sm" square /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{x.name}</p><p className="text-xs text-ink-soft">{x.owner} · {x.city} · applied {timeAgo(x.joined)}</p></div>
              <Button size="icon-sm" variant="success" aria-label={`Approve ${x.name}`} onClick={async () => { await adminService.approveSeller(x.id); toast.success('Seller approved successfully.', { description: x.name }); }}><Check className="h-4 w-4" /></Button>
              <Button size="icon-sm" variant="outline" aria-label={`Reject ${x.name}`} onClick={() => { useMarket.getState().setSellerStatus(x.id, 'rejected'); toast('Seller rejected.'); }}><X className="h-4 w-4" /></Button></li>)}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Product moderation" subtitle={`${pendingProducts.length} listings pending`} action={<Link to="/admin/products" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Review<ArrowRight className="h-3.5 w-3.5" /></Link>} />
          <ul className="mt-3 divide-y divide-line">
            {pendingProducts.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-soft">No listings waiting.</li>}
            {pendingProducts.slice(0, 5).map((p) => <li key={p.id} className="flex items-center gap-3 px-5 py-3"><SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-9 w-9 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.title}</p><p className="text-xs text-ink-soft">{sellers[p.sellerId]?.name} · {formatPKR(p.price)}</p></div>
              <Button size="xs" variant="success" onClick={async () => { await adminService.approveProduct(p.id); toast.success('Product approved — now live in the marketplace.'); }}>Approve</Button></li>)}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Latest marketplace orders" action={<Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">All orders</Link>} />
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><tbody>
          {orders.slice(0, 6).map((o) => <tr key={o.id} className="border-t border-line"><td className="px-5 py-2.5 font-mono text-xs font-bold text-brand-700">{o.id}</td><td className="px-5 py-2.5">{o.customerName}</td><td className="px-5 py-2.5 text-ink-soft">{[...new Set(o.items.map((i) => i.sellerName))].join(', ')}</td><td className="px-5 py-2.5 text-ink-soft">{o.address.city}</td><td className="px-5 py-2.5 text-right font-semibold tabular-nums">{formatPKR(o.total)}</td><td className="px-5 py-2.5"><StatusBadge status={o.status} /></td></tr>)}
        </tbody></table></div>
      </Card>
    </>
  );
}
