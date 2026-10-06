import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingCart, Package, Users, Clock, RotateCcw, Plus, ArrowRight, AlertTriangle, Star } from 'lucide-react';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard, ChartCard, RangeFilter, CHART } from '@/components/dashboard';
import { RevenueChart, SimpleBars } from '@/components/dashboard/Charts';
import { OrderDrawer } from '@/components/dashboard/OrderDrawer';
import { Card, CardHeader, Tabs } from '@/components/ui/Display';
import { LinkButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SmartImage } from '@/components/common/SmartImage';
import { buildSeries, lifetimeSeller, sumSeries, trend, topProducts, RANGE_DAYS, type RangeKey } from '@/utils/analytics';
import { formatPKR, formatNumber, formatShortDate, formatPKRCompact } from '@/utils/format';
import { PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import type { SellerOrder } from '@/hooks/useSeller';
import type { Order } from '@/types';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

export default function SellerDashboard() {
  const { seller, sellerId, products, orders } = useSeller();
  usePageMeta('Seller Dashboard');
  const allOrders = useMarket((s) => s.orders);
  const returns = useMarket((s) => s.returns).filter((r) => r.sellerId === sellerId);
  const loading = useSimulatedLoad('sdash', 600);
  const [range, setRange] = useState<RangeKey>('30d');
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'aov'>('revenue');
  const [drawer, setDrawer] = useState<Order | null>(null);

  const life = useMemo(() => lifetimeSeller(allOrders, sellerId), [allOrders, sellerId]);
  const series = useMemo(() => buildSeries(allOrders, RANGE_DAYS[range], { sellerId }), [allOrders, range, sellerId]);
  const totals = sumSeries(series);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const statusData = (['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const).map((s) => ({ name: s[0].toUpperCase() + s.slice(1), value: orders.filter((o) => (s === 'confirmed' ? ['confirmed', 'processing'].includes(o.status) : s === 'shipped' ? ['shipped', 'out_for_delivery'].includes(o.status) : s === 'cancelled' ? ['cancelled', 'refunded'].includes(o.status) : o.status === s)).length }));
  const top = topProducts(products, allOrders, sellerId, 6);
  const lowStock = products.filter((p) => p.status === 'approved' && p.stock <= p.lowStockThreshold);

  const cols: Column<SellerOrder>[] = [
    { key: 'id', header: 'Order ID', primary: true, render: (o) => <span className="font-mono text-xs font-bold text-brand-700">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'customer', header: 'Customer', render: (o) => <span className="font-medium">{o.customerName}</span>, sortValue: (o) => o.customerName },
    { key: 'products', header: 'Products', render: (o) => <span className="line-clamp-1 max-w-[200px] text-ink-soft">{o.items.map((i) => i.title).join(', ')}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (o) => <b className="tabular-nums">{formatPKR(o.sellerTotal)}</b>, sortValue: (o) => o.sellerTotal },
    { key: 'payment', header: 'Payment', render: (o) => <span className="text-xs">{PAYMENT_NAME[o.payment]}</span> },
    { key: 'date', header: 'Date', render: (o) => <span className="text-ink-soft">{formatShortDate(o.createdAt)}</span>, sortValue: (o) => o.createdAt },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status },
  ];

  return (
    <>
      <PageHeader eyebrow={new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })} title={`${greeting()}, ${seller.name} 👋`} subtitle="Here's what's happening with your store today."
        actions={<><LinkButton to="/seller/orders" variant="outline">View orders</LinkButton><LinkButton to="/seller/products/new"><Plus className="h-4 w-4" />Add Product</LinkButton></>} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard loading={loading} featured label="Total Sales" value={formatPKRCompact(life.revenue)} icon={<Wallet className="h-5 w-5" />} delta={trend(allOrders, 30, 'revenue', sellerId)} hint="Lifetime revenue" />
        <KpiCard loading={loading} label="Orders" value={formatNumber(life.orders)} icon={<ShoppingCart className="h-5 w-5" />} delta={trend(allOrders, 30, 'orders', sellerId)} hint="All time" />
        <KpiCard loading={loading} label="Products" value={products.filter((p) => p.status !== 'rejected').length} icon={<Package className="h-5 w-5" />} tone="violet" hint={`${products.filter((p) => p.status === 'pending').length} pending approval`} />
        <KpiCard loading={loading} label="Customers" value={formatNumber(life.customers)} icon={<Users className="h-5 w-5" />} tone="accent" hint="Unique buyers" />
        <KpiCard loading={loading} label="Pending Orders" value={pending} icon={<Clock className="h-5 w-5" />} tone="warning" hint="Confirm within 24h" />
        <KpiCard loading={loading} label="Refunds" value={returns.length} icon={<RotateCcw className="h-5 w-5" />} tone="danger" hint={`${returns.filter((r) => r.status === 'requested').length} awaiting action`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_380px]">
        <ChartCard loading={loading} title="Sales Overview" subtitle={`${formatPKR(totals.revenue)} revenue · ${formatNumber(totals.orders)} orders · AOV ${formatPKR(totals.orders ? totals.revenue / totals.orders : 0)}`} height={300}
          action={<div className="flex flex-wrap items-center gap-2"><Tabs variant="pill" size="sm" value={metric} onChange={setMetric} tabs={[{ value: 'revenue', label: 'Revenue' }, { value: 'orders', label: 'Orders' }, { value: 'aov', label: 'AOV' }]} /><RangeFilter value={range} onChange={setRange} /></div>}>
          <RevenueChart data={series} metric={metric} color={metric === 'orders' ? CHART.cyan : metric === 'aov' ? CHART.violet : CHART.indigo} compare />
        </ChartCard>
        <ChartCard loading={loading} title="Orders by Status" subtitle={`${orders.length} recent orders`} height={300}>
          <SimpleBars data={statusData} dataKey="value" nameKey="name" horizontal colors={[CHART.amber, CHART.indigo, CHART.violet, CHART.cyan, CHART.emerald, CHART.slate]} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Top Products" subtitle="By lifetime revenue" action={<Link to="/seller/products" className="text-sm font-semibold text-brand-600 hover:underline">All products</Link>} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-y border-line bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft">{['Product', 'SKU', 'Price', 'Stock', 'Units Sold', 'Revenue', 'Rating', 'Status', ''].map((h) => <th key={h} className="px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>
                {top.map(({ product: p, units, revenue }) => (
                  <tr key={p.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-10 w-10 shrink-0 rounded-lg" /><span className="line-clamp-1 max-w-[200px] font-medium">{p.title}</span></div></td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{p.sku}</td>
                    <td className="px-4 py-3 tabular-nums">{formatPKR(p.price)}</td>
                    <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(units)}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{formatPKRCompact(revenue)}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.rating}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={p.stock === 0 ? 'out_of_stock' : p.stock <= p.lowStockThreshold ? 'low_stock' : 'active'} /></td>
                    <td className="px-4 py-3"><Link to={`/seller/products/${p.id}`} className="text-xs font-semibold text-brand-600 hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-bold"><AlertTriangle className="h-4 w-4 text-amber-500" />Needs attention</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-amber-50 p-3"><span><b>{pending}</b> orders awaiting confirmation</span><Link to="/seller/orders" className="text-xs font-semibold text-amber-700">Review</Link></li>
            <li className="flex items-center justify-between rounded-lg bg-red-50 p-3"><span><b>{lowStock.length}</b> products low or out of stock</span><Link to="/seller/inventory" className="text-xs font-semibold text-red-700">Restock</Link></li>
            <li className="flex items-center justify-between rounded-lg bg-brand-50 p-3"><span><b>{products.filter((p) => p.status === 'pending').length}</b> listings in moderation</span><Link to="/seller/products" className="text-xs font-semibold text-brand-700">View</Link></li>
            <li className="flex items-center justify-between rounded-lg bg-violet-50 p-3"><span>11.11 Mega Sale nominations open</span><Link to="/seller/promotions" className="text-xs font-semibold text-violet-700">Join</Link></li>
          </ul>
          <div className="mt-5 rounded-xl bg-brand-gradient p-4 text-white">
            <p className="text-xs text-white/75">Store health</p>
            <p className="text-2xl font-extrabold">{seller.rating} ★ · {seller.positive}%</p>
            <p className="text-xs text-white/75">{seller.responseRate}% response rate · Top 5% seller</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent Orders" subtitle="Click a row to view details and update status" action={<Link to="/seller/orders" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">All orders<ArrowRight className="h-4 w-4" /></Link>} />
        <div className="mt-2"><DataTable data={orders.slice(0, 8)} columns={cols} rowKey={(o) => o.id} selectable={false} pageSize={8} loading={loading} onRowClick={(o) => setDrawer(o)} /></div>
      </Card>
      <OrderDrawer order={drawer} onClose={() => setDrawer(null)} scope="seller" />
    </>
  );
}
