import { useMemo, useState } from 'react';
import { Wallet, ShoppingCart, Users, Percent, Receipt } from 'lucide-react';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useCategoryMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard, ChartCard, RangeFilter, CHART } from '@/components/dashboard';
import { RevenueOrdersCombo, SimpleBars, Donut, RevenueChart } from '@/components/dashboard/Charts';
import { Card, CardHeader, ProgressBar } from '@/components/ui/Display';
import { SmartImage } from '@/components/common/SmartImage';
import { buildSeries, sumSeries, trend, topProducts, RANGE_DAYS, type RangeKey } from '@/utils/analytics';
import { TRAFFIC_SOURCES, CITY_SHARE } from '@/data/history';
import { formatPKR, formatPKRCompact, formatNumber } from '@/utils/format';

export default function SellerAnalytics() {
  usePageMeta('Analytics · Seller Center');
  const { sellerId, products } = useSeller();
  const orders = useMarket((s) => s.orders);
  const cats = useCategoryMap();
  const loading = useSimulatedLoad('sanal', 600);
  const [range, setRange] = useState<RangeKey>('30d');
  const series = useMemo(() => buildSeries(orders, RANGE_DAYS[range], { sellerId }), [orders, range, sellerId]);
  const t = sumSeries(series);
  const visitors = Math.round(t.orders * 31.5);
  const conv = (t.orders / Math.max(1, visitors)) * 100;
  const top = topProducts(products, orders, sellerId, 8);
  const byCat = Object.entries(products.reduce<Record<string, number>>((m, p) => { m[p.subcategory] = (m[p.subcategory] ?? 0) + p.sold * p.price; return m; }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const regions = Object.entries(CITY_SHARE).slice(0, 8).map(([city, w]) => ({ city, value: Math.round(t.revenue * w) }));
  const traffic = series.map((s) => ({ ...s, customers: Math.round(s.orders * 31.5) }));
  return (
    <>
      <PageHeader title="Analytics" subtitle="Understand what sells, where and why" actions={<RangeFilter value={range} onChange={setRange} />} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <KpiCard loading={loading} featured label="Revenue" value={formatPKRCompact(t.revenue)} icon={<Wallet className="h-5 w-5" />} delta={trend(orders, RANGE_DAYS[range], 'revenue', sellerId)} />
        <KpiCard loading={loading} label="Orders" value={formatNumber(t.orders)} icon={<ShoppingCart className="h-5 w-5" />} delta={trend(orders, RANGE_DAYS[range], 'orders', sellerId)} />
        <KpiCard loading={loading} label="Customers" value={formatNumber(t.customers)} icon={<Users className="h-5 w-5" />} tone="accent" />
        <KpiCard loading={loading} label="Conversion Rate" value={`${conv.toFixed(2)}%`} icon={<Percent className="h-5 w-5" />} tone="violet" hint={`${formatNumber(visitors)} store visits`} />
        <KpiCard loading={loading} label="Avg. Order Value" value={formatPKR(t.orders ? t.revenue / t.orders : 0)} icon={<Receipt className="h-5 w-5" />} tone="success" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartCard loading={loading} title="Revenue & Orders" subtitle="Bars: orders · Line: revenue" height={300}><RevenueOrdersCombo data={series} /></ChartCard>
        <ChartCard loading={loading} title="Traffic" subtitle="Store visits over time" height={300}><RevenueChart data={traffic} metric="customers" color={CHART.violet} /></ChartCard>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard loading={loading} title="Top Categories" subtitle="Lifetime revenue by subcategory" height={260}><SimpleBars data={byCat} dataKey="value" nameKey="name" horizontal money colors={CHART.series} /></ChartCard>
        <ChartCard loading={loading} title="Traffic Sources" height={260}><Donut data={TRAFFIC_SOURCES} center={{ label: 'visits', value: formatNumber(visitors) }} /></ChartCard>
        <ChartCard loading={loading} title="Sales by Region" subtitle={`${cats[products[0]?.category]?.short ?? ''} store · Pakistan`} height={260}><SimpleBars data={regions} dataKey="value" nameKey="city" money color={CHART.cyan} /></ChartCard>
      </div>
      <Card className="mt-4">
        <CardHeader title="Product Performance" subtitle="Units, revenue and share of store sales" />
        <ul className="mt-3 divide-y divide-line">
          {top.map(({ product: p, units, revenue }, i) => (
            <li key={p.id} className="flex items-center gap-4 px-5 py-3">
              <span className="w-5 text-sm font-bold text-ink-soft">{i + 1}</span>
              <SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.title}</p><ProgressBar value={(revenue / top[0].revenue) * 100} className="mt-1.5" /></div>
              <div className="w-24 text-right text-sm"><p className="font-bold tabular-nums">{formatPKRCompact(revenue)}</p><p className="text-xs text-ink-soft">{formatNumber(units)} units</p></div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
